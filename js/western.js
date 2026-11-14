"use strict";
// 합연 — 서양 점성술 탭: 태양 별자리 궁합 + synastry(두 출생 차트의 행성 아스펙트).
// astronomy-engine(js/vendor/astronomy.js)이 로드되지 않으면 별자리 궁합만 표시한다.
const WEST_PLANETS = [
  { key: "Sun", ko: "태양", mean: "정체성·핵심 에너지" },
  { key: "Moon", ko: "달", mean: "감정·무의식" },
  { key: "Venus", ko: "금성", mean: "애정·호감·취향" },
  { key: "Mars", ko: "화성", mean: "욕구·행동력" }
];
const ASPECTS = [
  { ang: 0, orb: 8, ko: "합(Conjunction)", mean: "두 행성의 기운이 겹쳐 융합 — 함께 있을 때 하나가 되는 느낌", s: 5 },
  { ang: 60, orb: 6, ko: "육십(Sextile)", mean: "편안한 협력과 기회 — 서로 힘을 빌려주기 쉬움", s: 6 },
  { ang: 90, orb: 8, ko: "구십(Square)", mean: "마찰과 긴장 — 부딪히며 성장하는 관계성", s: -3 },
  { ang: 120, orb: 8, ko: "백이십(Trine)", mean: "자연스러운 조화 — 흐름이 막히지 않는 궁합", s: 8 },
  { ang: 180, orb: 8, ko: "대립(Opposition)", mean: "강한 끌림과 함께 오는 긴장 — 자석 같은 인연", s: 3 }
];

function westPositions(p) {
  const A = window.Astronomy;
  const d = new Date(p.profile.y, p.profile.m - 1, p.profile.d, p.profile.h === "" ? 12 : +p.profile.h, +p.profile.mi || 0, 0);
  return WEST_PLANETS.map(x => {
    let elon;
    if (x.key === "Moon") elon = A.EclipticGeoMoon(d).lon;
    else elon = A.Ecliptic(A.GeoVector(A.Body[x.key], d, true)).elon;
    return { ...x, elon, sign: ZODIAC[Math.floor(((elon % 360) + 360) % 360 / 30)].name };
  });
}

function renderWestern() {
  const p1 = ST.p1, p2 = ST.p2, zc = zodiacCouple(p1.zodiac, p2.zodiac);
  $("westernCards").innerHTML = `<div class="card gold"><div class="sec-t">별자리 궁합 <small>(태양 별자리)</small></div>
    <div class="gauge-wrap">${gaugeSVG(zc.score, zc.text.split(" — ")[0].slice(0, 6))}
      <div class="gauge-label">
        <div style="font-size:15px"><b style="color:var(--gold2)">${esc(p1.zodiac.name)}</b>(${p1.zodiac.el}) × <b style="color:var(--gold2)">${esc(p2.zodiac.name)}</b>(${p2.zodiac.el})</div>
        <div style="margin-top:6px;color:var(--sub);font-size:13.5px">${esc(zc.text)}</div>
        <div style="margin-top:6px;font-size:12.5px;color:var(--sub)">같은 원소(불·흙·바람·물)가 가장 잘 맞고, 불↔바람·흙↔물이 서로를 살립니다.</div>
      </div></div></div>`;

  const A = window.Astronomy;
  if (!A || !A.GeoVector || !A.Ecliptic || !A.EclipticGeoMoon || !A.Body) {
    $("westernSynastry").innerHTML = `<div class="card"><div class="sec-t">행성 아스펙트 (synastry)</div>
      <div class="reason">천문 계산 라이브러리(astronomy.js)를 불러오지 못해 행성 궁합을 건너뜁니다. 별자리 궁합만 표시됩니다.</div></div>`;
    return;
  }
  let pos1, pos2;
  try { pos1 = westPositions(p1); pos2 = westPositions(p2); }
  catch (e) {
    $("westernSynastry").innerHTML = `<div class="card"><div class="sec-t">행성 아스펙트 (synastry)</div><div class="reason">행성 계산 실패: ${esc(e.message)}</div></div>`;
    return;
  }
  const prT = (who, pos) => `<div class="card"><div class="sec-t">${esc(who)}의 행성 위치</div><table class="mini-tbl">
    ${pos.map(x => `<tr><td>${x.ko} <small>(${x.mean})</small></td><td><b>${x.elon.toFixed(1)}°</b> · ${esc(x.sign)}${p1.profile.h === "" && who === esc(p1.name) || p2.profile.h === "" && who === esc(p2.name) ? ' <small>(시간 모름 — 정오 근사)</small>' : ""}</td></tr>`).join("")}</table></div>`;
  const marks = [];
  let score = 50;
  for (const a of pos1) for (const b of pos2) {
    let diff = Math.abs(a.elon - b.elon) % 360; if (diff > 180) diff = 360 - diff;
    const asp = ASPECTS.find(x => Math.abs(diff - x.ang) <= x.orb);
    if (asp) { score += asp.s; marks.push({ a, b, diff, asp }); }
  }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const mkRow = m => `<div class="part"><div class="pt"><span>${m.a.ko} ✕ ${m.b.ko} <span class="pv">${m.asp.ko} · ${m.a.ko} ${esc(m.a.sign)} — ${m.b.ko} ${esc(m.b.sign)}</span></span><span class="ps" style="color:${m.asp.s >= 0 ? "var(--good)" : "var(--bad)"}">${m.asp.s > 0 ? "+" : ""}${m.asp.s}</span></div><div class="px">${esc(m.asp.mean)} (각도 ${m.diff.toFixed(1)}°)</div></div>`;
  $("westernSynastry").innerHTML = `
    <div class="card gold"><div class="sec-t">행성 아스펙트 종합 (synastry)</div>
      <div class="gauge-wrap">${gaugeSVG(score, "행성 궁합")}
        <div class="gauge-label"><div style="font-size:13.5px;color:var(--sub)">두 사람의 태양·달·금성·화성이 만드는 각(아스펙트)을 합산한 점수입니다.
        사주 궁합과 별개의 체계이며, <b style="color:var(--gold2)">합·백이십이 많으면 자연스럽고</b>, 구십·대립이 많으면 자극적이고 배우는 관계입니다.</div></div></div>
      ${marks.length ? marks.map(mkRow).join("") : '<div class="reason">뚜렷한 아스펙트가 없습니다 — 서로의 에너지가 직접 얽히지 않는 자유로운 관계입니다.</div>'}</div>
    <div class="grid2">${prT(p1.name, pos1)}${prT(p2.name, pos2)}</div>`;
}

// ---------- 서양 일별 궁합 (트랜짓 기반) ----------
// 오늘의 행성(태양·달·금성·화성)이 두 사람의 출생 차트와 만드는 각(아스펙트)으로 일별 궁합을 계산한다.
// 달(13°/일)·금성(1.2°/일)이 일별 변화의 주역이고, 같은 행성이 두 사람 모두와 조화각이면 '두 사람 조화'일이 된다.
const TRANSIT_ASPECTS = [
  { ang: 0, orb: 8, ko: "합", s: 2, mean: "행성 기운이 겹쳐 활성화 — 에너지가 직접 닿는 날" },
  { ang: 60, orb: 5, ko: "육십", s: 2, mean: "편안한 기회 — 부담 없이 잘 풀리는 각" },
  { ang: 90, orb: 6, ko: "구십", s: -2, mean: "마찰·자극 — 예민해지기 쉬운 각" },
  { ang: 120, orb: 8, ko: "삼합", s: 3, mean: "자연스러운 조화 — 흐름이 막히지 않는 각" },
  { ang: 180, orb: 8, ko: "대립", s: -1, mean: "긴장이지만 끌림도 함께 오는 각" }
];
const TRANSIT_W = { Sun: 1.5, Moon: 2, Venus: 2, Mars: 1.5 };
const NATAL_CACHE = new Map(), TRANSIT_CACHE = new Map();

function natalOf(p) { // 출생 차트 행성 위치 (사람당 1회 계산 후 캐시)
  if (!NATAL_CACHE.has(p)) NATAL_CACHE.set(p, westPositions(p));
  return NATAL_CACHE.get(p);
}
function transitsOf(date) { // 그날의 행성 위치 (날짜당 1회 계산 후 캐시)
  const k = ymdOf(date);
  if (!TRANSIT_CACHE.has(k)) {
    const A = window.Astronomy, d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    TRANSIT_CACHE.set(k, WEST_PLANETS.map(x => {
      let elon;
      if (x.key === "Moon") elon = A.EclipticGeoMoon(d).lon;
      else elon = A.Ecliptic(A.GeoVector(A.Body[x.key], d, true)).elon;
      return { ...x, elon, sign: ZODIAC[Math.floor(((elon % 360) + 360) % 360 / 30)].name };
    }));
  }
  return TRANSIT_CACHE.get(k);
}
function findTAspect(a, b) { // 두 황경 사이의 트랜짓 아스펙트 찾기
  let diff = Math.abs(a - b) % 360; if (diff > 180) diff = 360 - diff;
  return TRANSIT_ASPECTS.find(x => Math.abs(diff - x.ang) <= x.orb) || null;
}

// 조화 판정은 정확각 ±SYNC_ORB 이내만 — 느린 행성(태양·금성·화성)이 넓은 오브로 몇 주씩 '조화'를 찍는 것 방지
const SYNC_ORB = 2;
const tDiff = (t, n) => { let d = Math.abs(t.elon - n.elon) % 360; return d > 180 ? 360 - d : d; };

function dailyWestSync(p1, p2, date) {
  const T = transitsOf(date), N1 = natalOf(p1), N2 = natalOf(p2);
  const reasons = [], aspects = [];
  let score = 50;
  let meOnly = 0, herOnly = 0, bothHard = 0, hard1All = 0, hard2All = 0;
  const syncList = [];
  let moon = null;
  for (const t of T) {
    const w = TRANSIT_W[t.key];
    let h1 = 0, h2 = 0, hard1 = 0, hard2 = 0;
    for (const n of N1) { const a = findTAspect(t.elon, n.elon); if (a) { const c = a.s * w; score += c; aspects.push({ who: 1, t, n, a, diff: tDiff(t, n) }); if (a.s > 0) { if (Math.abs(tDiff(t, n) - a.ang) <= SYNC_ORB) h1 += c; } else hard1++; } }
    for (const n of N2) { const a = findTAspect(t.elon, n.elon); if (a) { const c = a.s * w; score += c; aspects.push({ who: 2, t, n, a, diff: tDiff(t, n) }); if (a.s > 0) { if (Math.abs(tDiff(t, n) - a.ang) <= SYNC_ORB) h2 += c; } else hard2++; } }
    if (t.key === "Moon") moon = t;
    if (h1 > 0 && h2 > 0) {
      syncList.push(t.ko); score += 6;
      reasons.push({ t: `${t.ko} — 두 사람 조화`, s: +6, x: `오늘의 ${t.ko}이(가) ${p1.name}과(와) ${p2.name}의 출생 행성에 동시에 조화각 — 두 사람이 함께 잘 풀리는 날` });
      if (t.key === "Venus") { score += 6; reasons.push({ t: "사랑의 조화 (금성)", s: +6, x: "금성(애정)이 두 사람 모두와 조화 — 데이트·고백·손편지 등 애정 표현에 최적인 날" }); }
    } else if (h1 > 0) meOnly++;
    else if (h2 > 0) herOnly++;
    hard1All += hard1; hard2All += hard2;
  }
  if (!syncList.length && hard1All > 0 && hard2All > 0) { score -= 8; reasons.push({ t: "행성 긴장", s: -8, x: "오늘의 행성들이 두 사람 모두에게 긴장각 — 서로 예민해지기 쉬운 날. 중요한 대화는 미루기" }); }
  let flow;
  if (syncList.length) flow = { dir: "sync", label: "두 사람 조화", icon: "☯" };
  else if (meOnly && herOnly) flow = { dir: "dual", label: "각자 조화", icon: "↑↑" };
  else if (meOnly) flow = { dir: "me", label: "나 조화", icon: "↑" };
  else if (herOnly) flow = { dir: "her", label: "그녀 조화", icon: "↑" };
  else if (hard1All && hard2All) flow = { dir: "tension", label: "긴장", icon: "⚠", warn: true };
  else flow = { dir: "calm", label: "고요", icon: "·" };
  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = score >= 82 ? { k: "peak", label: "서양 궁합 최고", stars: 3 }
    : score >= 68 ? { k: "good", label: "좋음", stars: 2 }
    : score >= 52 ? { k: "normal", label: "보통", stars: 1 }
    : score >= 38 ? { k: "care", label: "주의", stars: 0 }
    : { k: "bad", label: "긴장", stars: 0 };
  return { date: ymdOf(date), dow: date.getDay(), score, grade, flow, reasons, aspects, syncList, moon };
}

function westDayAdvice(r) {
  if (r.grade.k === "peak") return "행성들이 두 사람의 차트를 모두 부드럽게 통과하는 날. 함께 있는 시간, 약속, 대화 모두 잘 풀립니다.";
  if (r.grade.k === "good") return "전반적으로 순조로운 하늘. 사소한 오해는 자연스럽게 풀립니다.";
  if (r.grade.k === "normal") return "무난한 하루. 특별한 조화나 긴장 없이 평소의 리듬을 유지하면 됩니다.";
  if (r.grade.k === "care") return "행성의 긴장각이 살짝 있는 날. 약속 변경·계획 차이에 여유를 갖고 대응하세요.";
  return "행성 긴장이 강한 날. 감정적 반응을 한 템포 늦추면 부딪힘을 피할 수 있습니다.";
}
