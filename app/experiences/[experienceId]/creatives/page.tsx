import { whopSdk } from "@/lib/whop-sdk";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export default async function CreativesPage({
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
		return <div className="p-8">Access denied</div>;
	}

	const experience = await whopSdk.experiences.getExperience({ experienceId });

	// Get program
	const program = await prisma.program.findUnique({
		where: { companyId: experience.company.id },
	});

	if (!program) {
		return <div className="p-8">No affiliate program available</div>;
	}

	// Check if user is an approved affiliate
	const affiliate = await prisma.affiliate.findUnique({
		where: {
			programId_userId: {
				programId: program.id,
				userId,
			},
		},
	});

	if (!affiliate || affiliate.status !== "approved") {
		return (
			<div className="p-8">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
					<p>You must be an approved affiliate to access creatives.</p>
				</div>
			</div>
		);
	}

	// Get all creatives for this program
	const creatives = await prisma.creative.findMany({
		where: {
			offer: {
				programId: program.id,
			},
		},
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

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Marketing Creatives
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Download promotional materials to use in your campaigns
					</p>
				</div>

				{/* Usage Guidelines */}
				<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
					<h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
						Usage Guidelines
					</h2>
					<ul className="space-y-2 text-blue-800 dark:text-blue-300 text-sm">
						<li>✓ Use creatives exactly as provided - no modifications</li>
						<li>✓ Always include your affiliate link when sharing</li>
						<li>✓ Follow platform-specific posting guidelines</li>
						<li>✗ Don't claim ownership of the creative assets</li>
						<li>✗ Don't use creatives for misleading promotions</li>
					</ul>
				</div>

				{creatives.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<p className="text-gray-600 dark:text-gray-400 mb-4">
							No creatives available yet. Check back soon!
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{creatives.map((creative) => (
							<div
								key={creative.id}
								className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
							>
								{/* Preview */}
								<div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
									{creative.type === "image" ? (
										<img
											src={creative.url}
											alt={creative.title}
											className="w-full h-full object-cover"
										/>
									) : creative.type === "video" ? (
										<div className="text-gray-500">
											<svg
												className="w-16 h-16"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
											</svg>
											<p className="text-sm mt-2">Video</p>
										</div>
									) : (
										<div className="text-gray-500">
											<svg
												className="w-16 h-16"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
											<p className="text-sm mt-2 capitalize">{creative.type}</p>
										</div>
									)}
								</div>

								{/* Details */}
								<div className="p-6">
									<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
										{creative.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
										For offer: <strong>{creative.offer.name}</strong>
									</p>
									{creative.notes && (
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
											{creative.notes}
										</p>
									)}

									{/* Download Button */}
									<a
										href={creative.url}
										download
										target="_blank"
										rel="noopener noreferrer"
										className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-2 px-4 rounded-lg transition"
									>
										Download
									</a>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Tips Section */}
				<div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
						Promotion Tips
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
								Best Practices
							</h3>
							<ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
								<li>• Test different creatives to see what performs best</li>
								<li>• Post at optimal times for your audience</li>
								<li>• Include a clear call-to-action</li>
								<li>• Track which creatives drive conversions</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
								Recommended Platforms
							</h3>
							<ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
								<li>• Social media (Twitter, Instagram, TikTok)</li>
								<li>• YouTube video descriptions</li>
								<li>• Email newsletters</li>
								<li>• Blog posts and websites</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

