/* LaMaison Dany : service worker (PWA).
 * - Le site (coquille, scripts, polices, icônes) est mis en cache : ouverture instantanée et hors connexion.
 * - Catalogue, catégories et réglages : réseau d'abord, dernière version connue si le réseau est lent ou coupé.
 * - Photos : affichées tout de suite depuis le cache, rafraîchies en arrière-plan.
 * - Jamais mis en cache : admin (requêtes avec jeton), messages, statistiques, envois.
 * Changez VERSION pour forcer le renouvellement de tous les caches. */
const VERSION = "v3";
const SHELL = `lmd-shell-${VERSION}`;
const STATIC = `lmd-static-${VERSION}`;
const IMAGES = `lmd-images-${VERSION}`;
const DATA = `lmd-data-${VERSION}`;
const CURRENT = [SHELL, STATIC, IMAGES, DATA];

const PRECACHE = [
  "/offline.html",
  "/site.webmanifest",
  "/admin.webmanifest",
  "/admin-icon-192.png",
  "/boot.js",
  "/favicon.svg",
  "/icon-192.png",
  "/fonts/bodoni-moda.woff2",
  "/fonts/bodoni-moda-italic.woff2",
  "/fonts/jost.woff2",
];
const CACHEABLE_API = ["/api/products", "/api/categories", "/api/settings", "/api/pages"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL);
      const stat = await caches.open(STATIC);
      await Promise.allSettled(PRECACHE.map((url) => stat.add(url)));
      try {
        const res = await fetch("/", { cache: "no-store" });
        if (res.ok) {
          const html = await res.clone().text();
          await shell.put("/", res);
          const assets = [...new Set(html.match(/\/assets\/[^"'\s)]+\.(?:js|css)/g) || [])];
          await Promise.allSettled(assets.map((url) => stat.add(url)));
        }
      } catch {
        /* installation hors connexion : on réessaiera à la prochaine visite */
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("lmd-") && !CURRENT.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

// Pages : le réseau d'abord (pour toujours charger les fichiers de la dernière version), la coquille en cache si le réseau est lent ou coupé.
async function handleNavigation(event) {
  const cache = await caches.open(SHELL);
  try {
    const res = await withTimeout(fetch("/", { cache: "no-store" }), 3500);
    if (res.ok) {
      event.waitUntil(cache.put("/", res.clone()));
      return res;
    }
  } catch {
    /* réseau lent ou coupé : on retombe sur le cache */
  }
  const cached = await cache.match("/");
  if (cached) return cached;
  return (await caches.match("/offline.html")) || new Response("Hors connexion", { status: 503 });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    const type = res.headers.get("content-type") || "";
    // Un fichier introuvable renvoyé sous forme de page HTML ne doit jamais être mis en cache ni servi comme script.
    if (res.ok && !(request.destination !== "document" && type.includes("text/html"))) cache.put(request, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

async function staleWhileRevalidate(event, request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok || res.type === "opaque") {
        cache.put(request, res.clone()).then(() => trim(cacheName, max));
      }
      return res;
    })
    .catch(() => null);
  if (hit) {
    event.waitUntil(network);
    return hit;
  }
  return (await network) || Response.error();
}

async function networkFirstData(request) {
  const cache = await caches.open(DATA);
  try {
    const res = await withTimeout(fetch(request), 5000);
    if (res.ok) {
      cache.put(request, res.clone()).then(() => trim(DATA, 80));
    }
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.headers.get("authorization")) return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    if (url.origin !== self.location.origin) return;
    event.respondWith(handleNavigation(event));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (CACHEABLE_API.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"))) {
      event.respondWith(networkFirstData(request));
    }
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(event, request, IMAGES, 150));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname === "/sw.js") return;
    if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/") || /\.(?:png|svg|ico|woff2|webmanifest)$/.test(url.pathname)) {
      event.respondWith(cacheFirst(request, STATIC));
    }
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "LaMaison Dany";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of windows) {
        if (w.url.startsWith(self.location.origin)) {
          await w.focus();
          if ("navigate" in w) await w.navigate(target).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
