// 합연 계산 불변식 전수 검증 — 실행: node tests/property-check.js
// 계산 불변식 전수 검증 (property test)
const fs = require("fs"), vm = require("vm");
const dir = "D:/궁합/js/";
const lun = require(dir + "vendor/lunar.js");
global.window = global; global.Solar = lun.Solar; global.Lunar = lun.Lunar; global.LunarYear = lun.LunarYear;
global.Astronomy = require(dir + "vendor/astronomy.js");
vm.runInThisContext(fs.readFileSync(dir + "engine.js", "utf8"), { filename: "engine.js" });
vm.runInThisContext(fs.readFileSync(dir + "western.js", "utf8"), { filename: "western.js" });
vm.runInThisContext(fs.readFileSync(dir + "selftest.js", "utf8"), { filename: "selftest.js" });

const P = []; const bad = t => P.push(t);
// 실행: node tests/property-check.js  — 실패 시 P에 쌓이고 마지막에 보고. selfTest와 별개의 전수 불변식 검증.
const JI_K = "子丑寅卯辰巳午未申酉戌亥";

// 1) 지장간 본기 = 지지 오행 일치 (12개 전부)
JI_MAIN.forEach((ganIdx, ji) => { if (GAN_OH[ganIdx] !== JI_OH[ji]) bad("지장간 본기 오행 불일치: " + JI_K[ji]); });

// 2) 신살 표 완전성 — 삼합국 4그룹별로 값이 일관 + 4그룹 값이 서로 다른 지지 + 자기 그룹 원소가 아님
const GROUPS = [["신", "자", "진"], ["인", "오", "술"], ["사", "유", "축"], ["해", "묘", "미"]];
for (const [name, TBL] of [["도화", DOWHWA], ["역마", YEOKMA], ["화개", HWAGAE]]) {
  const gv = GROUPS.map(g => g.map(x => TBL[x]));
  if (gv.some(g2 => new Set(g2).size !== 1)) bad(name + "살 삼합국 내 불일치");
  const v = gv.map(g2 => g2[0]);
  if (new Set(v).size !== 4) bad(name + "살 그룹값 중복: " + v.join(","));
  if (name !== "화개") GROUPS.forEach((g, i) => { if (g.includes(v[i])) bad(name + "살 그룹값이 자기 원소: " + v[i]); }); // 화개는 전통적으로 자기 그룹의 묘지를 가리킴
}

// 3) 천을귀인 — 10천간 전부 정의 + 각 2지
for (let g = 0; g < 10; g++) if (!CHEONEUL[g] || CHEONEUL[g].length !== 2) bad("천을귀인 누락: 간" + g);

// 4) 60갑자 순회 — 일진이 730일 연속 +1인지 (매년 경계 포함, 3년)
let prev = null;
for (let d = new Date(2025, 0, 1, 12); d <= new Date(2028, 11, 31, 12); d = addDays(d, 1)) {
  const gz = getDayGZ(d).hanja;
  const g = "甲乙丙丁戊己庚辛壬癸".indexOf(gz[0]), j = JI.indexOf(gz[1]);
  let n = -1; for (let k = 0; k < 60; k++) if (k % 10 === g && k % 12 === j) n = k;
  if (n < 0) { bad("일진 간지 파싱 실패: " + gz); break; }
  if (prev !== null && (n - prev + 60) % 60 !== 1) bad("일진 끊김: " + ymdOf(d));
  prev = n;
}

// 5) 12운성 — 각 천간의 12지 지정이 전부 유니크(12운성 12개를 정확히 한 번씩)
for (let g = 0; g < 10; g++) {
  const set = new Set();
  for (let j = 0; j < 12; j++) set.add(woonseong(g, j));
  if (set.size !== 12) bad("12운성 중복: 간" + g);
}

// 6) 오행 생극 일관성 — 생극이 서로 역방향 일관(목생화 ⟺ 화극수 아님, 대신 화극금 체계 확인)
for (const o of OHS) { if (OH_GEN[OH_GEN[o]] === o) bad("생 규칙 오류: " + o); if (OH_KEUK[OH_KEUK[o]] === o) bad("극 규칙 오류: " + o); }

// 7) 365일 × 4계산 — 결정론(같은 입력 → 같은 출력) + 범위
const p1 = calcPerson({ name: "A", y: 1981, m: 8, d: 13, cal: "solar", leap: false, h: "16", mi: 30 });
const p2 = calcPerson({ name: "B", y: 1980, m: 12, d: 24, cal: "solar", leap: false, h: "9", mi: 30 });
let d = new Date(2026, 10, 20, 12);
for (let i = 0; i < 365; i++) {
  const r1a = dailySync(p1, p2, d), r1b = dailySync(p1, p2, d);
  if (r1a.score !== r1b.score) { bad("dailySync 비결정: " + ymdOf(d)); break; }
  const iv1 = investSync(p1, d), iv2 = investSync(p1, d);
  if (iv1.west !== iv2.west) { bad("investSync 비결정: " + ymdOf(d)); break; }
  const pd1 = personDay(p1, d);
  if (pd1.score < 0 || pd1.score > 100) { bad("personDay 범위: " + ymdOf(d)); break; }
  if (r1a.score < 0 || r1a.score > 100) { bad("dailySync 범위: " + ymdOf(d)); break; }
  d = addDays(d, 1);
}

// 8) reunionScore — 90일 스캔과 breakupAnalysis 일치 (같은 날 같은 점수)
const ba = breakupAnalysis(p1, p2, 20261015);
const probe = new Date(); let match = true;
for (let i = 0; i < 30; i++) { const dt = addDays(probe, i); if (reunionScore(p1, p2, dt).score !== ba.days[i].score) { match = false; break; } }
if (!match) bad("breakupAnalysis.days와 reunionScore 불일치");
if (ba.top.some(x => x.score < 6)) bad("top에 저점 포함");

// 9) investSync 쌍 상한 — 4투자행성×4출생=16
const iv = investSync(p1, new Date(2026, 10, 20, 12));
if (iv.harm.length + iv.tense.length > 16) bad("investSync 쌍 초과");

console.log(P.length ? "❌ 실패 " + P.length + "건:\n" + P.slice(0, 10).join("\n") : "✅ 불변식 전부 통과 (지장간·신살·60갑자·12운성·생극·결정론·범위·스캔 일치)");
selfTest().then(r => console.log("selfTest:", r.ok ? "ok:true" : "실패 " + JSON.stringify(r.problems.slice(0, 5))));
