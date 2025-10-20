import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whopSdk } from "@/lib/whop-sdk";
import { verifyUserFromHeaders, requireCompanyAdmin } from "@/lib/access";
import { notifyNewCreative } from "@/lib/notifications";

/**
 * POST /api/creatives/upload
 * Upload a creative using Whop's attachment API
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await verifyUserFromHeaders(request.headers);
		const formData = await request.formData();

		const file = formData.get("file") as File;
		const offerId = formData.get("offerId") as string;
		const companyId = formData.get("companyId") as string;
		const experienceId = formData.get("experienceId") as string | null;
		const title = formData.get("title") as string;
		const notes = formData.get("notes") as string | null;
		const type = formData.get("type") as string;

		if (!file || !offerId || !companyId || !title || !type) {
			return NextResponse.json(
				{ error: "file, offerId, companyId, title, and type are required" },
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

		// Upload file to Whop
		const uploadResponse = await whopSdk.attachments.uploadAttachment({
			file: new File([await file.arrayBuffer()], file.name, {
				type: file.type,
			}),
			record: "forum_post", // Using forum_post as a generic record type
		});

		if (!uploadResponse.directUploadId || !uploadResponse.attachment?.source) {
			throw new Error("Failed to upload file to Whop");
		}

		// Save creative metadata to database
		const creative = await prisma.creative.create({
			data: {
				offerId,
				type,
				url: uploadResponse.attachment.source.url,
				title,
				notes,
				metadata: {
					directUploadId: uploadResponse.directUploadId,
					fileName: file.name,
					fileSize: file.size,
					mimeType: file.type,
				},
			},
		});

		// Send notification to affiliates if experienceId provided
		if (experienceId) {
			try {
				await notifyNewCreative(experienceId, title);
			} catch (notifError) {
				console.error("Error sending notification:", notifError);
			}
		}

		console.log("[TELEMETRY] creative_uploaded", {
			creativeId: creative.id,
			offerId,
			type,
		});

		return NextResponse.json({ creative }, { status: 201 });
	} catch (error) {
		console.error("Error uploading creative:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		const status = message.includes("Forbidden") ? 403 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}

