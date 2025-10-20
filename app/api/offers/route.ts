import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

/**
 * GET /api/offers?programId={programId}&companyId={companyId}
 * List all offers for a program
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { searchParams } = new URL(request.url);
		const programId = searchParams.get("programId");
		const companyId = searchParams.get("companyId");
		const visibility = searchParams.get("visibility");

		if (!programId || !companyId) {
			return NextResponse.json(
				{ error: "programId and companyId are required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		const where: any = { programId };
		if (visibility) {
			where.visibility = visibility;
		}

		const offers = await prisma.offer.findMany({
			where,
			include: {
				_count: {
					select: {
						creatives: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({ offers });
	} catch (error) {
		console.error("Error fetching offers:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

/**
 * POST /api/offers
 * Create a new offer
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const body = await request.json();
		const {
			programId,
			companyId,
			experienceId,
			name,
			description,
			terms,
			visibility,
			startAt,
			endAt,
			rateOverride,
		} = body;

		if (!programId || !companyId || !name || !description) {
			return NextResponse.json(
				{ error: "programId, companyId, name, and description are required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Verify program exists and belongs to company
		const program = await prisma.program.findUnique({
			where: { id: programId },
		});

		if (!program || program.companyId !== companyId) {
			return NextResponse.json(
				{ error: "Invalid program or company" },
				{ status: 400 },
			);
		}

		const offer = await prisma.offer.create({
			data: {
				programId,
				experienceId,
				name,
				description,
				terms,
				visibility: visibility ?? "public",
				startAt: startAt ? new Date(startAt) : null,
				endAt: endAt ? new Date(endAt) : null,
				rateOverride: rateOverride ? parseFloat(rateOverride) : null,
			},
		});

		// Log telemetry
		console.log("[TELEMETRY] offer_created", {
			offerId: offer.id,
			programId,
			userId,
		});

		return NextResponse.json({ offer }, { status: 201 });
	} catch (error) {
		console.error("Error creating offer:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

