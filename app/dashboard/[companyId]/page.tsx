import { whopSdk } from "@/lib/whop-sdk";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProgramSetupForm } from "./program-setup-form";

export default async function DashboardPage({
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
		return (
			<div className="flex justify-center items-center h-screen px-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">
						Access Denied
					</h1>
					<p>You need admin access to this company to manage the affiliate program.</p>
				</div>
			</div>
		);
	}

	// Get company and user details
	const company = await whopSdk.companies.getCompany({ companyId });
	const user = await whopSdk.users.getUser({ userId });

	// Get existing program or null
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

	// Get stats if program exists
	let stats = null;
	if (program) {
		const activeAffiliates = await prisma.affiliate.count({
			where: { programId: program.id, status: "approved" },
		});

		const pendingAffiliates = await prisma.affiliate.count({
			where: { programId: program.id, status: "pending" },
		});

		const pendingEarnings = await prisma.earningsEvent.aggregate({
			where: {
				affiliate: { programId: program.id },
				type: "conversion",
			},
			_sum: { amount: true },
		});

		stats = {
			totalOffers: program._count.offers,
			totalAffiliates: program._count.affiliates,
			activeAffiliates,
			pendingAffiliates,
			pendingEarnings: pendingEarnings._sum.amount ?? 0,
		};
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Affiliate Program Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage your affiliate program for <strong>{company.title}</strong>
					</p>
				</div>

				{/* Stats Overview */}
				{program && stats && (
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Status
							</div>
							<div className="text-2xl font-bold">
								<span
									className={
										program.status === "active"
											? "text-green-600"
											: "text-gray-600"
									}
								>
									{program.status === "active" ? "Active" : "Inactive"}
								</span>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Total Offers
							</div>
							<div className="text-2xl font-bold text-gray-900 dark:text-white">
								{stats.totalOffers}
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Active Affiliates
							</div>
							<div className="text-2xl font-bold text-blue-600">
								{stats.activeAffiliates}
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Pending Applications
							</div>
							<div className="text-2xl font-bold text-orange-600">
								{stats.pendingAffiliates}
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
								Pending Payouts
							</div>
							<div className="text-2xl font-bold text-green-600">
								${stats.pendingEarnings.toFixed(2)}
							</div>
						</div>
					</div>
				)}

				{/* Quick Actions */}
				{program && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						<a
							href={`/dashboard/${companyId}/offers`}
							className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
						>
							Manage Offers
						</a>
						<a
							href={`/dashboard/${companyId}/affiliates`}
							className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
						>
							Manage Affiliates
						</a>
						<a
							href={`/dashboard/${companyId}/creatives`}
							className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
						>
							Upload Creatives
						</a>
						<a
							href={`/dashboard/${companyId}/payouts`}
							className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow p-6 text-center font-semibold transition"
						>
							Process Payouts
						</a>
					</div>
				)}

				{/* Program Setup Form */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
						{program ? "Program Settings" : "Setup Your Affiliate Program"}
					</h2>
					<ProgramSetupForm
						companyId={companyId}
						existingProgram={program}
					/>
				</div>
			</div>
		</div>
	);
}
