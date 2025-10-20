import { whopSdk } from "@/lib/whop-sdk";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { ApplyButton } from "./apply-button";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const headersList = await headers();
	const { experienceId } = await params;

	// Verify user access
	const { userId } = await whopSdk.verifyUserToken(headersList);
	const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
		userId,
		experienceId,
	});

	if (!accessResult.hasAccess) {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">
						Access Denied
					</h1>
					<p>You need access to this experience to view the affiliate program.</p>
				</div>
			</div>
		);
	}

	const experience = await whopSdk.experiences.getExperience({ experienceId });
	const user = await whopSdk.users.getUser({ userId });

	// Get program for this experience's company
	const program = await prisma.program.findUnique({
		where: { companyId: experience.company.id },
	});

	if (!program || program.status !== "active") {
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						No Affiliate Program Available
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						This community doesn't have an active affiliate program yet.
					</p>
				</div>
			</div>
		);
	}

	// Check if user is already an affiliate
	const affiliate = await prisma.affiliate.findUnique({
		where: {
			programId_userId: {
				programId: program.id,
				userId,
			},
		},
	});

	// Get stats if approved
	let stats = null;
	if (affiliate?.status === "approved") {
		const earningsEvents = await prisma.earningsEvent.findMany({
			where: { affiliateId: affiliate.id },
		});

		const clicks = earningsEvents.filter((e) => e.type === "click").length;
		const conversions = earningsEvents.filter((e) => e.type === "conversion");
		const payouts = earningsEvents.filter((e) => e.type === "payout");

		stats = {
			clicks,
			conversions: conversions.length,
			pendingEarnings: conversions.reduce((sum, e) => sum + e.amount, 0),
			paidEarnings: payouts.reduce((sum, e) => sum + e.amount, 0),
		};
	}

	// Get available public offers
	const publicOffers = await prisma.offer.findMany({
		where: {
			programId: program.id,
			visibility: "public",
			isPublished: true,
		},
		take: 5,
	});

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Affiliate Program
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						{experience.name} - Earn commissions by promoting our offers
					</p>
				</div>

				{/* Application Status */}
				{!affiliate && (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							Join Our Affiliate Program
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-4">
							Earn <strong>{program.defaultRate}%</strong> commission on all
							referrals. Apply now to get started!
						</p>
						<ApplyButton
							programId={program.id}
							experienceId={experienceId}
						/>
					</div>
				)}

				{affiliate && affiliate.status === "pending" && (
					<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
						<h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
							Application Pending
						</h2>
						<p className="text-yellow-800 dark:text-yellow-300">
							Your affiliate application is under review. You'll be notified once
							it's approved!
						</p>
					</div>
				)}

				{affiliate && affiliate.status === "rejected" && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
						<h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
							Application Not Approved
						</h2>
						<p className="text-red-800 dark:text-red-300">
							Unfortunately, your affiliate application was not approved at this
							time.
						</p>
					</div>
				)}

				{/* Stats Dashboard (Approved Affiliates Only) */}
				{affiliate && affiliate.status === "approved" && stats && (
					<>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
								<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
									Total Clicks
								</div>
								<div className="text-2xl font-bold text-blue-600">
									{stats.clicks}
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
								<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
									Conversions
								</div>
								<div className="text-2xl font-bold text-green-600">
									{stats.conversions}
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
								<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
									Pending Earnings
								</div>
								<div className="text-2xl font-bold text-orange-600">
									${stats.pendingEarnings.toFixed(2)}
								</div>
							</div>

							<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
								<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
									Paid Out
								</div>
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									${stats.paidEarnings.toFixed(2)}
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							<Link
								href={`/experiences/${experienceId}/offers`}
								className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
							>
								View All Offers
							</Link>
							<Link
								href={`/experiences/${experienceId}/creatives`}
								className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
							>
								Download Creatives
							</Link>
							<Link
								href={`/experiences/${experienceId}/earnings`}
								className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
							>
								View Earnings
							</Link>
						</div>

						{/* Affiliate Link */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
							<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
								Your Affiliate Link
							</h2>
							<div className="flex gap-2">
								<input
									type="text"
									value={`${experience.company.vanityUrl}?affiliate=${userId}`}
									readOnly
									className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
								/>
								<button
									onClick={() =>
										navigator.clipboard.writeText(
											`${experience.company.vanityUrl}?affiliate=${userId}`,
										)
									}
									className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
								>
									Copy
								</button>
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
								Your commission rate:{" "}
								<strong>
									{affiliate.customRate ?? program.defaultRate}%
								</strong>{" "}
								{affiliate.tier && `(${affiliate.tier} tier)`}
							</p>
						</div>
					</>
				)}

				{/* Available Offers */}
				{publicOffers.length > 0 && (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
							Available Offers
						</h2>
						<div className="space-y-4">
							{publicOffers.map((offer) => (
								<Link
									key={offer.id}
									href={`/experiences/${experienceId}/offers/${offer.id}`}
									className="block border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 transition"
								>
									<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
										{offer.name}
									</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
										{offer.description}
									</p>
									<div className="flex gap-4 text-sm">
										<span className="text-gray-500">
											Commission:{" "}
											<strong className="text-blue-600">
												{offer.rateOverride ?? program.defaultRate}%
											</strong>
										</span>
										{offer.startAt && (
											<span className="text-gray-500">
												Starts:{" "}
												{new Date(offer.startAt).toLocaleDateString()}
											</span>
										)}
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
