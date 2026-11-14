// 합연 — 서비스 워커: 로컬 자산 캐시(오프라인 사용). https 배포 환경에서만 app.js가 등록한다.
"use strict";
const CACHE = "hanyeon-v23";
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
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  const put = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }; // 실패 응답은 캐시하지 않음
  if (req.mode === "navigate") { // 페이지는 네트워크 우선 — 새 배포가 바로 보이고, 오프라인이면 캐시
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req, { ignoreSearch: true }).then(h => h || caches.match("./"))));
    return;
  }
  // js·css는 ?v=N 버전 URL이라 정확히 일치할 때만 캐시 사용(쿼리 무시하면 새 배포 직후 옛 JS가 섞일 수 있음)
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(put)));
});
