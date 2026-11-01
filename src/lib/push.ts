import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";

export type PushAudience = "admin" | "visitor";
export type PushState = "unsupported" | "unavailable" | "denied" | "off" | "on";

const supported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration() {
  const existing = await navigator.serviceWorker.getRegistration();
  return existing ?? (await navigator.serviceWorker.register("/sw.js"));
}

async function currentSubscription() {
  const reg = await registration();
  await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function readPushState(): Promise<PushState> {
  if (!supported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const key = await api.push.key();
    if (!key.data.enabled) return "unavailable";
    return (await currentSubscription()) ? "on" : "off";
  } catch {
    return "unavailable";
  }
}

export async function enablePush(audience: PushAudience): Promise<PushState> {
  if (!supported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  const key = await api.push.key();
  if (!key.data.enabled) return "unavailable";
  const reg = await registration();
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key.data.public_key) });
  }
  await api.push.subscribe(sub.toJSON(), audience);
  return "on";
}

export async function disablePush(): Promise<PushState> {
  const sub = await currentSubscription();
  if (sub) {
    await api.push.unsubscribe(sub.endpoint).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  return "off";
}

export function usePush(audience: PushAudience) {
  const [state, setState] = useState<PushState | "loading">("loading");

  useEffect(() => {
    let alive = true;
    readPushState().then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, []);

  const enable = useCallback(async () => {
    try {
      setState(await enablePush(audience));
    } catch {
      setState("off");
    }
  }, [audience]);

  const disable = useCallback(async () => {
    try {
      setState(await disablePush());
    } catch {
      setState("on");
    }
  }, []);

  return { state, enable, disable };
}
