import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";
import { notifyNewOffer } from "@/lib/notifications";

interface RouteParams {
	params: Promise<{
		offerId: string;
	}>;
}

/**
 * GET /api/offers/[offerId]?companyId={companyId}
 * Get a single offer
 */
export async function GET(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { offerId } = await context.params;
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

		const offer = await prisma.offer.findUnique({
			where: { id: offerId },
			include: {
				program: true,
				creatives: true,
				_count: {
					select: {
						earningsEvents: true,
					},
				},
			},
		});

		if (!offer || offer.program.companyId !== companyId) {
			return NextResponse.json({ error: "Offer not found" }, { status: 404 });
		}

		return NextResponse.json({ offer });
	} catch (error) {
		console.error("Error fetching offer:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

/**
 * PUT /api/offers/[offerId]
 * Update an offer
 */
export async function PUT(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { offerId } = await context.params;
		const body = await request.json();
		const {
			companyId,
			name,
			description,
			terms,
			visibility,
			startAt,
			endAt,
			rateOverride,
			isPublished,
			experienceId,
		} = body;

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Verify offer belongs to company
		const existingOffer = await prisma.offer.findUnique({
			where: { id: offerId },
			include: { program: true },
		});

		if (!existingOffer || existingOffer.program.companyId !== companyId) {
			return NextResponse.json({ error: "Offer not found" }, { status: 404 });
		}

		const wasPublished = existingOffer.isPublished;

		const offer = await prisma.offer.update({
			where: { id: offerId },
			data: {
				name,
				description,
				terms,
				visibility,
				startAt: startAt ? new Date(startAt) : undefined,
				endAt: endAt ? new Date(endAt) : undefined,
				rateOverride: rateOverride ? parseFloat(rateOverride) : null,
				isPublished,
				experienceId,
			},
		});

		// If newly published, send notification
		if (isPublished && !wasPublished && experienceId) {
			try {
				await notifyNewOffer(experienceId, offer.name, offer.id);
				console.log("[TELEMETRY] offer_published", {
					offerId: offer.id,
					experienceId,
					userId,
				});
			} catch (notifError) {
				console.error("Error sending notification:", notifError);
				// Don't fail the request if notification fails
			}
		}

		return NextResponse.json({ offer });
	} catch (error) {
		console.error("Error updating offer:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

/**
 * DELETE /api/offers/[offerId]?companyId={companyId}
 * Soft delete an offer
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { offerId } = await context.params;
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

		// Verify offer belongs to company
		const offer = await prisma.offer.findUnique({
			where: { id: offerId },
			include: { program: true },
		});

		if (!offer || offer.program.companyId !== companyId) {
			return NextResponse.json({ error: "Offer not found" }, { status: 404 });
		}

		// Delete the offer (cascade will handle related records)
		await prisma.offer.delete({
			where: { id: offerId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting offer:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

