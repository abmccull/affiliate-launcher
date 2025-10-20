import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

/**
 * GET /api/affiliates?programId={programId}&companyId={companyId}&status={status}
 * List affiliates for a program
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { searchParams } = new URL(request.url);
		const programId = searchParams.get("programId");
		const companyId = searchParams.get("companyId");
		const status = searchParams.get("status");

		if (!programId || !companyId) {
			return NextResponse.json(
				{ error: "programId and companyId are required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		const where: any = { programId };
		if (status) {
			where.status = status;
		}

		const affiliates = await prisma.affiliate.findMany({
			where,
			include: {
				_count: {
					select: {
						earningsEvents: true,
					},
				},
			},
			orderBy: { appliedAt: "desc" },
		});

		return NextResponse.json({ affiliates });
	} catch (error) {
		console.error("Error fetching affiliates:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

