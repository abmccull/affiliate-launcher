import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whopSdk } from "@/lib/whop-sdk";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";
import { notifyPayoutIssued } from "@/lib/notifications";

/**
 * POST /api/payouts/process
 * Process batch payouts to selected affiliates
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const body = await request.json();
		const {
			companyId,
			programId,
			experienceId,
			affiliateIds,
			currency = "usd",
		} = body;

		if (!companyId || !programId || !affiliateIds || affiliateIds.length === 0) {
			return NextResponse.json(
				{ error: "companyId, programId, and affiliateIds are required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Verify program belongs to company
		const program = await prisma.program.findUnique({
			where: { id: programId },
		});

		if (!program || program.companyId !== companyId) {
			return NextResponse.json({ error: "Program not found" }, { status: 404 });
		}

		// Get company ledger account
		const ledgerAccount = await whopSdk.companies.getCompanyLedgerAccount({
			companyId,
		});

		if (!ledgerAccount.company?.ledgerAccount?.id) {
			return NextResponse.json(
				{ error: "Company ledger account not found" },
				{ status: 400 },
			);
		}

		const results = [];
		let successCount = 0;
		let totalAmount = 0;

		// Process each affiliate
		for (const affiliateId of affiliateIds) {
			try {
				// Get affiliate and pending earnings
				const affiliate = await prisma.affiliate.findUnique({
					where: { id: affiliateId },
					include: {
						earningsEvents: {
							where: { type: "conversion" },
						},
					},
				});

				if (!affiliate) {
					results.push({
						affiliateId,
						success: false,
						error: "Affiliate not found",
					});
					continue;
				}

				// Calculate pending amount
				const pendingAmount = affiliate.earningsEvents.reduce(
					(sum, e) => sum + e.amount,
					0,
				);

				if (pendingAmount <= 0) {
					results.push({
						affiliateId,
						success: false,
						error: "No pending earnings",
					});
					continue;
				}

				// Pay user via Whop
				await whopSdk.payments.payUser({
					amount: pendingAmount,
					currency,
					destinationId: affiliate.userId,
					ledgerAccountId: ledgerAccount.company.ledgerAccount.id,
					transferFee: ledgerAccount.company.ledgerAccount.transferFee,
				});

				// Record payout event
				await prisma.earningsEvent.create({
					data: {
						affiliateId,
						type: "payout",
						amount: pendingAmount,
						currency,
						sourceRef: `batch_${Date.now()}`,
					},
				});

				// Send notification
				if (experienceId) {
					try {
						await notifyPayoutIssued(
							experienceId,
							affiliate.userId,
							pendingAmount,
							currency,
						);
					} catch (notifError) {
						console.error("Notification error:", notifError);
					}
				}

				results.push({
					affiliateId,
					userId: affiliate.userId,
					amount: pendingAmount,
					success: true,
				});

				successCount++;
				totalAmount += pendingAmount;
			} catch (error) {
				console.error(`Error processing payout for ${affiliateId}:`, error);
				results.push({
					affiliateId,
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		// Create payout batch record
		const payoutBatch = await prisma.payoutBatch.create({
			data: {
				programId,
				total: totalAmount,
				count: successCount,
				status: successCount === affiliateIds.length ? "completed" : "partial",
				metadata: { results },
				processedAt: new Date(),
			},
		});

		console.log("[TELEMETRY] payout_processed", {
			batchId: payoutBatch.id,
			programId,
			successCount,
			totalAmount,
		});

		return NextResponse.json({
			batch: payoutBatch,
			results,
			successCount,
			totalAmount,
		});
	} catch (error) {
		console.error("Error processing payouts:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

