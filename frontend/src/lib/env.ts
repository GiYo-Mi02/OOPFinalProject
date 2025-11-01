const fallbackApi = "http://localhost:4000/api";

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? fallbackApi,
};
