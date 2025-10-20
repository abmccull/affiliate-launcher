"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApplyButtonProps {
	programId: string;
	experienceId: string;
}

export function ApplyButton({ programId, experienceId }: ApplyButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleApply = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/affiliates/apply", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					programId,
					experienceId,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to apply");
			}

			// Refresh the page to show updated status
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			{error && (
				<div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
					{error}
				</div>
			)}
			<button
				onClick={handleApply}
				disabled={loading}
				className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition"
			>
				{loading ? "Applying..." : "Apply to Become an Affiliate"}
			</button>
		</div>
	);
}

