"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Program {
	id: string;
	companyId: string;
	defaultRate: number;
	payoutFrequency: string;
	cookieWindow: number;
	status: string;
}

interface ProgramSetupFormProps {
	companyId: string;
	existingProgram: Program | null;
}

export function ProgramSetupForm({
	companyId,
	existingProgram,
}: ProgramSetupFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		defaultRate: existingProgram?.defaultRate ?? 10,
		payoutFrequency: existingProgram?.payoutFrequency ?? "monthly",
		cookieWindow: existingProgram?.cookieWindow ?? 30,
		status: existingProgram?.status ?? "active",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/programs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					companyId,
					...formData,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to save program");
			}

			// Refresh the page to show updated data
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
					{error}
				</div>
			)}

			<div>
				<label
					htmlFor="defaultRate"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Default Commission Rate (%)
				</label>
				<input
					type="number"
					id="defaultRate"
					min="0"
					max="100"
					step="0.1"
					value={formData.defaultRate}
					onChange={(e) =>
						setFormData({ ...formData, defaultRate: parseFloat(e.target.value) })
					}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
					required
				/>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Default commission percentage for all affiliates
				</p>
			</div>

			<div>
				<label
					htmlFor="payoutFrequency"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Payout Frequency
				</label>
				<select
					id="payoutFrequency"
					value={formData.payoutFrequency}
					onChange={(e) =>
						setFormData({ ...formData, payoutFrequency: e.target.value })
					}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
					required
				>
					<option value="weekly">Weekly</option>
					<option value="monthly">Monthly</option>
				</select>
			</div>

			<div>
				<label
					htmlFor="cookieWindow"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Cookie Window (days)
				</label>
				<input
					type="number"
					id="cookieWindow"
					min="1"
					max="365"
					value={formData.cookieWindow}
					onChange={(e) =>
						setFormData({ ...formData, cookieWindow: parseInt(e.target.value) })
					}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
					required
				/>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Number of days for attribution tracking
				</p>
			</div>

			<div>
				<label
					htmlFor="status"
					className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
				>
					Program Status
				</label>
				<select
					id="status"
					value={formData.status}
					onChange={(e) => setFormData({ ...formData, status: e.target.value })}
					className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
					required
				>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Inactive programs cannot accept new affiliates
				</p>
			</div>

			<div className="pt-4">
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
				>
					{loading
						? "Saving..."
						: existingProgram
							? "Update Program"
							: "Create Program"}
				</button>
			</div>
		</form>
	);
}

