import axios, { AxiosError, AxiosRequestConfig } from "axios";

const primaryBaseUrl = (import.meta.env.VITE_APP_BACKEND_BASE_URL || "").trim();
const fallbackBaseUrls = (import.meta.env.VITE_APP_BACKEND_FALLBACK_URLS || "")
  .split(",")
  .map((url: string) => url.trim())
  .filter(Boolean);

export const backendBaseUrls = [primaryBaseUrl, ...fallbackBaseUrls].filter(Boolean);

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function isNetworkError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return axiosError?.code === "ERR_NETWORK" || !axiosError?.response;
}

function buildFriendlyBackendError(originalError: unknown): Error {
  const message =
    "Backend service is unreachable right now. Please try again in a minute, or contact support if it continues.";
  const friendlyError = new Error(message);
  (friendlyError as Error & { cause?: unknown }).cause = originalError;
  return friendlyError;
}

export async function requestWithBackendFallback<T = unknown>(
  config: AxiosRequestConfig
): Promise<T> {
  if (backendBaseUrls.length === 0) {
    throw new Error("Missing VITE_APP_BACKEND_BASE_URL configuration");
  }

  const path = normalizePath(config.url || "");
  let lastError: unknown;

  for (const baseUrl of backendBaseUrls) {
    try {
      const response = await axios.request<T>({
        ...config,
        url: `${baseUrl}${path}`,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      lastError = error;

      if (!isNetworkError(error)) {
        throw error;
      }
    }
  }

  throw buildFriendlyBackendError(lastError);
}
