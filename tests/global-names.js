"use strict";
// 전역 이름 충돌 검사(Node 전용) — 모든 js가 한 전역에 올라가므로 같은 최상위 function/const 이름을 두 파일에서 정의하면
// 나중 파일이 앞 파일 것을 조용히 덮어쓴다(2026-11-22 실제 버그: consult.js drawTarot이 타로 탭 drawTarot을 덮어써 카드가 안 나옴).
// 사용: 저장소 루트에서 `node tests/global-names.js`
const fs = require("fs");
const files = [...fs.readFileSync("index.html", "utf8").matchAll(/<script src="(js\/(?!vendor)[^"?]+)/g)].map(m => m[1]);
const seen = new Map(), dup = [];
for (const f of files) for (const m of fs.readFileSync(f, "utf8").matchAll(/^(?:async\s+)?(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*))/gm)) {
  const name = m[1] || m[2];
  if (seen.has(name) && seen.get(name) !== f) dup.push(`${name}: ${seen.get(name)} ↔ ${f}`); else seen.set(name, f);
}
console.log(dup.length ? "전역 이름 충돌:\n" + dup.join("\n") : `전역 이름 충돌 없음 (${files.length}개 파일, ${seen.size}개 이름)`);
process.exit(dup.length ? 1 : 0);
