import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireExperienceAccess } from "@/lib/access";

/**
 * GET /api/affiliates/me/earnings?programId={programId}&experienceId={experienceId}
 * Get current user's affiliate earnings
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { searchParams } = new URL(request.url);
		const programId = searchParams.get("programId");
		const experienceId = searchParams.get("experienceId");

		if (!programId || !experienceId) {
			return NextResponse.json(
				{ error: "programId and experienceId are required" },
				{ status: 400 },
			);
		}

		// Check experience access
		await requireExperienceAccess(experienceId, userId);

		// Find affiliate record
		const affiliate = await prisma.affiliate.findUnique({
			where: {
				programId_userId: {
					programId,
					userId,
				},
			},
			include: {
				program: true,
				earningsEvents: {
					orderBy: { createdAt: "desc" },
				},
			},
		});

		if (!affiliate) {
			return NextResponse.json(
				{ error: "No affiliate record found" },
				{ status: 404 },
			);
		}

		// Calculate earnings breakdown
		const clicks = affiliate.earningsEvents.filter(
			(e) => e.type === "click",
		).length;
		const conversions = affiliate.earningsEvents.filter(
			(e) => e.type === "conversion",
		);
		const payouts = affiliate.earningsEvents.filter((e) => e.type === "payout");

		const pendingAmount = conversions.reduce((sum, e) => sum + e.amount, 0);
		const paidAmount = payouts.reduce((sum, e) => sum + e.amount, 0);

		const summary = {
			clicks,
			conversionsCount: conversions.length,
			pendingAmount,
			paidAmount,
			totalEarned: pendingAmount + paidAmount,
			commissionRate:
				affiliate.customRate ?? affiliate.program.defaultRate,
			tier: affiliate.tier,
			status: affiliate.status,
		};

		return NextResponse.json({
			summary,
			recentEvents: affiliate.earningsEvents.slice(0, 20),
		});
	} catch (error) {
		console.error("Error fetching affiliate earnings:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

