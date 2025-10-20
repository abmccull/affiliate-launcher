import { WhopServerSdk } from "@whop/api";

/**
 * Whop Server SDK instance for making API calls
 * Configure appId and appApiKey from environment variables
 * Use .withUser() and .withCompany() for context-specific calls
 */
export const whopSdk = WhopServerSdk({
	appId: process.env.NEXT_PUBLIC_WHOP_APP_ID ?? "fallback",
	appApiKey: process.env.WHOP_API_KEY ?? "fallback",
});
