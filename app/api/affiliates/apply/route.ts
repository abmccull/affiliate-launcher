import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireExperienceAccess } from "@/lib/access";

/**
 * POST /api/affiliates/apply
 * Apply to become an affiliate
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const body = await request.json();
		const { programId, experienceId } = body;

		if (!programId || !experienceId) {
			return NextResponse.json(
				{ error: "programId and experienceId are required" },
				{ status: 400 },
			);
		}

		// Check user has access to the experience
		await requireExperienceAccess(experienceId, userId);

		// Verify program exists and is active
		const program = await prisma.program.findUnique({
			where: { id: programId },
		});

		if (!program || program.status !== "active") {
			return NextResponse.json(
				{ error: "Program not found or inactive" },
				{ status: 400 },
			);
		}

		// Check if already applied
		const existing = await prisma.affiliate.findUnique({
			where: {
				programId_userId: {
					programId,
					userId,
				},
			},
		});

		if (existing) {
			return NextResponse.json(
				{
					error: "Already applied to this program",
					affiliate: existing,
				},
				{ status: 400 },
			);
		}

		// Create application
		const affiliate = await prisma.affiliate.create({
			data: {
				programId,
				userId,
				status: "pending",
			},
		});

		console.log("[TELEMETRY] affiliate_applied", {
			affiliateId: affiliate.id,
			programId,
			userId,
		});

		return NextResponse.json({ affiliate }, { status: 201 });
	} catch (error) {
		console.error("Error applying as affiliate:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

