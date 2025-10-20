import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

interface RouteParams {
	params: Promise<{
		affiliateId: string;
	}>;
}

/**
 * GET /api/affiliates/[affiliateId]?companyId={companyId}
 * Get affiliate details with earnings
 */
export async function GET(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { affiliateId } = await context.params;
		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		const affiliate = await prisma.affiliate.findUnique({
			where: { id: affiliateId },
			include: {
				program: true,
				earningsEvents: {
					orderBy: { createdAt: "desc" },
					take: 50,
				},
				_count: {
					select: {
						earningsEvents: true,
					},
				},
			},
		});

		if (!affiliate || affiliate.program.companyId !== companyId) {
			return NextResponse.json(
				{ error: "Affiliate not found" },
				{ status: 404 },
			);
		}

		// Calculate earnings summary
		const earningsSummary = await prisma.earningsEvent.groupBy({
			by: ["type"],
			where: { affiliateId },
			_sum: {
				amount: true,
			},
			_count: true,
		});

		return NextResponse.json({ affiliate, earningsSummary });
	} catch (error) {
		console.error("Error fetching affiliate:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

/**
 * PUT /api/affiliates/[affiliateId]
 * Update affiliate custom rates, tier, etc.
 */
export async function PUT(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { affiliateId } = await context.params;
		const body = await request.json();
		const { companyId, customRate, tier, rateExpiry } = body;

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Verify affiliate belongs to company
		const existing = await prisma.affiliate.findUnique({
			where: { id: affiliateId },
			include: { program: true },
		});

		if (!existing || existing.program.companyId !== companyId) {
			return NextResponse.json(
				{ error: "Affiliate not found" },
				{ status: 404 },
			);
		}

		const affiliate = await prisma.affiliate.update({
			where: { id: affiliateId },
			data: {
				customRate: customRate ? parseFloat(customRate) : undefined,
				tier,
				rateExpiry: rateExpiry ? new Date(rateExpiry) : undefined,
			},
		});

		return NextResponse.json({ affiliate });
	} catch (error) {
		console.error("Error updating affiliate:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

