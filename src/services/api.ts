import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
    throw new Error("VITE_API_BASE_URL is not configured");
}

export const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

let accessTokenProvider: (() => Promise<string>) | null = null;

api.interceptors.request.use(async (config) => {
    if (accessTokenProvider) {
        const accessToken = await accessTokenProvider();
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export function setAccessTokenProvider(provider: (() => Promise<string>) | null): void {
    accessTokenProvider = provider;
}
