import Link from "next/link";

export default function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ companyId: string }>;
}) {
	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Sidebar Navigation */}
			<nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
				<div className="p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
						Affiliate Manager
					</h2>
					<DashboardNav params={params} />
				</div>
			</nav>

			{/* Main Content */}
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}

async function DashboardNav({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;

	const navItems = [
		{ href: `/dashboard/${companyId}`, label: "Dashboard", icon: "📊" },
		{ href: `/dashboard/${companyId}/offers`, label: "Offers", icon: "🎯" },
		{
			href: `/dashboard/${companyId}/affiliates`,
			label: "Affiliates",
			icon: "👥",
		},
		{
			href: `/dashboard/${companyId}/creatives`,
			label: "Creatives",
			icon: "🎨",
		},
		{
			href: `/dashboard/${companyId}/earnings`,
			label: "Earnings",
			icon: "💰",
		},
		{
			href: `/dashboard/${companyId}/payouts`,
			label: "Payouts",
			icon: "💸",
		},
		{
			href: `/dashboard/${companyId}/settings`,
			label: "Settings",
			icon: "⚙️",
		},
	];

	return (
		<ul className="space-y-2">
			{navItems.map((item) => (
				<li key={item.href}>
					<Link
						href={item.href}
						className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
					>
						<span className="text-xl">{item.icon}</span>
						<span className="font-medium">{item.label}</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

