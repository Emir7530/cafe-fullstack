const DEFAULT_API_PORT = "5000";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getApiOrigin = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl).replace(/\/api$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
};

export const API_ORIGIN = getApiOrigin();
export const API_URL = `${API_ORIGIN}/api`;

export const getImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_ORIGIN}${normalizedPath}`;
};
