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
 * PUT /api/affiliates/[affiliateId]/approve
 * Approve an affiliate application
 */
export async function PUT(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { affiliateId } = await context.params;
		const body = await request.json();
		const { companyId, experienceId, customRate, tier } = body;

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

		// Update to approved
		const updatedAffiliate = await prisma.affiliate.update({
			where: { id: affiliateId },
			data: {
				status: "approved",
				approvedAt: new Date(),
				customRate: customRate ? parseFloat(customRate) : undefined,
				tier: tier ?? "standard",
			},
		});

		// Send notification if experienceId provided
		if (experienceId) {
			try {
				await notifyApplicationStatus(
					experienceId,
					affiliate.userId,
					"approved",
				);
			} catch (notifError) {
				console.error("Error sending notification:", notifError);
			}
		}

		console.log("[TELEMETRY] affiliate_approved", {
			affiliateId,
			programId: affiliate.programId,
			userId: affiliate.userId,
		});

		return NextResponse.json({ affiliate: updatedAffiliate });
	} catch (error) {
		console.error("Error approving affiliate:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

