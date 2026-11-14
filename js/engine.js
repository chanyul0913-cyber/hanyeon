"use strict";
// 합연(合緣) — 사주·궁합 계산 엔진 (UI 없음, 계산만)
// 사주 8글자는 lunar-javascript(6tail, MIT, js/vendor/lunar.js)로 계산한다.
// 서울은 동경 135° 표준시보다 실제 태양시가 약 30분 늦으므로 시주 경계에 30분 보정한다.
// 속궁합 점수(0~100) = 애정 동조(재성·관성) + 천간합 + 지지 육합/삼합 − 충·형·원진·파·해
//   + 오행 유입/극 + 용신(부족 오행) + 신살(도화·천을귀인).
// 합궁(✿) = 그날 일간 오행이 그녀 일간을 生하거나 같은 오행인 날(+8). 일지 충은 −6.

// ---------- 기본 상수 ----------
const GAN = "甲乙丙丁戊己庚辛壬癸", GAN_K = "갑을병정무기경신임계";
const JI = "子丑寅卯辰巳午未申酉戌亥", JI_K = "자축인묘진사오미신유술해";
const GAN_OH = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];  // 천간 오행
const JI_OH  = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"]; // 지지 오행
const OHS = ["목", "화", "토", "금", "수"];
const OH_COLOR = { 목: "#5fb98a", 화: "#e2655c", 토: "#d3a94e", 금: "#c8ccd8", 수: "#5d9fd6" };
const OH_GEN  = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" }; // 生成 (나→저)
const OH_KEUK = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" }; // 剋制 (나→저)
const ohKeukMe = o => OHS.find(x => OH_KEUK[x] === o);  // 나를 극하는 오행(관성)
const ohGenMe  = o => OHS.find(x => OH_GEN[x] === o);   // 나를 生하는 오행(인성)

// 천간합 (갑기→토, 을경→금, 병신→수, 정임→목, 무계→화)
const GAN_HAP = [[0, 5, "토"], [1, 6, "금"], [2, 7, "수"], [3, 8, "목"], [4, 9, "화"]];
const ganHapWith = g => { const h = GAN_HAP.find(p => p[0] === g || p[1] === g); return h ? { with: h[0] === g ? h[1] : h[0], to: h[2], name: GAN_K[h[0]] + GAN_K[h[1]] + "합(" + h[2] + ")" } : null; };
const isGanHap = (a, b) => GAN_HAP.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));

// 지지 관계 (우선순위: 육합 > 삼합 > 충 > 형 > 해 > 원진 > 파 — 겹칠 때 앞의 것)
const REL_TABLE = [
  ["육합", [["자", "축"], ["인", "해"], ["묘", "술"], ["진", "유"], ["사", "신"], ["오", "미"]]],
  ["삼합", [["신", "자"], ["자", "진"], ["신", "진"], ["인", "오"], ["오", "술"], ["인", "술"], ["사", "유"], ["유", "축"], ["사", "축"], ["해", "묘"], ["묘", "미"], ["해", "미"]]],
  ["충",   [["자", "오"], ["축", "미"], ["인", "신"], ["묘", "유"], ["진", "술"], ["사", "해"]]],
  ["형",   [["인", "사"], ["사", "신"], ["인", "신"], ["축", "술"], ["술", "미"], ["축", "미"], ["자", "묘"], ["진", "진"], ["오", "오"], ["유", "유"], ["해", "해"]]],
  ["해",   [["자", "미"], ["축", "오"], ["인", "사"], ["묘", "진"], ["신", "해"], ["유", "술"]]],
  ["원진", [["자", "술"], ["축", "유"], ["인", "신"], ["묘", "미"], ["진", "오"], ["사", "해"]]],
  ["파",   [["자", "유"], ["오", "묘"], ["진", "축"], ["술", "미"], ["인", "해"], ["신", "사"]]]];
const zaRel = (a, b) => { for (const [k, ps] of REL_TABLE) if (ps.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return k; return null; };

// 지장간 (본기·중기·여기) — 천간 인덱스 배열
const JJI_JANG = [[9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 4, 6], [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0]];

// 12운성 (장생 목욕 관대 건록 제왕 쇠 병 사 묘 절 태 양) — 양간 순행·음간 역행, 장생 지지 기준
const WOONSEONG = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];
const WS_START = { 0: 11, 1: 6, 2: 2, 3: 9, 4: 2, 5: 9, 6: 5, 7: 0, 8: 8, 9: 3 }; // 간→장생 지지 인덱스
const woonseong = (dmGan, ji) => {
  const start = WS_START[dmGan], step = dmGan % 2 === 0 ? 1 : -1;
  const d = ((ji - start) * step % 12 + 12) % 12;
  return WOONSEONG[d];
};

// 신살 (일지 기준 삼합국) — 도화(끌림), 역마(활동), 화개(예술·고독), 천을귀인(도움)
const SAMSUNG = { 신: "자", 자: "진", 진: "신", 인: "오", 오: "술", 술: "인", 사: "유", 유: "축", 축: "사", 해: "묘", 묘: "미", 미: "해" };
const DOWHWA = { 신: "유", 자: "유", 진: "유", 인: "묘", 오: "묘", 술: "묘", 사: "오", 유: "오", 축: "오", 해: "자", 묘: "자", 미: "자" };
const YEOKMA = { 신: "인", 자: "인", 진: "인", 인: "신", 오: "신", 술: "신", 사: "해", 유: "해", 축: "해", 해: "사", 묘: "사", 미: "사" };
const HWAGAE  = { 신: "진", 자: "진", 진: "진", 인: "술", 오: "술", 술: "술", 사: "축", 유: "축", 축: "축", 해: "미", 묘: "미", 미: "미" };
const CHEONEUL = { 0: ["축", "미"], 4: ["축", "미"], 6: ["축", "미"], 1: ["자", "신"], 5: ["자", "신"], 2: ["해", "유"], 3: ["해", "유"], 8: ["사", "묘"], 9: ["사", "묘"], 7: ["오", "인"] };
function shinsalOf(dmGan, dmJiIdx, dayJiIdx) { // 지지는 인덱스로 받아 표(한글 키)에 맞게 변환
  const out = [], dmJi = JI_K[dmJiIdx], dayJi = JI_K[dayJiIdx];
  if (DOWHWA[dmJi] === dayJi) out.push({ name: "도화살", desc: "매력과 끌림이 살아나는 날" });
  if (YEOKMA[dmJi] === dayJi) out.push({ name: "역마살", desc: "움직임·외출·여행에 좋은 날" });
  if (HWAGAE[dmJi] === dayJi) out.push({ name: "화개살", desc: "혼자만의 시간과 취미가 맞는 날" });
  if (CHEONEUL[dmGan] && CHEONEUL[dmGan].includes(dayJi)) out.push({ name: "천을귀인", desc: "귀인의 도움이 따르는 날" });
  return out;
}

// 십신 (일간 기준 상대 천간의 십신) — AI로또 fortune.js 방식 재사용
function shiShen(dmGan, gan) {
  const dOh = GAN_OH[dmGan], xOh = GAN_OH[gan], dYang = dmGan % 2 === 0, xYang = gan % 2 === 0;
  if (xOh === dOh) return dYang === xYang ? "비견" : "겁재";
  if (OH_GEN[dOh] === xOh) return dYang === xYang ? "식신" : "상관";
  if (OH_KEUK[dOh] === xOh) return dYang === xYang ? "편재" : "정재";
  if (OH_KEUK[xOh] === dOh) return dYang === xYang ? "편관" : "정관";
  return dYang === xYang ? "편인" : "정인";
}
const SHISHEN_COLOR = { 비견: "#8fbf9f", 겁재: "#b98f8f", 식신: "#9fb98f", 상관: "#b9a28f", 편재: "#c8a95f", 정재: "#d3a94e", 편관: "#b96f5f", 정관: "#c86f5f", 편인: "#8f9fb9", 정인: "#5d9fd6" };

// ---------- 달력 유틸 ----------
const ymdOf = d => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); x.setDate(x.getDate() + n); return x; };
const dowK = ["일", "월", "화", "수", "목", "금", "토"];

// ---------- 사람 사주 계산 ----------
// profile: {name, y, m, d, cal:"solar"|"lunar", leap:boolean, h:""|"0..23", mi:number}
function calcPerson(p) {
  if (!window.Solar || !window.Lunar) throw new Error("사주 계산 라이브러리(lunar.js)를 불러오지 못했습니다.");
  if (!(p.y >= 1900 && p.y <= 2100)) throw new Error("1900년~2100년 사이만 계산할 수 있습니다.");
  const known = p.h !== "";
  let solar;
  try {
    solar = p.cal === "lunar"
      ? Lunar.fromYmdHms(p.y, p.leap ? -p.m : p.m, p.d, known ? +p.h : 12, known ? +p.mi : 0, 0).getSolar()
      : Solar.fromYmdHms(p.y, p.m, p.d, known ? +p.h : +12, known ? +p.mi : 0, 0);
  } catch {
    throw new Error(p.cal === "lunar" && p.leap ? `${p.y}년에는 음력 ${p.m}월 윤달이 없습니다.` : "존재하지 않는 날짜입니다.");
  }
  const chk = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  if (chk.getMonth() !== solar.getMonth() - 1) throw new Error("존재하지 않는 날짜입니다.");
  if (p.cal === "solar" && (solar.getMonth() !== p.m || solar.getDay() !== p.d)) throw new Error("존재하지 않는 날짜입니다.");
  if (known) solar = Solar.fromDate(new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute() - 30)); // 서울 태양시 보정
  const ec = solar.getLunar().getEightChar();
  const names = ["년주", "월주", "일주", "시주"];
  const raw = [ec.getYear(), ec.getMonth(), ec.getDay(), known ? ec.getTime() : null];
  const pillars = raw.map((s, i) => s && { name: names[i], gan: GAN.indexOf(s[0]), ji: JI.indexOf(s[1]), hanja: s });
  // 오행 분포 (시주 모름이면 6글자)
  const cnt = Object.fromEntries(OHS.map(o => [o, 0]));
  pillars.forEach(x => { if (x) { cnt[GAN_OH[x.gan]]++; cnt[JI_OH[x.ji]]++; } });
  // 용신 근사: 가장 부족한 오행 (동률이면 일간을 生하는 오행 우선)
  const mn = Math.min(...Object.values(cnt));
  const lows = OHS.filter(o => cnt[o] === mn);
  const yongsin = lows.length === 1 ? lows[0] : (lows.includes(ohGenMe(GAN_OH[pillars[2].gan])) ? ohGenMe(GAN_OH[pillars[2].gan]) : lows[0]);
  const dm = pillars[2];
  return {
    name: p.name, profile: p, pillars, cnt, yongsin, known,
    dmGan: dm.gan, dmJi: dm.ji, dmOh: GAN_OH[dm.gan], dmHanja: dm.hanja,
    ilju: GAN_K[dm.gan] + JI_K[dm.ji] + " (" + dm.hanja + ")",
    jaeOh: OH_KEUK[GAN_OH[dm.gan]],       // 남자 기준 여자=재성
    gwanOh: ohKeukMe(GAN_OH[dm.gan]),     // 여자 기준 남자=관성
    solarYmd: solar.toYmd(),
    lunarYmd: (() => { const L = solar.getLunar(); return `${L.getYear()}년 ${L.getMonth() < 0 ? "윤" : ""}${Math.abs(L.getMonth())}월 ${L.getDay()}일`; })(),
    zodiac: zodiacSign(solar.getYear(), solar.getMonth(), solar.getDay())
  };
}

// 그날의 일주(일진) — 자정 경계 기준
function getDayGZ(date) {
  const s = Solar.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const gz = s.getLunar().getDayInGanZhi();
  const gan = GAN.indexOf(gz[0]), ji = JI.indexOf(gz[1]);
  return { gan, ji, hanja: gz, oh: GAN_OH[gan], jiOh: JI_OH[ji], ilju: GAN_K[gan] + JI_K[ji] };
}

// ---------- 일별 속궁합·합궁 ----------
// 두 사람(person) 사이에서 그 date의 궁합 상태를 계산한다.
function dailySync(p1, p2, date) {
  const d = getDayGZ(date);
  const mOh = p1.dmOh, fOh = p2.dmOh; // 나(M), 그녀(F)
  const D = d.oh;
  const reasons = [];
  let score = 50;
  const flags = { tension: false, love: false, charm: false, herStrong: false, danger: false };

  // 1) 애정 동조일 — 그날의 기가 '나의 재성(여자 운)'이면서 '그녀의 관성(남자 운)'인 날
  if (D === p1.jaeOh && D === p2.gwanOh) { score += 20; flags.love = "mutual"; reasons.push({ t: "애정 동조일", s: +20, x: `그날의 기운(${D})이 나의 재성이자 그녀의 관성 — 두 사람의 애정 기운이 동시에 들어오는 데이트 길일` }); }
  else if (D === p1.jaeOh) { score += 8; flags.love = "me"; reasons.push({ t: "나의 애정운(재성일)", s: +8, x: "그날의 기운이 나의 애정(재성)과 같은 오행 — 표현하고 주고 싶은 날" }); }
  else if (D === p2.gwanOh) { score += 8; flags.love = "her"; reasons.push({ t: "그녀의 애정운(관성일)", s: +8, x: "그날의 기운이 그녀의 관성과 같은 오행 — 그녀에게 이끌리는 날" }); }

  // 2) 천간합 — 그날 일간이 각자 일간과 합하는 날
  const h1 = ganHapWith(d.gan), h2 = ganHapWith(p1.dmGan), h3 = ganHapWith(p2.dmGan);
  if (h1 && h1.with === p1.dmGan) { score += 10; reasons.push({ t: `나와 천간합(${h1.name})`, s: +10, x: "그날의 천간이 나의 일간과 합(合) — 마음이 닿는 날" }); }
  if (h1 && h1.with === p2.dmGan) { score += 10; reasons.push({ t: `그녀와 천간합(${h1.name})`, s: +10, x: "그날의 천간이 그녀의 일간과 합(合) — 그녀가 마음을 열어 주는 날" }); }

  // 3) 지지 관계 — 그날 일지 vs 각자 일지
  const relOf = (who, myJi) => {
    const r = zaRel(JI_K[d.ji], JI_K[myJi]);
    if (!r) return null;
    const W = { 육합: 12, 삼합: 8, 충: -6, 형: -8, 해: -3, 원진: -6, 파: -3 };
    return { r, w: W[r] };
  };
  const r1 = relOf("나", p1.dmJi), r2 = relOf("그녀", p2.dmJi);
  for (const [rr, who] of [[r1, "나"], [r2, "그녀"]]) {
    if (!rr) continue;
    score += rr.w;
    const good = ["육합", "삼합"].includes(rr.r);
    reasons.push({ t: `${who}의 일지와 ${rr.r}`, s: rr.w, x: good ? `그날 일지가 ${who}의 일지와 ${rr.r} — ${who === "나" ? "나" : "그녀"}의 땅(일지)이 편안해지는 날` : `그날 일지가 ${who}의 일지와 ${rr.r} — ${who === "나" ? "내" : "그녀의"} 마음이 조심스러운 날(무리한 대화 피하기)` });
    if (rr.r === "육합") flags.charm = true;
    if (["충", "형"].includes(rr.r)) flags.tension = true;
  }

  // 4) 오행 유입/극 — 그날의 기가 각자의 일간에게 어떻게 닿는가
  const inflow = (oh) => D === oh ? 0 : (OH_GEN[D] === oh ? 1 : (OH_KEUK[D] === oh ? -1 : (OH_GEN[oh] === D ? 2 : 0)));
  // 1: 生해줌(인성 유입) 2: 내가 生함(식상 표현) -1: 극함(관살 긴장)
  const i1 = inflow(mOh), i2 = inflow(fOh);
  if (i1 === 1) { score += 5; reasons.push({ t: "나에게 기운 유입(인성)", s: +5, x: `그날의 ${D} 기운이 나의 ${mOh} 일간을 生 — 채워지고 보호받는 날` }); }
  if (i1 === -1) { score -= 5; reasons.push({ t: "나에게 긴장 유입(관살)", s: -5, x: `그날의 ${D} 기운이 나의 ${mOh} 일간을 극 — 부담과 압박을 느끼기 쉬운 날` }); }
  if (i2 === 1) { score += 5; reasons.push({ t: "그녀에게 기운 유입(인성)", s: +5, x: `그날의 ${D} 기운이 그녀의 ${fOh} 일간을 生 — 그녀가 편안해지는 날` }); }
  if (i2 === -1) { score -= 5; reasons.push({ t: "그녀에게 긴장 유입(관살)", s: -5, x: `그날의 ${D} 기운이 그녀의 ${fOh} 일간을 극 — 그녀가 예민해지기 쉬운 날` }); }

  // 4-1) 합궁(✿) — 그날 오행이 그녀 일간을 生(인성)하거나 같은 오행(비견)인 날 +8
  if (i2 === 1 || D === fOh) { flags.herStrong = true; score += 8; reasons.push({ t: "합궁일(✿)", s: +8, x: i2 === 1 ? `그날의 ${D} 기운이 그녀의 ${fOh} 일간을 生 — 그녀가 채워져 여유 있고 덜 지치는 날` : `그날이 그녀와 같은 ${fOh} 기운 — 그녀가 스스로 힘이 있는 날` }); }

  // 4-2) 최고 위험일(⚡) — 그날 일지가 누군가의 일지와 충 + 그날 천간이 누군가의 일간을 극. 표시용, 점수는 충·극 항목에 이미 반영
  if ([r1, r2].some(x => x && x.r === "충") && (i1 === -1 || i2 === -1)) { flags.danger = true; reasons.push({ t: "최고 위험일(⚡)", s: 0, x: "일지 충과 일간 극이 겹치는 날 — 만나거나 통화할 때 감정이 가장 부딪히기 쉬운 날. 예민한 이야기는 미루고 말투를 부드럽게" }); }

  // 5) 용신(부족 오행)이 들어오는 날
  if (D === p1.yongsin) { score += 6; reasons.push({ t: "나의 용신일", s: +6, x: `내 사주에 가장 부족한 ${p1.yongsin} 오행이 그날에 들어옴 — 균형이 맞아가는 날` }); }
  if (D === p2.yongsin) { score += 6; reasons.push({ t: "그녀의 용신일", s: +6, x: `그녀 사주에 가장 부족한 ${p2.yongsin} 오행이 그날에 들어옴 — 그녀의 컨디션이 좋아지는 날` }); }

  // 7) 신살 — 도화(끌림)·천을귀인
  const ss1 = shinsalOf(p1.dmGan, p1.dmJi, d.ji), ss2 = shinsalOf(p2.dmGan, p2.dmJi, d.ji);
  const allSS = [...ss1.map(x => ({ ...x, who: "나" })), ...ss2.map(x => ({ ...x, who: "그녀" }))];
  if (allSS.some(x => x.name === "도화살")) { score += 6; flags.charm = true; reasons.push({ t: "도화살 발동", s: +6, x: "그날 일지가 도화(桃花) — 매력과 끌림이 살아나는 날" }); }
  if (allSS.some(x => x.name === "천을귀인")) { score += 5; reasons.push({ t: "천을귀인 발동", s: +5, x: "그날 일지가 천을귀인 — 귀인의 도움이 따르는 날" }); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = score >= 82 ? { k: "peak", label: "속궁합 최고", stars: 3 }
    : score >= 68 ? { k: "good", label: "좋음", stars: 2 }
    : score >= 52 ? { k: "normal", label: "보통", stars: 1 }
    : score >= 38 ? { k: "care", label: "주의", stars: 0 }
    : { k: "bad", label: "긴장", stars: 0 };
  return {
    date: ymdOf(date), dow: date.getDay(), dayGZ: d,
    score, grade, flags, reasons,
    ss: allSS,
    ss1: { 십신: shiShen(p1.dmGan, d.gan), 운성: woonseong(p1.dmGan, d.ji) },
    ss2: { 십신: shiShen(p2.dmGan, d.gan), 운성: woonseong(p2.dmGan, d.ji) }
  };
}

// ---------- 일주×일주 고정 궁합 ----------
function coupleFixed(p1, p2) {
  const parts = [];
  let score = 50;
  const mOh = p1.dmOh, fOh = p2.dmOh;

  // 천간(마음) 관계
  if (isGanHap(p1.dmGan, p2.dmGan)) {
    const h = ganHapWith(p1.dmGan);
    score += 25; parts.push({ t: "천간 관계 — 천간합", v: `${GAN_K[p1.dmGan]}·${GAN_K[p2.dmGan]} 합`, s: 25, x: `두 사람의 마음(일간)이 ${GAN_K[p1.dmGan]}${GAN_K[p2.dmGan]}합으로 묶여 있는 구조. 만나려는 힘이 강하고 곁에 있고 싶은 인연입니다.` });
  } else if (mOh === fOh) {
    score += 10; parts.push({ t: "천간 관계 — 비화(比和)", v: `같은 ${mOh} 일간`, s: 10, x: "두 사람의 마음이 같은 오행 — 서로를 잘 이해하고 리듬이 비슷합니다. 다만 닮아서 같은 약점을 함께 가질 수 있습니다." });
  } else if (OH_GEN[mOh] === fOh) {
    score += 15; parts.push({ t: "천간 관계 — 내가 生", v: `${mOh} → ${fOh}`, s: 15, x: `나의 ${mOh} 일간이 그녀의 ${fOh} 일간을 生하는 구조. 내가 아끼고 챙겨 주는 관계입니다.` });
  } else if (OH_GEN[fOh] === mOh) {
    score += 15; parts.push({ t: "천간 관계 — 그녀가 生", v: `${fOh} → ${mOh}`, s: 15, x: `그녀의 ${fOh} 일간이 나의 ${mOh} 일간을 生하는 구조. 그녀가 나를 아끼고 챙겨 주는 관계입니다.` });
  } else if (OH_KEUK[mOh] === fOh) {
    score -= 6; parts.push({ t: "천간 관계 — 내가 극", v: `${mOh} ⊣ ${fOh}`, s: -6, x: `내 ${mOh} 기운이 그녀의 ${fOh}를 누르는 구조. 주도권은 내가 잡지만 강압적으로 흐르지 않게 주의하세요.` });
  } else {
    score -= 10; parts.push({ t: "천간 관계 — 그녀가 극", v: `${fOh} ⊣ ${mOh}`, s: -10, x: `그녀의 ${fOh} 기운이 나의 ${mOh}를 누르는 구조. 서로 긴장이 생기기 쉬우니 대화 방식을 부드럽게.` });
  }

  // 일지(몸·삶터) 관계
  const rel = zaRel(JI_K[p1.dmJi], JI_K[p2.dmJi]);
  if (rel === "육합") { score += 20; parts.push({ t: "일지 관계 — 지지 육합", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 육합`, s: 20, x: "일지(몸, 삶터)가 육합 — 함께 있으면 편안해지는 대표적인 부부·연인 인연의 조합입니다." }); }
  else if (rel === "삼합") { score += 12; parts.push({ t: "일지 관계 — 지지 삼합(반합)", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 삼합`, s: 12, x: "일지가 삼합 — 두 사람의 삶이 힘을 합쳐 커지는 구조입니다." }); }
  else if (rel === "충") { score -= 15; parts.push({ t: "일지 관계 — 지지 충", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 충`, s: -15, x: "일지가 충(沖) — 부딪히면서 배우는 인연. 자극과 성장도 있으나 같은 공간의 생활 방식 차이가 부딪히기 쉽습니다." }); }
  else if (rel === "형") { score -= 10; parts.push({ t: "일지 관계 — 지지 형", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 형`, s: -10, x: "일지가 형(刑) — 예민하게 부딪히는 구석이 있습니다. 규칙과 약속을 명확히 하면 부드러워집니다." }); }
  else if (rel === "원진") { score -= 8; parts.push({ t: "일지 관계 — 지지 원진", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 원진`, s: -8, x: "일지가 원진(怨嗔) — 사소한 말에 서로 상처받기 쉬운 조합. 선피로 감싸는 습관이 약입니다." }); }
  else if (rel === "파") { score -= 5; parts.push({ t: "일지 관계 — 지지 파", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 파`, s: -5, x: "일지가 파(破) — 작은 어긋남이 누적되기 쉬우니 불편함을 쌓아두지 않는 것이 좋습니다." }); }
  else if (rel === "해") { score -= 5; parts.push({ t: "일지 관계 — 지지 해", v: `${JI_K[p1.dmJi]}·${JI_K[p2.dmJi]} 해`, s: -5, x: "일지가 해(害) — 서로의 방해 요소가 되기 쉬운 면이 있으나 의식적으로 배려하면 무난합니다." }); }
  else parts.push({ t: "일지 관계", v: "특별한 관계 없음", s: 0, x: "일지 사이에 합·충이 없어 서로의 삶터를 침범하지 않는 편안한 거리입니다." });

  // 오행 균형 — 서로의 부족을 채우는가
  const p1Lack = Object.entries(p1.cnt).sort((a, b) => a[1] - b[1])[0][0];
  const p2Lack = Object.entries(p2.cnt).sort((a, b) => a[1] - b[1])[0][0];
  const p2Max = Object.entries(p2.cnt).sort((a, b) => b[1] - a[1])[0][0];
  const p1Max = Object.entries(p1.cnt).sort((a, b) => b[1] - a[1])[0][0];
  if (p2Max === p1Lack && p2Lack !== p1Lack) { score += 10; parts.push({ t: "오행 보완 — 그녀가 나를 채움", v: `내 부족 ${p1Lack} ← 그녀의 다수 ${p2Max}`, s: 10, x: `내 사주에 부족한 ${p1Lack} 오행이 그녀에게 많습니다. 그녀가 곁에 있으면 내 균형이 잡히는 구조입니다.` }); }
  if (p1Max === p2Lack && p1Lack !== p2Lack) { score += 10; parts.push({ t: "오행 보완 — 내가 그녀를 채움", v: `그녀의 부족 ${p2Lack} ← 나의 다수 ${p1Max}`, s: 10, x: `그녀 사주에 부족한 ${p2Lack} 오행이 나에게 많습니다. 내가 곁에 있으면 그녀의 균형이 잡히는 구조입니다.` }); }

  // 도화 — 상대 일지가 내 도화지인가 (끌림)
  if (DOWHWA[JI_K[p1.dmJi]] === JI_K[p2.dmJi]) { score += 10; parts.push({ t: "끌림 — 도화 인연", v: "그녀의 일지가 내 도화지", s: 10, x: "그녀의 일지가 내 도화(桃花) 자리 — 본능적인 끌림과 매력을 느끼는 인연입니다." }); }
  if (DOWHWA[JI_K[p2.dmJi]] === JI_K[p1.dmJi]) { score += 10; parts.push({ t: "끌림 — 도화 인연", v: "내 일지가 그녀의 도화지", s: 10, x: "내 일지가 그녀의 도화(桃花) 자리 — 그녀가 나에게 끌리는 인연입니다." }); }

  // 12운성 — 내 일간 기준 그녀 일지의 운성
  const ws = woonseong(p1.dmGan, p2.dmJi);
  const WS_TXT = { 장생: "그녀의 일지가 내 기준 장생(長生) — 함께 있으면 활력이 나는 인연", 제왕: "그녀의 일지가 내 기준 제왕(帝旺) — 그녀 곁에서 내가 가장 강해지는 인연", 건록: "그녀의 일지가 내 기준 건록 — 안정과 지지를 받는 인연", 태: "그녀의 일지가 내 기준 태(胎) — 서로 돌보며 새로 시작하는 부드러운 인연", 절: "그녀의 일지가 내 기준 절(絕) — 가끔 서로의 템포가 안 맞아 끊기는 느낌이 드는 인연", 사: "그녀의 일지가 내 기준 사(死) — 지나치게 익숙해지면 무기력해질 수 있어 새로움이 필요한 인연" };
  if (WS_TXT[ws]) { const bonus = ["장생", "제왕", "건록"].includes(ws) ? 8 : ["절", "사"].includes(ws) ? -6 : 0; score += bonus; parts.push({ t: "12운성", v: ws, s: bonus, x: WS_TXT[ws] }); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = score >= 82 ? "최고 인연" : score >= 68 ? "좋은 인연" : score >= 52 ? "무난한 인연" : score >= 38 ? "노력이 필요한 인연" : "서로를 배우는 인연";
  return { score, grade, parts };
}

// ---------- 월별 재물운·애정운 (월운) ----------
// AI로또 fortune.js(SAJOO 방식)의 십신 점수를 월주(月柱)에 적용한다. 월주는 양력 m월 15일이 속한 절기월.
const JI_MAIN = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8]; // 지지 본기 천간(자=계 축=기 인=갑 …)
function getMonthGZ(y, m) {
  const gz = Solar.fromYmd(y, m, 15).getLunar().getMonthInGanZhiExact();
  const gan = GAN.indexOf(gz[0]), ji = JI.indexOf(gz[1]);
  return { gan, ji, hanja: gz, ilju: GAN_K[gan] + JI_K[ji] };
}
const luckStars = raw => Math.max(1, Math.min(5, 2 + Math.round(raw / 1.5))); // 원점수 → ★1~5
// isMale: 남자는 재성, 여자는 관성을 애정 오행으로 본다
function monthlyLuck(p, isMale, y, m) {
  const g = getMonthGZ(y, m);
  const sg = shiShen(p.dmGan, g.gan), bg = shiShen(p.dmGan, JI_MAIN[g.ji]);
  const rel = zaRel(JI_K[p.dmJi], JI_K[g.ji]), hap = isGanHap(p.dmGan, g.gan);
  const yong = GAN_OH[g.gan] === p.yongsin || JI_OH[g.ji] === p.yongsin;
  const pts = (x, a, b) => (x === a ? 2 : x === b ? 1 : 0);
  const wTags = [], lTags = [];
  // 재물: 재성(정재2·편재1) 천간+지지, 식신 생재 +1, 겁재 −1(재물 다툼), 일지 육합·삼합 +1, 용신 +1, 일지 충 −1
  let w = pts(sg, "정재", "편재") + pts(bg, "정재", "편재");
  if (w) wTags.push("재성월");
  if (sg === "식신" || bg === "식신") { w += 1; wTags.push("식신생재"); }
  if (sg === "겁재" || bg === "겁재") { w -= 1; wTags.push("겁재(지출)"); }
  if (rel === "육합" || rel === "삼합") { w += 1; wTags.push(`일지 ${rel}`); }
  if (rel === "충") { w -= 1; wTags.push("일지 충"); }
  if (yong) { w += 1; wTags.push("용신월"); }
  // 애정: 남=재성 / 여=관성(정2·편1), 도화월 +2, 일지 육합·삼합 +1, 천간합 +1, 일지 충 −2
  let l = isMale ? pts(sg, "정재", "편재") + pts(bg, "정재", "편재") : pts(sg, "정관", "편관") + pts(bg, "정관", "편관");
  if (l) lTags.push(isMale ? "재성(이성)월" : "관성(이성)월");
  if (DOWHWA[JI_K[p.dmJi]] === JI_K[g.ji]) { l += 2; lTags.push("도화월"); }
  if (rel === "육합" || rel === "삼합") { l += 1; lTags.push(`일지 ${rel}`); }
  if (hap) { l += 1; lTags.push("천간합"); }
  if (rel === "충") { l -= 2; lTags.push("일지 충"); }
  return { m, gz: g, sg, bg, wealth: luckStars(w), love: luckStars(l), wTags, lTags };
}

// ---------- 토정비결 괘 ----------
// 간지수 = 천간 선천수(갑기9 을경8 병신7 정임6 무계5) + 지지수 — 태세수·월건수·일진수가 같은 표를 쓴다.
// 지지수는 공개 조견표(갑자20·경자19 등 30개 값)에서 역산: 29/30 일치.
const TJ_GAN = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5], TJ_JI = [11, 12, 10, 10, 13, 9, 9, 13, 12, 12, 13, 11];
const tjNum = gz => TJ_GAN[GAN.indexOf(gz[0])] + TJ_JI[JI.indexOf(gz[1])];
// p: calcPerson 결과, Y: 보고 싶은 해. 음력 생일(그해) 기준, 나이는 세는나이, 나머지 0 → 8·6·3
function tojeong(p, Y) {
  const [sy, sm, sd] = p.solarYmd.split("-").map(Number);
  const B = Solar.fromYmd(sy, sm, sd).getLunar(), bm = Math.abs(B.getMonth()), bd = B.getDay();
  const age = Y - B.getYear() + 1;
  const yearGZ = Lunar.fromYmd(Y, 1, 1).getYearInGanZhi();
  const mlen = LunarYear.fromYear(Y).getMonth(bm).getDayCount();
  const ML = Lunar.fromYmd(Y, bm, Math.min(bd, mlen));
  const mGZ = ML.getMonthInGanZhi(), dGZ = ML.getDayInGanZhi();
  const up = (age + tjNum(yearGZ)) % 8 || 8, mid = (mlen + tjNum(mGZ)) % 6 || 6, low = (bd + tjNum(dGZ)) % 3 || 3;
  return { gwae: up * 100 + mid * 10 + low, up, mid, low, age, bm, bd, mlen, yearGZ, mGZ, dGZ, tY: tjNum(yearGZ), tM: tjNum(mGZ), tD: tjNum(dGZ) };
}

// ---------- 별자리 (서양 점성술 태양 별자리) ----------
const ZODIAC = [
  { name: "양자리", el: "불", from: [3, 21], to: [4, 19] },
  { name: "황소자리", el: "흙", from: [4, 20], to: [5, 20] },
  { name: "쌍둥이자리", el: "바람", from: [5, 21], to: [6, 21] },
  { name: "게자리", el: "물", from: [6, 22], to: [7, 22] },
  { name: "사자자리", el: "불", from: [7, 23], to: [8, 22] },
  { name: "처녀자리", el: "흙", from: [8, 23], to: [9, 22] },
  { name: "천칭자리", el: "바람", from: [9, 23], to: [10, 22] },
  { name: "전갈자리", el: "물", from: [10, 23], to: [11, 22] },
  { name: "사수자리", el: "불", from: [11, 23], to: [12, 21] },
  { name: "염소자리", el: "흙", from: [12, 22], to: [1, 19] },
  { name: "물병자리", el: "바람", from: [1, 20], to: [2, 18] },
  { name: "물고기자리", el: "물", from: [2, 19], to: [3, 20] }
];
function zodiacSign(y, m, d) {
  const md = m * 100 + d;
  for (const z of ZODIAC) {
    const a = z.from[0] * 100 + z.from[1], b = z.to[0] * 100 + z.to[1];
    const inRange = a <= b ? (md >= a && md <= b) : (md >= a || md <= b); // 염소자리 연 넘김
    if (inRange) return z;
  }
  return ZODIAC[9];
}
function zodiacCouple(z1, z2) {
  const same = z1.name === z2.name;
  const el = z1.el === z2.el ? (same ? "같은 별자리 — 자기 이해의 거울 같은 관계" : `같은 ${z1.el} 원소 — 감정의 온도가 비슷한 관계`)
    : ((z1.el === "불" && z2.el === "바람") || (z1.el === "바람" && z2.el === "불")) ? "불·바람 — 바람이 불을 살리는 시너지 관계"
    : ((z1.el === "흙" && z2.el === "물") || (z1.el === "물" && z2.el === "흙")) ? "흙·물 — 물이 흙을 비옥하게 만드는 보완 관계"
    : `${z1.el}·${z2.el} — 온도 차가 있으나 서로에게 배우는 관계`;
  const score = same ? 88 : z1.el === z2.el ? 80 : el.includes("시너지") || el.includes("보완") ? 74 : 58;
  return { score, text: el };
}
