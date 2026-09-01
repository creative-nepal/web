import axios, { type AxiosInstance } from "axios";

export interface CreateApiClientOptions {
  baseURL: string;
  getAuthHeaders?: () => Record<string, string>;
}

export function createApiClient(
  options: CreateApiClientOptions,
): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: true,
  });

  if (options.getAuthHeaders) {
    instance.interceptors.request.use((config) => {
      const headers = options.getAuthHeaders?.();
      if (headers) {
        Object.assign(config.headers, headers);
      }
      return config;
    });
  }

  return instance;
}
