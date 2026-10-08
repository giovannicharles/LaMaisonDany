/* LaMaison Dany : service worker (PWA).
 * - Le site (coquille, scripts, polices, icônes) est mis en cache : ouverture instantanée et hors connexion.
 * - Catalogue, catégories et réglages : réseau d'abord, dernière version connue si le réseau est lent ou coupé.
 * - Photos : affichées tout de suite depuis le cache, rafraîchies en arrière-plan.
 * - Jamais mis en cache : admin (requêtes avec jeton), messages, statistiques, envois.
 * Changez VERSION pour forcer le renouvellement de tous les caches. */
const VERSION = "v1";
const SHELL = `lmd-shell-${VERSION}`;
const STATIC = `lmd-static-${VERSION}`;
const IMAGES = `lmd-images-${VERSION}`;
const DATA = `lmd-data-${VERSION}`;
const CURRENT = [SHELL, STATIC, IMAGES, DATA];

const PRECACHE = [
  "/offline.html",
  "/site.webmanifest",
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

// Pages : on sert la coquille du site tout de suite et on la renouvelle en arrière-plan.
async function handleNavigation(event) {
  const cache = await caches.open(SHELL);
  const cached = await cache.match("/");
  const refresh = fetch("/", { cache: "no-store" })
    .then((res) => {
      if (res.ok) cache.put("/", res.clone());
      return res;
    })
    .catch(() => null);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  const fresh = await refresh;
  if (fresh) return fresh;
  return (await caches.match("/offline.html")) || new Response("Hors connexion", { status: 503 });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
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
