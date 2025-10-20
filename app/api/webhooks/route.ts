import { waitUntil } from "@vercel/functions";
import { makeWebhookValidator } from "@whop/api";
import type { NextRequest } from "next/server";

const validateWebhook = makeWebhookValidator({
	webhookSecret: process.env.WHOP_WEBHOOK_SECRET ?? "fallback",
});

export async function POST(request: NextRequest): Promise<Response> {
	try {
		// Validate the webhook to ensure it's from Whop
		const webhookData = await validateWebhook(request);

		// Handle the webhook event
		if (webhookData.action === "payment.succeeded") {
			const { id, final_amount, amount_after_fees, currency, user_id, metadata } =
				webhookData.data;

			// Log payment success
			console.log("[WEBHOOK] payment.succeeded", {
				paymentId: id,
				userId: user_id,
				amount: final_amount,
				currency,
				metadata,
			});

			// Use waitUntil to run async handlers without blocking response
			waitUntil(
				handlePaymentSucceeded(
					id,
					user_id,
					final_amount,
					currency,
					amount_after_fees,
					metadata,
				),
			);
		}

		// Return 2xx quickly to avoid webhook retries
		return new Response("OK", { status: 200 });
	} catch (error) {
		console.error("[WEBHOOK] Error processing webhook:", error);
		// Still return 200 to prevent retries if validation failed
		return new Response("OK", { status: 200 });
	}
}

/**
 * Handle payment.succeeded webhook
 * This can be used for app subscription validation, affiliate tracking, etc.
 */
async function handlePaymentSucceeded(
	paymentId: string,
	userId: string | null | undefined,
	amount: number,
	currency: string,
	amountAfterFees: number | null | undefined,
	metadata: any,
) {
	try {
		// If metadata contains experienceId or offerId, this might be an affiliate-driven sale
		if (metadata?.experienceId) {
			console.log("[WEBHOOK] Affiliate-driven payment detected", {
				paymentId,
				experienceId: metadata.experienceId,
				offerId: metadata.offerId,
			});

			// TODO: Track conversion event for affiliate
			// This would create an EarningsEvent with type "conversion"
		}

		// For app subscription payments (Access Pass purchases)
		if (metadata?.accessPassId) {
			console.log("[WEBHOOK] App subscription payment", {
				paymentId,
				userId,
				accessPassId: metadata.accessPassId,
			});

			// TODO: Grant/extend app access based on subscription
		}

		console.log("[WEBHOOK] Payment processed successfully", { paymentId });
	} catch (error) {
		console.error("[WEBHOOK] Error in handlePaymentSucceeded:", error);
	}
}
