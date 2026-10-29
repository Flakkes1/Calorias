// Service worker: guarda a aplicação para funcionar sem internet.
// Quando alterar index.html, mude o número da versão abaixo para forçar a atualização.
const VERSAO = "calorias-v8";
const FICHEIROS = ["./", "index.html", "manifest.webmanifest", "zxing.min.js", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // APIs externas passam direto
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => e.request.mode === "navigate" ? caches.match("index.html") : undefined))
  );
});
