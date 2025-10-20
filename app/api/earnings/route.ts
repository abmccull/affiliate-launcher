import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

/**
 * GET /api/earnings?programId={programId}&companyId={companyId}
 * Get aggregated earnings by affiliate
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { searchParams } = new URL(request.url);
		const programId = searchParams.get("programId");
		const companyId = searchParams.get("companyId");
		const status = searchParams.get("status"); // "pending" or "paid"

		if (!programId || !companyId) {
			return NextResponse.json(
				{ error: "programId and companyId are required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Get affiliates for the program
		const affiliates = await prisma.affiliate.findMany({
			where: { programId },
			include: {
				earningsEvents: {
					where: status
						? {
								type: status === "paid" ? "payout" : "conversion",
							}
						: undefined,
				},
			},
		});

		// Aggregate earnings by affiliate
		const earningsByAffiliate = affiliates.map((affiliate) => {
			const clicks = affiliate.earningsEvents.filter(
				(e) => e.type === "click",
			).length;
			const conversions = affiliate.earningsEvents.filter(
				(e) => e.type === "conversion",
			).length;
			const pendingAmount = affiliate.earningsEvents
				.filter((e) => e.type === "conversion")
				.reduce((sum, e) => sum + e.amount, 0);
			const paidAmount = affiliate.earningsEvents
				.filter((e) => e.type === "payout")
				.reduce((sum, e) => sum + e.amount, 0);

			return {
				affiliateId: affiliate.id,
				userId: affiliate.userId,
				status: affiliate.status,
				tier: affiliate.tier,
				clicks,
				conversions,
				pendingAmount,
				paidAmount,
				totalAmount: pendingAmount + paidAmount,
			};
		});

		// Sort by total earnings
		earningsByAffiliate.sort((a, b) => b.totalAmount - a.totalAmount);

		// Calculate totals
		const totals = {
			totalAffiliates: affiliates.length,
			totalClicks: earningsByAffiliate.reduce((sum, a) => sum + a.clicks, 0),
			totalConversions: earningsByAffiliate.reduce(
				(sum, a) => sum + a.conversions,
				0,
			),
			totalPending: earningsByAffiliate.reduce(
				(sum, a) => sum + a.pendingAmount,
				0,
			),
			totalPaid: earningsByAffiliate.reduce(
				(sum, a) => sum + a.paidAmount,
				0,
			),
		};

		return NextResponse.json({
			earningsByAffiliate,
			totals,
		});
	} catch (error) {
		console.error("Error fetching earnings:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

