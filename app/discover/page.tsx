export default function DiscoverPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
			<div className="max-w-6xl mx-auto px-4 py-16">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<h1 className="text-6xl font-bold text-gray-900 mb-6">
						Affiliate Launcher
					</h1>
					<p className="text-2xl text-gray-700 mb-4">
						Launch Your Affiliate Program in Under 10 Minutes
					</p>
					<p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
						The complete affiliate management solution for Whop creators. Recruit partners, track performance, and automate payouts - all from one powerful dashboard.
					</p>
					<a
						href="#install"
						className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition shadow-lg"
					>
						Install Now
					</a>
				</div>

				{/* Features Grid */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
						Everything You Need to Scale with Affiliates
					</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="bg-white rounded-xl p-6 shadow-md">
							<div className="text-4xl mb-4">🎯</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Custom Offers
							</h3>
							<p className="text-gray-600">
								Create public, invite-only, or private offers with custom commission rates and terms.
							</p>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-md">
							<div className="text-4xl mb-4">👥</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Affiliate Management
							</h3>
							<p className="text-gray-600">
								Approve applications, set custom rates, and manage tiers all from your dashboard.
							</p>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-md">
							<div className="text-4xl mb-4">🎨</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Creative Assets
							</h3>
							<p className="text-gray-600">
								Upload banners, images, and promotional materials for your affiliates to use.
							</p>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-md">
							<div className="text-4xl mb-4">💰</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Earnings Tracking
							</h3>
							<p className="text-gray-600">
								Real-time tracking of clicks, conversions, and commissions for every affiliate.
							</p>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-md">
							<div className="text-4xl mb-4">💸</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								One-Click Payouts
							</h3>
							<p className="text-gray-600">
								Process batch payouts to multiple affiliates instantly using Whop's payment system.
							</p>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-md">
							<div className="text-4xl mb-4">🔔</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Push Notifications
							</h3>
							<p className="text-gray-600">
								Auto-notify affiliates about new offers, creatives, and payouts with deep links.
							</p>
						</div>
					</div>
				</div>

				{/* Pricing Section */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
						Simple, Transparent Pricing
					</h2>
					<div className="grid md:grid-cols-3 gap-6">
						<div className="bg-white rounded-xl p-8 shadow-md border-2 border-gray-200">
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
							<p className="text-gray-600 mb-4">Perfect for getting started</p>
							<div className="text-4xl font-bold text-blue-600 mb-6">Free</div>
							<ul className="space-y-3 mb-8">
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>1 Active Offer</span>
								</li>
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>Unlimited Affiliates</span>
								</li>
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>Manual Payouts</span>
								</li>
							</ul>
						</div>

						<div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 shadow-lg border-2 border-blue-500 transform scale-105">
							<h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
							<p className="text-blue-100 mb-4">Most popular choice</p>
							<div className="text-4xl font-bold text-white mb-6">$49/mo</div>
							<ul className="space-y-3 mb-8 text-white">
								<li className="flex items-start">
									<span className="mr-2">✓</span>
									<span>Unlimited Offers</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">✓</span>
									<span>Batch Payouts</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">✓</span>
									<span>Analytics Dashboard</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">✓</span>
									<span>Custom Commission Rates</span>
								</li>
							</ul>
						</div>

						<div className="bg-white rounded-xl p-8 shadow-md border-2 border-gray-200">
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Scale</h3>
							<p className="text-gray-600 mb-4">For power users</p>
							<div className="text-4xl font-bold text-purple-600 mb-6">$149/mo</div>
							<ul className="space-y-3 mb-8">
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>Everything in Growth</span>
								</li>
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>API Access</span>
								</li>
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>Priority Support</span>
								</li>
								<li className="flex items-start">
									<span className="text-green-600 mr-2">✓</span>
									<span>White Label Options</span>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-xl" id="install">
					<h2 className="text-4xl font-bold mb-4">
						Ready to Grow with Affiliates?
					</h2>
					<p className="text-xl mb-8 opacity-90">
						Join creators already scaling their Whop communities with affiliate partnerships.
					</p>
					<button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition shadow-lg">
						Install Affiliate Launcher
					</button>
				</div>
			</div>
		</div>
	);
}
