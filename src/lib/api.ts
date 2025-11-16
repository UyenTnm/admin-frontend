import axios, { AxiosRequestHeaders } from "axios";
import { auth } from "./auth";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env?.VITE_API_URL?.replace(/\/+$/, "") ||
  `${window.location.origin}/api`;

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Chuẩn hoá payload
function normalizePayload(data: any) {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const fd = new FormData();

    for (const [k, v] of data.entries()) {
      if (k === "isActive") continue;
      fd.append(k, v as any);
    }

    const raw = data.get("isActive");
    if (raw !== null) {
      const on =
        String(raw).toLowerCase() === "true" ||
        String(raw) === "1" ||
        String(raw).toLowerCase() === "on";
      fd.set("status", on ? "ACTIVE" : "INACTIVE");
    }

    return fd;
  }

  if (!data || typeof data !== "object") return data;

  const clone: any = { ...data };

  if ("isActive" in clone) {
    const on =
      clone.isActive === true ||
      clone.isActive === 1 ||
      String(clone.isActive).toLowerCase() === "true" ||
      String(clone.isActive).toLowerCase() === "on";

    clone.status = on ? "ACTIVE" : "INACTIVE";
    delete clone.isActive;
  }

  return clone;
}

// Upload image
export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("http://localhost:3000/api/uploads/posts", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

// Attach token interceptor
instance.interceptors.request.use((config) => {
  const session = auth.get();

  let token: string | null = null;

  if (session?.token) {
    token =
      typeof session.token === "string"
        ? session.token
        : session.token.token || null;
  } else {
    token = localStorage.getItem("token");
  }

  if (token) {
    // Lấy headers hiện tại (có thể là AxiosHeaders hoặc object hoặc undefined)
    const current = (config.headers ?? {}) as Record<string, any>;

    // set header vào object tạm, sau đó ép kiểu về AxiosRequestHeaders
    current["Authorization"] = `Bearer ${token}`;

    // ép kiểu để thỏa TypeScript/Axios
    config.headers = current as AxiosRequestHeaders;
  }

  return config;
});

// Global error handler
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) toast.error("Log-in to continue.");
      if (status === 403)
        toast.error("You do not have permission to perform this operation.");
      if (status === 404) toast.error("No data found.");
      if (status >= 500) toast.error("System error, please try again later.");

      return Promise.reject(data || error);
    }

    toast.error("Server connection error!");
    return Promise.reject(error);
  }
);

// REST helpers
export const rest = {
  get: async <T = any>(url: string, config?: any): Promise<T> =>
    (await instance.get<T>(url, config)).data,

  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    (await instance.post<T>(url, normalizePayload(data), config)).data,

  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    (await instance.patch<T>(url, normalizePayload(data), config)).data,

  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> =>
    (await instance.put<T>(url, normalizePayload(data), config)).data,

  delete: async <T = any>(url: string, config?: any): Promise<T> =>
    (await instance.delete<T>(url, config)).data,
};

export async function toggleProductStatus(id: number) {
  const res = await instance.patch(`/products/${id}/toggle`);
  return res.data.product;
}

export const api = instance;
export default instance;
