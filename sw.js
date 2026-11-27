// 정원이의 마을 오프라인 캐시. 내용을 고쳐서 다시 올릴 때는 아래 버전 숫자를 올려 주세요.
const CACHE = "jeongwon-town-v5";
const CORE = ["./", "index.html", "manifest.webmanifest", "packs.json", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url), same = u.origin === self.location.origin;
  // 화면(html)과 새 문제(packs.json)는 인터넷이 되면 늘 새 것을 먼저 받아요
  if (same && (e.request.mode === "navigate" || u.pathname.endsWith(".html") || u.pathname.endsWith("/") || u.pathname.endsWith("packs.json"))) {
    e.respondWith(caches.open(CACHE).then(c => fetch(u.origin + u.pathname, {cache: "no-cache"}).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => c.match(e.request, {ignoreSearch: true}).then(h => h || c.match("index.html")))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => { const hit = await c.match(e.request, {ignoreSearch: same}); const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => hit); return hit || net; }));
});
