// Service worker: guarda a aplicação para funcionar sem internet.
// Navegações verificam a rede primeiro; a cache serve de alternativa offline.
const VERSAO = "calorias-v13";
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
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, {cache: "no-cache"}).then(r => {
        if (!r.ok) return r;
        return caches.open(VERSAO).then(c => c.put(e.request, r.clone()))
          .then(() => r, err => {
            console.warn("Não foi possível guardar a página atualizada para uso offline.", err);
            return r;
          });
      }).catch(() => caches.match(e.request)
        .then(r => r || caches.match("./"))
        .then(r => r || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
