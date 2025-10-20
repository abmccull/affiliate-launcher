import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";
import { notifyApplicationStatus } from "@/lib/notifications";

interface RouteParams {
	params: Promise<{
		affiliateId: string;
	}>;
}

/**
 * PUT /api/affiliates/[affiliateId]/reject
 * Reject an affiliate application
 */
export async function PUT(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { affiliateId } = await context.params;
		const body = await request.json();
		const { companyId, experienceId } = body;

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Verify affiliate belongs to company's program
		const affiliate = await prisma.affiliate.findUnique({
			where: { id: affiliateId },
			include: { program: true },
		});

		if (!affiliate || affiliate.program.companyId !== companyId) {
			return NextResponse.json(
				{ error: "Affiliate not found" },
				{ status: 404 },
			);
		}

		// Update to rejected
		const updatedAffiliate = await prisma.affiliate.update({
			where: { id: affiliateId },
			data: {
				status: "rejected",
				rejectedAt: new Date(),
			},
		});

		// Send notification if experienceId provided
		if (experienceId) {
			try {
				await notifyApplicationStatus(
					experienceId,
					affiliate.userId,
					"rejected",
				);
			} catch (notifError) {
				console.error("Error sending notification:", notifError);
			}
		}

		console.log("[TELEMETRY] affiliate_rejected", {
			affiliateId,
			programId: affiliate.programId,
		});

		return NextResponse.json({ affiliate: updatedAffiliate });
	} catch (error) {
		console.error("Error rejecting affiliate:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

