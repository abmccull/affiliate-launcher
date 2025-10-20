import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

/**
 * GET /api/payouts?programId={programId}&companyId={companyId}
 * Get payout batch history
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { searchParams } = new URL(request.url);
		const programId = searchParams.get("programId");
		const companyId = searchParams.get("companyId");

		if (!programId || !companyId) {
			return NextResponse.json(
				{ error: "programId and companyId are required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		const batches = await prisma.payoutBatch.findMany({
			where: { programId },
			orderBy: { runAt: "desc" },
			take: 50,
		});

		return NextResponse.json({ batches });
	} catch (error) {
		console.error("Error fetching payouts:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

