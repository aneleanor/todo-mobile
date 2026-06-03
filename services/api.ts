import { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 5000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Content-Type"] = "application/json";

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const backendMessage =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.response?.data?.detail;

    if (status === 401) {
      await AsyncStorage.removeItem("token");
    }

    const message =
      backendMessage ??
      (status ? `Error HTTP ${status}` : "No se pudo conectar con el servidor");

    return Promise.reject(new ApiError(message, status));
  }
);

export default api;
