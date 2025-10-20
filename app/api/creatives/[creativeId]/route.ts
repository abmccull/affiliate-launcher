import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

interface RouteParams {
	params: Promise<{
		creativeId: string;
	}>;
}

/**
 * DELETE /api/creatives/[creativeId]?companyId={companyId}
 * Delete a creative
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const { creativeId } = await context.params;
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

		// Verify creative belongs to company
		const creative = await prisma.creative.findUnique({
			where: { id: creativeId },
			include: {
				offer: {
					include: {
						program: true,
					},
				},
			},
		});

		if (!creative || creative.offer.program.companyId !== companyId) {
			return NextResponse.json(
				{ error: "Creative not found" },
				{ status: 404 },
			);
		}

		// Delete creative
		await prisma.creative.delete({
			where: { id: creativeId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting creative:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

