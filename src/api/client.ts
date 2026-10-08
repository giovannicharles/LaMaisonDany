import type {
  Product,
  Category,
  Page,
  Message,
  MessageStatus,
  AuthResponse,
  Admin,
  MediaResponse,
} from "@/types";

import { formatPrice } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");
let whatsappNumber: string = import.meta.env.VITE_WHATSAPP_NUMBER || "";
let whatsappDefaultMessage: string =
  import.meta.env.VITE_WHATSAPP_DEFAULT_MESSAGE || "Bonjour LaMaison Dany, je souhaite avoir des informations.";

export const DEFAULT_PRODUCT_TEMPLATE = "Bonjour LaMaison Dany, je suis intéressé(e) par « {produit} » ({prix}). Est-il disponible ?";
let productTemplate = DEFAULT_PRODUCT_TEMPLATE;

export function configureWhatsApp(number: string, message: string, productMessage?: string) {
  if (number) whatsappNumber = number;
  if (message) whatsappDefaultMessage = message;
  if (productMessage) productTemplate = productMessage;
}

export function renderProductMessage(template: string, name: string, price: number | null | undefined, quantity = 1): string {
  const priceText = price != null ? formatPrice(price) : "";
  let text = template.split("{produit}").join(name).split("{quantite}").join(String(quantity));
  text = priceText
    ? text.split("{prix}").join(priceText)
    : text.replace(/\s*\(\s*\{prix\}\s*\)/g, "").replace(/\s*\{prix\}/g, "");
  if (quantity > 1 && !template.includes("{quantite}")) text = `${text} Quantité souhaitée : ${quantity}.`;
  return text.trim();
}

export function whatsappLink(message?: string): string {
  if (!whatsappNumber) return "/contact";
  const text = encodeURIComponent(message || whatsappDefaultMessage);
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}

export function defaultProductMessage(product: Product, quantity = 1): string {
  return renderProductMessage(productTemplate, product.name, product.price, quantity);
}

export function whatsappProductLink(product: Product, message?: string): string {
  return whatsappLink(message || defaultProductMessage(product));
}

function readError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const { fieldErrors, formErrors } = error as { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    const first = formErrors?.[0] ?? Object.values(fieldErrors ?? {}).flat()[0];
    if (first) return first;
  }
  return "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("lmd_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(readError(body.error) || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface Stats {
  days: number;
  totals: Partial<Record<"whatsapp_request" | "chat_handoff" | "product_view", number>>;
  previous: Partial<Record<"whatsapp_request" | "chat_handoff" | "product_view", number>>;
  top_products: { id: number; name: string; image_url: string | null; category_id: number | null; requests: number; views: number }[];
  daily: { day: string; requests: number }[];
}

interface ApiResponse<T> {
  data: T;
}

export const api = {
  get: <T>(path: string) => request<ApiResponse<T>>(path),
  post: <T>(path: string, body?: unknown) =>
    request<ApiResponse<T>>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<ApiResponse<T>>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<ApiResponse<T>>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<ApiResponse<T>>(path, { method: "DELETE" }),

  products: {
    list: (params: Record<string, string> = {}) => {
      const qs = new URLSearchParams(params).toString();
      return api.get<Product[]>(`/products${qs ? `?${qs}` : ""}`);
    },
    get: (slug: string) => api.get<Product>(`/products/${slug}`),
    create: (data: Partial<Product>) => api.post<Product>("/products", data),
    update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
    delete: (id: number) => api.delete<{ deleted: boolean }>(`/products/${id}`),
    reorder: (ids: number[]) => api.put<{ reordered: number }>("/products/reorder", { ids }),
  },
  categories: {
    list: () => api.get<Category[]>("/categories"),
    create: (data: { name: string }) => api.post<Category>("/categories", data),
    update: (id: number, data: { name: string }) => api.put<Category>(`/categories/${id}`, data),
    reorder: (ids: number[]) => api.put<{ reordered: number }>("/categories/reorder", { ids }),
    delete: (id: number) => api.delete<{ deleted: boolean }>(`/categories/${id}`),
  },
  pages: {
    list: () => api.get<Page[]>("/pages"),
    get: (slug: string) => api.get<Page>(`/pages/${slug}`),
    upsert: (data: { slug: string; title: string; content?: string }) =>
      api.post<Page>("/pages", data),
    delete: (id: number) => api.delete<{ deleted: boolean }>(`/pages/${id}`),
  },
  messages: {
    list: (status?: MessageStatus) =>
      api.get<Message[]>(`/messages${status ? `?status=${status}` : ""}`),
    create: (data: {
      name: string;
      phone?: string;
      email?: string;
      message?: string;
      product_id?: number;
    }) => api.post<Message>("/messages", data),
    updateStatus: (id: number, status: MessageStatus) =>
      api.patch<Message>(`/messages/${id}/status`, { status }),
    delete: (id: number) => api.delete<{ deleted: boolean }>(`/messages/${id}`),
  },
  media: {
    upload: (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      return api.post<MediaResponse>("/media/upload", fd);
    },
  },
  stats: {
    get: (days = 30) => api.get<Stats>(`/events/stats?days=${days}`),
  },
  settings: {
    get: () => api.get<Record<string, unknown>>("/settings"),
    update: (data: Record<string, unknown>) => api.put<Record<string, unknown>>("/settings", data),
  },
  auth: {
    login: (identifier: string, password: string) =>
      request<ApiResponse<AuthResponse>>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      }),
    me: () => api.get<Admin>("/auth/me"),
    updateProfile: (data: { name?: string; phone?: string; email?: string }) => api.put<Admin>("/auth/me", data),
    changePassword: (data: { current_password: string; new_password: string }) =>
      api.put<{ updated: boolean }>("/auth/password", data),
  },
};
