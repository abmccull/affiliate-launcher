import { whopSdk } from "./whop-sdk";

/**
 * Access helper functions for checking user permissions
 */

export type AccessLevel = "no_access" | "customer" | "admin";

export interface CompanyAccessResult {
	hasAccess: boolean;
	accessLevel: AccessLevel;
}

export interface ExperienceAccessResult {
	hasAccess: boolean;
	accessLevel: AccessLevel;
}

/**
 * Check if a user has access to a company (dashboard view)
 * Returns access level: "no_access", "admin"
 */
export async function checkCompanyAccess(
	companyId: string,
	userId: string,
): Promise<CompanyAccessResult> {
	try {
		const access = await whopSdk.access.checkIfUserHasAccessToCompany({
			companyId,
			userId,
		});

		return {
			hasAccess: access.hasAccess,
			accessLevel: access.accessLevel,
		};
	} catch (error) {
		console.error("Error checking company access:", error);
		return {
			hasAccess: false,
			accessLevel: "no_access",
		};
	}
}

/**
 * Check if a user has access to an experience (member view)
 * Returns access level: "no_access", "customer", "admin"
 */
export async function checkExperienceAccess(
	experienceId: string,
	userId: string,
): Promise<ExperienceAccessResult> {
	try {
		const access = await whopSdk.access.checkIfUserHasAccessToExperience({
			experienceId,
			userId,
		});

		return {
			hasAccess: access.hasAccess,
			accessLevel: access.accessLevel,
		};
	} catch (error) {
		console.error("Error checking experience access:", error);
		return {
			hasAccess: false,
			accessLevel: "no_access",
		};
	}
}

/**
 * Verify user token from request headers and return user ID
 * Throws error if invalid
 */
export async function verifyUserFromHeaders(
	headers: Headers,
): Promise<{ userId: string }> {
	try {
		const result = await whopSdk.verifyUserToken(headers);
		if (!result.userId) {
			throw new Error("No userId found in token");
		}
		return { userId: result.userId };
	} catch (error) {
		throw new Error("Unauthorized: Invalid user token");
	}
}

/**
 * Require company admin access - throws 403 if not admin
 */
export async function requireCompanyAdmin(
	companyId: string,
	userId: string,
): Promise<void> {
	const access = await checkCompanyAccess(companyId, userId);

	if (!access.hasAccess || access.accessLevel !== "admin") {
		throw new Error("Forbidden: Company admin access required");
	}
}

/**
 * Require experience access - throws 403 if no access
 */
export async function requireExperienceAccess(
	experienceId: string,
	userId: string,
): Promise<void> {
	const access = await checkExperienceAccess(experienceId, userId);

	if (!access.hasAccess) {
		throw new Error("Forbidden: Experience access required");
	}
}

/**
 * Check if user has access to a specific access pass (for app monetization)
 */
export async function checkAccessPassAccess(
	accessPassId: string,
	userId: string,
): Promise<boolean> {
	try {
		const access = await whopSdk.access.checkIfUserHasAccessToAccessPass({
			accessPassId,
			userId,
		});
		return access.hasAccess;
	} catch (error) {
		console.error("Error checking access pass access:", error);
		return false;
	}
}

