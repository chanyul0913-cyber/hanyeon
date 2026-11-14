// 합연 — 서비스 워커: 로컬 자산 캐시(오프라인 사용). https 배포 환경에서만 등록됨(app.js와 달리 여기서 자체 등록).
"use strict";
const CACHE = "hanyeon-v18";
const ASSETS = [
  "./", "index.html", "style.css", "manifest.webmanifest", "icon.svg",
  "js/app.js", "js/chart.js", "js/couple.js", "js/daily.js", "js/western.js", "js/luck.js", "js/tojeong.js", "js/tarot.js", "js/engine.js", "js/selftest.js",
  "js/vendor/lunar.js", "js/vendor/astronomy.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match("./"))));
});
