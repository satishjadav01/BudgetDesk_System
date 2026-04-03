import axios from "axios";

function resolveBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8000/api/v1`;
  }

  return "http://127.0.0.1:8000/api/v1";
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error?.response?.status === 401 &&
      original &&
      !original._retry &&
      !String(original.url || "").includes("/auth/refresh")
    ) {
      original._retry = true;
      try {
        await api.post("/auth/refresh/");
        return api(original);
      } catch (_refreshError) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
