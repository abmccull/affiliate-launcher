import { whopSdk } from "./whop-sdk";

/**
 * Notification helper functions for sending push notifications via Whop
 */

interface NotificationOptions {
	title: string;
	content: string;
	restPath?: string;
	senderUserId?: string;
	isMention?: boolean;
}

/**
 * Send notification to all members of an experience
 */
export async function notifyExperienceMembers(
	experienceId: string,
	options: NotificationOptions,
): Promise<void> {
	try {
		await whopSdk.notifications.sendPushNotification({
			title: options.title,
			content: options.content,
			experienceId,
			restPath: options.restPath,
			senderUserId: options.senderUserId,
			isMention: options.isMention ?? false,
		});
	} catch (error) {
		console.error("Error sending experience notification:", error);
		throw error;
	}
}

/**
 * Send notification to company admins
 */
export async function notifyCompanyAdmins(
	companyTeamId: string,
	options: NotificationOptions,
): Promise<void> {
	try {
		await whopSdk.notifications.sendPushNotification({
			title: options.title,
			content: options.content,
			companyTeamId,
			restPath: options.restPath,
			senderUserId: options.senderUserId,
			isMention: options.isMention ?? false,
		});
	} catch (error) {
		console.error("Error sending company notification:", error);
		throw error;
	}
}

/**
 * Send notification to specific users in an experience
 */
export async function notifySpecificUsers(
	experienceId: string,
	userIds: string[],
	options: NotificationOptions,
): Promise<void> {
	try {
		await whopSdk.notifications.sendPushNotification({
			title: options.title,
			content: options.content,
			experienceId,
			userIds,
			restPath: options.restPath,
			senderUserId: options.senderUserId,
			isMention: options.isMention ?? false,
		});
	} catch (error) {
		console.error("Error sending user-specific notification:", error);
		throw error;
	}
}

/**
 * Notify about new offer published
 */
export async function notifyNewOffer(
	experienceId: string,
	offerName: string,
	offerId: string,
): Promise<void> {
	await notifyExperienceMembers(experienceId, {
		title: "New Affiliate Offer Available! 🎉",
		content: `Check out our new offer: ${offerName}`,
		restPath: `/offers/${offerId}`,
		isMention: true, // Send immediate push notification
	});
}

/**
 * Notify about new creative uploaded
 */
export async function notifyNewCreative(
	experienceId: string,
	creativeTitle: string,
): Promise<void> {
	await notifyExperienceMembers(experienceId, {
		title: "New Marketing Creative Available",
		content: `${creativeTitle} is now ready for download`,
		restPath: "/creatives",
	});
}

/**
 * Notify admin about affiliate milestone
 */
export async function notifyMilestone(
	companyTeamId: string,
	message: string,
	restPath?: string,
): Promise<void> {
	await notifyCompanyAdmins(companyTeamId, {
		title: "Affiliate Milestone Reached! 🎯",
		content: message,
		restPath: restPath ?? "/earnings",
		isMention: true,
	});
}

/**
 * Notify affiliate about payout issued
 */
export async function notifyPayoutIssued(
	experienceId: string,
	userId: string,
	amount: number,
	currency: string = "USD",
): Promise<void> {
	await notifySpecificUsers(experienceId, [userId], {
		title: "Payout Processed! 💰",
		content: `Your commission of ${currency.toUpperCase()} $${amount.toFixed(2)} has been paid`,
		restPath: "/payouts",
		isMention: true,
	});
}

/**
 * Notify affiliate about application status
 */
export async function notifyApplicationStatus(
	experienceId: string,
	userId: string,
	status: "approved" | "rejected",
): Promise<void> {
	await notifySpecificUsers(experienceId, [userId], {
		title:
			status === "approved"
				? "Application Approved! ✅"
				: "Application Update",
		content:
			status === "approved"
				? "Your affiliate application has been approved. Start promoting now!"
				: "Thank you for your interest in our affiliate program.",
		restPath: "/",
		isMention: true,
	});
}

