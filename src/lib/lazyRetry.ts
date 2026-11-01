import { lazy, type ComponentType } from "react";

const KEY = "lmd_chunk_reload";

/** Remet le navigateur à zéro (caches et service worker) puis recharge, une seule fois par minute. */
export async function recoverFromStaleBuild() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* stockage indisponible */
  }
  try {
    const regs = await navigator.serviceWorker?.getRegistrations();
    await Promise.all((regs ?? []).map((r) => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    /* rien à nettoyer */
  }
  window.location.reload();
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await load();
    } catch (err) {
      if (await recoverFromStaleBuild()) return new Promise<never>(() => {});
      throw err;
    }
  });
}
