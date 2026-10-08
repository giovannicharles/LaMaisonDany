export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  images?: string[];
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  featured: boolean;
  available?: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
  created_at: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = "new" | "read" | "responded" | "archived";

export interface Message {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  product_id: number | null;
  status: MessageStatus;
  created_at: string;
}

export interface Admin {
  id: number;
  phone: string | null;
  email: string | null;
  name: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

export interface MediaResponse {
  url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}
