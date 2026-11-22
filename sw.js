// 합연 — 서비스 워커: 로컬 자산 캐시(오프라인 사용). https 배포 환경에서만 app.js가 등록한다.
// 설치 시 index.html을 읽어 그때의 js/*.js?v=N·style.css?v=N "정확한 버전 URL"을 워밍한다.
// (정적 목록에 버전 없는 URL을 넣으면 ?v=N 요청과 매칭되지 않아 설치 캐시가 무용지물이 된다)
"use strict";
const CACHE = "hanyeon-v57";
const mine = (req, opt) => caches.open(CACHE).then(c => c.match(req, opt)); // 같은 오리진의 다른 사이트(luckylab) 캐시는 보지 않음
const CORE = ["./", "index.html", "manifest.webmanifest", "icon.svg"];
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    try { // 새 index.html에서 js·css 링크를 뽑아 개별 워밍 — 하나가 실패해도 설치는 계속
      const html = await (await fetch("index.html", { cache: "no-store" })).text();
      const urls = [...new Set([...html.matchAll(/(?:src|href)="([^"]*(?:js\/|style\.css)[^"]*)"/g)].map(m => m[1]))];
      await Promise.allSettled(urls.map(async u => { const res = await fetch(u, { cache: "no-store" }); if (res.ok) await c.put(u, res.clone()); }));
    } catch {}
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  // 같은 github.io 오리진을 다른 사이트(luckylab 등)와 공유한다 — caches.keys()는 오리진 전체 캐시를 반환하므로
  // 반드시 우리 접두사(hanyeon-) 캐시만 정리한다. 필터 없이 지우면 다른 사이트의 오프라인 캐시까지 삭제된다.
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("hanyeon-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  const put = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }; // 실패 응답은 캐시하지 않음
  if (req.mode === "navigate") { // 페이지는 네트워크 우선 — 새 배포가 바로 보이고, 오프라인이면 캐시
    e.respondWith(fetch(req).then(put).catch(() => mine(req, { ignoreSearch: true }).then(h => h || mine("./"))));
    return;
  }
  // js·css는 ?v=N 버전 URL이라 정확히 일치할 때만 캐시 사용(쿼리 무시하면 새 배포 직후 옛 JS가 섞일 수 있음)
  e.respondWith(mine(req).then(hit => hit || fetch(req).then(put)));
});
