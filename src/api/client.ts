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
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SETTINGS } from "@/data/mock";

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

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Source des données du site public :
 *  - auto (défaut) : l'API, avec repli sur les données intégrées si elle ne répond pas ou est vide ;
 *  - api : l'API uniquement ;
 *  - mock : uniquement les données intégrées (src/data/mock.ts).
 * L'administration (/admin) utilise toujours l'API.
 */
const DATA_SOURCE = (import.meta.env.VITE_DATA_SOURCE as string | undefined) ?? "auto";
const API_TIMEOUT_MS = 7000;
let apiDownUntil = 0;
let apiEmpty = false;

const inAdmin = () => typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function publicRead<T>(live: (signal: AbortSignal) => Promise<ApiResponse<T>>, mock: () => T, isEmpty?: (data: T) => boolean): Promise<ApiResponse<T>> {
  if (DATA_SOURCE === "api" || inAdmin()) return live(timeoutSignal(60000));
  if (DATA_SOURCE === "mock" || Date.now() < apiDownUntil) return { data: mock() };
  try {
    const res = await live(timeoutSignal(API_TIMEOUT_MS));
    if (isEmpty && isEmpty(res.data)) {
      apiEmpty = true;
      return { data: mock() };
    }
    return res;
  } catch (err) {
    if (err instanceof ApiError && err.status > 0 && err.status < 500) throw err;
    apiDownUntil = Date.now() + 2 * 60 * 1000;
    return { data: mock() };
  }
}

const CATEGORY_ORDER = ["parfums-femme", "parfums-homme", "soins-du-corps", "deodorants", "vins", "maison"];
const mockCategories = () =>
  [...MOCK_CATEGORIES].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a.slug);
    const ib = CATEGORY_ORDER.indexOf(b.slug);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

function mockProducts(params: Record<string, string>): Product[] {
  const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let list = [...MOCK_PRODUCTS];
  if (params.category) list = list.filter((p) => p.category_slug === params.category);
  if (params.featured === "true") list = list.filter((p) => p.featured);
  if (params.search) {
    const q = norm(params.search);
    list = list.filter((p) => norm(`${p.name} ${p.description ?? ""}`).includes(q));
  }
  return list.sort((a, b) => a.sort_order - b.sort_order);
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
    throw new ApiError(readError(body.error) || `HTTP ${res.status}`, res.status);
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
      const unfiltered = Object.keys(params).length === 0;
      return publicRead<Product[]>(
        (signal) => request<ApiResponse<Product[]>>(`/products${qs ? `?${qs}` : ""}`, { signal }),
        () => mockProducts(params),
        (data) => (unfiltered || apiEmpty) && data.length === 0
      );
    },
    get: (slug: string) =>
      publicRead<Product>(
        (signal) => request<ApiResponse<Product>>(`/products/${slug}`, { signal }),
        () => {
          const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
          if (!found) throw new ApiError("Product not found", 404);
          return found;
        }
      ),
    create: (data: Partial<Product>) => api.post<Product>("/products", data),
    update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
    delete: (id: number) => api.delete<{ deleted: boolean }>(`/products/${id}`),
    reorder: (ids: number[]) => api.put<{ reordered: number }>("/products/reorder", { ids }),
  },
  categories: {
    list: () =>
      publicRead<Category[]>(
        (signal) => request<ApiResponse<Category[]>>("/categories", { signal }),
        mockCategories,
        (data) => data.length === 0 || apiEmpty
      ),
    create: (data: { name: string }) => api.post<Category>("/categories", data),
    update: (id: number, data: { name: string }) => api.put<Category>(`/categories/${id}`, data),
    reorder: (ids: number[]) => api.put<{ reordered: number }>("/categories/reorder", { ids }),
    delete: (id: number) => api.delete<{ deleted: boolean }>(`/categories/${id}`),
  },
  pages: {
    list: () => api.get<Page[]>("/pages"),
    get: (slug: string) =>
      publicRead<Page>(
        (signal) => request<ApiResponse<Page>>(`/pages/${slug}`, { signal }),
        () => {
          throw new ApiError("Page not found", 404);
        }
      ),
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
    uploadVideo: (file: File) => {
      const fd = new FormData();
      fd.append("video", file);
      return api.post<MediaResponse>("/media/upload-video", fd);
    },
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
    get: async () => {
      const res = await publicRead<Record<string, unknown>>(
        (signal) => request<ApiResponse<Record<string, unknown>>>("/settings", { signal }),
        () => MOCK_SETTINGS
      );
      if (inAdmin()) return res;
      const general = (res.data.general ?? {}) as Record<string, unknown>;
      const cleaned = Object.fromEntries(Object.entries(general).filter(([, v]) => v !== "" && v != null));
      return {
        data: { ...MOCK_SETTINGS, ...res.data, general: { ...(MOCK_SETTINGS.general as object), ...cleaned } },
      };
    },
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
