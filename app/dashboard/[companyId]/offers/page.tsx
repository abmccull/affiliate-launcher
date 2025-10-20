import { whopSdk } from "@/lib/whop-sdk";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";

export default async function OffersPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const headersList = await headers();
	const { companyId } = await params;

	// Verify user access
	const { userId } = await whopSdk.verifyUserToken(headersList);
	const accessResult = await whopSdk.access.checkIfUserHasAccessToCompany({
		userId,
		companyId,
	});

	if (!accessResult.hasAccess || accessResult.accessLevel !== "admin") {
		return <div className="p-8">Access denied</div>;
	}

	// Get program
	const program = await prisma.program.findUnique({
		where: { companyId },
	});

	if (!program) {
		return (
			<div className="p-8">
				<p>Please set up your program first.</p>
				<Link href={`/dashboard/${companyId}`} className="text-blue-600">
					Go to Dashboard
				</Link>
			</div>
		);
	}

	// Get offers
	const offers = await prisma.offer.findMany({
		where: { programId: program.id },
		include: {
			_count: {
				select: { creatives: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Offers
					</h1>
					<Link
						href={`/dashboard/${companyId}/offers/create`}
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
					>
						Create Offer
					</Link>
				</div>

				{offers.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<p className="text-gray-600 dark:text-gray-400 mb-4">
							No offers yet. Create your first offer to start recruiting
							affiliates.
						</p>
						<Link
							href={`/dashboard/${companyId}/offers/create`}
							className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
						>
							Create Your First Offer
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{offers.map((offer) => (
							<Link
								key={offer.id}
								href={`/dashboard/${companyId}/offers/${offer.id}/edit`}
								className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6"
							>
								<div className="flex justify-between items-start mb-3">
									<h3 className="text-xl font-bold text-gray-900 dark:text-white">
										{offer.name}
									</h3>
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											offer.isPublished
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
										}`}
									>
										{offer.isPublished ? "Published" : "Draft"}
									</span>
								</div>

								<p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
									{offer.description}
								</p>

								<div className="flex flex-wrap gap-4 text-sm">
									<div>
										<span className="text-gray-500">Visibility:</span>{" "}
										<span className="font-medium capitalize">
											{offer.visibility}
										</span>
									</div>
									<div>
										<span className="text-gray-500">Commission:</span>{" "}
										<span className="font-medium">
											{offer.rateOverride ?? program.defaultRate}%
										</span>
									</div>
									<div>
										<span className="text-gray-500">Creatives:</span>{" "}
										<span className="font-medium">{offer._count.creatives}</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

