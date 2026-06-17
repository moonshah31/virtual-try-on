const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawApiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL. Set it to your Railway API URL ending in /api.");
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");
export const API_ORIGIN = new URL(API_BASE_URL).origin;
