import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";

/**
 * GET /api/programs?companyId={companyId}
 * Get program for a company
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
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

		const program = await prisma.program.findUnique({
			where: { companyId },
			include: {
				_count: {
					select: {
						offers: true,
						affiliates: true,
					},
				},
			},
		});

		return NextResponse.json({ program });
	} catch (error) {
		console.error("Error fetching program:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

/**
 * POST /api/programs
 * Create or update program for a company
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const body = await request.json();
		const { companyId, defaultRate, payoutFrequency, cookieWindow, status } =
			body;

		if (!companyId || defaultRate === undefined || !payoutFrequency) {
			return NextResponse.json(
				{
					error: "companyId, defaultRate, and payoutFrequency are required",
				},
				{ status: 400 },
			);
		}

		// Check admin access
		await requireCompanyAdmin(companyId, userId);

		// Upsert program
		const program = await prisma.program.upsert({
			where: { companyId },
			update: {
				defaultRate,
				payoutFrequency,
				cookieWindow: cookieWindow ?? 30,
				status: status ?? "active",
			},
			create: {
				companyId,
				defaultRate,
				payoutFrequency,
				cookieWindow: cookieWindow ?? 30,
				status: status ?? "active",
			},
		});

		// Log telemetry
		console.log("[TELEMETRY] program_created", {
			programId: program.id,
			companyId,
			userId,
		});

		return NextResponse.json({ program }, { status: 200 });
	} catch (error) {
		console.error("Error creating/updating program:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

