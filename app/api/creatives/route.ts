import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

/**
 * GET /api/creatives?offerId={offerId}&companyId={companyId}
 * List creatives, optionally filtered by offer
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { searchParams } = new URL(request.url);
		const offerId = searchParams.get("offerId");
		const companyId = searchParams.get("companyId");
		const programId = searchParams.get("programId");

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Build where clause
		const where: any = {};

		if (offerId) {
			where.offerId = offerId;
		} else if (programId) {
			// Get all offers for program
			where.offer = {
				programId,
			};
		}

		const creatives = await prisma.creative.findMany({
			where,
			include: {
				offer: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({ creatives });
	} catch (error) {
		console.error("Error fetching creatives:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

