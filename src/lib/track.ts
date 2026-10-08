const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export type TrackedEvent = "whatsapp_request" | "chat_handoff" | "product_view";

export function track(type: TrackedEvent, productId?: number) {
  try {
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, product_id: productId ?? null }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking must never break the page */
  }
}
