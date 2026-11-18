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

function planetPositions(list, date) { // 행성 목록의 황경 위치(별자리·원소 포함) — 달은 특수 계산
  const A = window.Astronomy, d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  return list.map(x => {
    let elon;
    if (x.key === "Moon") elon = A.EclipticGeoMoon(d).lon;
    else elon = A.Ecliptic(A.GeoVector(A.Body[x.key], d, true)).elon;
    const z = ZODIAC[Math.floor(((elon % 360) + 360) % 360 / 30)];
    return { ...x, elon, sign: z.name, el: z.el }; // el = 별자리 원소(불·흙·바람·물)
  });
}
const natalDate = p => new Date(p.profile.y, p.profile.m - 1, p.profile.d, p.profile.h === "" ? 12 : +p.profile.h, +p.profile.mi || 0, 0);
function westPositions(p) { return planetPositions(WEST_PLANETS, natalDate(p)); }

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
  const prT = (p, pos) => `<div class="card"><div class="sec-t">${esc(p.name)}의 행성 위치</div><table class="mini-tbl">
    ${pos.map(x => `<tr><td>${x.ko} <small>(${x.mean})</small></td><td><b>${x.elon.toFixed(1)}°</b> · ${esc(x.sign)}${p.profile.h === "" ? ' <small>(시간 모름 — 정오 근사)</small>' : ""}</td></tr>`).join("")}</table></div>`;
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
    <div class="grid2">${prT(p1, pos1)}${prT(p2, pos2)}</div>`;
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
function transitsOf(date) { // 그날의 행성 위치 (날짜당 1회 계산 후 캐시 — 너무 커지면 비워 메모리 위생)
  const k = ymdOf(date);
  if (TRANSIT_CACHE.size > 500) TRANSIT_CACHE.clear();
  if (!TRANSIT_CACHE.has(k)) TRANSIT_CACHE.set(k, planetPositions(WEST_PLANETS, date));
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
  let hard1All = 0, hard2All = 0;
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
      reasons.push({ t: `${t.ko} — 두 사람 조화`, s: +6, x: `오늘의 ${t.ko}이(가) ${josa(p1.name, "과", "와")} ${p2.name}의 출생 행성에 동시에 조화각 — 두 사람이 함께 잘 풀리는 날` });
      if (t.key === "Venus") { score += 6; reasons.push({ t: "사랑의 조화 (금성)", s: +6, x: "금성(애정)이 두 사람 모두와 조화 — 데이트·고백·손편지 등 애정 표현에 최적인 날" }); }
    }
    hard1All += hard1; hard2All += hard2;
  }
  if (!syncList.length && hard1All > 0 && hard2All > 0) { score -= 8; reasons.push({ t: "행성 긴장", s: -8, x: "오늘의 행성들이 두 사람 모두에게 긴장각 — 서로 예민해지기 쉬운 날. 중요한 대화는 미루기" }); }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = score >= 82 ? { k: "peak", label: "서양 궁합 최고", stars: 3 }
    : score >= 68 ? { k: "good", label: "좋음", stars: 2 }
    : score >= 52 ? { k: "normal", label: "보통", stars: 1 }
    : score >= 38 ? { k: "care", label: "주의", stars: 0 }
    : { k: "bad", label: "긴장", stars: 0 };
  // 합궁(✿) — 오늘의 달·금성이 여자 출생 차트와 조화각만 있고 긴장각은 없는 날. 표시용, 점수 영향 없음
  const herMV = aspects.filter(x => x.who === 2 && (x.t.key === "Moon" || x.t.key === "Venus"));
  const herStrong = herMV.some(x => x.a.s > 0) && !herMV.some(x => x.a.s < 0);
  if (herStrong) reasons.push({ t: "합궁일(✿)", s: 0, x: "오늘의 달(감정)·금성(애정)이 여자의 출생 차트를 조화각으로만 비춤 — 그녀가 편안하고 덜 지치는 날" });
  return { date: ymdOf(date), dow: date.getDay(), score, grade, reasons, aspects, syncList, moon, herStrong };
}

// 서양 재물 기운(로또일 판단용) — 오늘의 금성(돈·즐거움)·태양(활력)·달(기분)이 그 사람 출생 차트와 이루는 각의 가중합. 조화 +, 긴장 −
const westMoney = (w, who) => w ? w.aspects.filter(x => x.who === who && x.t.key !== "Mars").reduce((s, x) => s + x.a.s * TRANSIT_W[x.t.key], 0) : 0;
// 로또 사기 좋은 날(🍀) — 사주 일진 재물 원점수×4 + 서양 재물 기운의 합산이 20 이상이고 둘 다 플러스인 날(1인당 월 2~4일 정도).
// astronomy.js가 없으면 사주 재물 4 이상만으로 판정. 재미용 — 추첨은 무작위라 당첨과 무관.
function lottoOf(p, who, date, w) {
  const s = dayWealth(p, date), m = westMoney(w, who), score = Math.round(s.raw * 4 + m);
  return { ok: w ? s.raw >= 2 && m > 0 && score >= 20 : s.raw >= 4, score, saju: s, west: Math.round(m * 10) / 10 };
}

// ---------- 투자(주식) 트랜짓 — 금성·목성·토성·명왕성 ----------
// 금성(돈)·목성(확장·행운)·토성(제한·손실 경계)·명왕성(대량 자금)이 출생 차트와 만드는 각으로
// 그 사람의 그날 투자 컨디션을 계산한다. 사주 재물(engine.js wealthRaw)과 함께 consult.js의 주식운세에서 사용.
const INVEST_PLANETS = [
  { key: "Venus", ko: "금성", mean: "돈·즐거움", w: 2 },
  { key: "Jupiter", ko: "목성", mean: "확장·행운", w: 2 },
  { key: "Saturn", ko: "토성", mean: "제한·손실 경계", w: 1.5 },
  { key: "Pluto", ko: "명왕성", mean: "대량 자금·변혁", w: 1.5 }
];
const INVEST_CACHE = new Map(), NATAL_FULL_CACHE = new Map();
function investTransits(date) { // 그날의 투자 행성 위치 (날짜당 1회 계산 후 캐시)
  const k = ymdOf(date);
  if (INVEST_CACHE.size > 500) INVEST_CACHE.clear();
  if (!INVEST_CACHE.has(k)) INVEST_CACHE.set(k, planetPositions(INVEST_PLANETS, date));
  return INVEST_CACHE.get(k);
}
function natalFullOf(p) { // 출생 차트의 투자 행성 위치 (사람당 1회 계산 후 캐시)
  if (!NATAL_FULL_CACHE.has(p)) NATAL_FULL_CACHE.set(p, planetPositions(INVEST_PLANETS, natalDate(p)));
  return NATAL_FULL_CACHE.get(p);
}
// 그 사람 기준 오늘의 투자 기운 — 투자 행성 × 본인 투자 행성의 16쌍 각을 합산(조화 +, 긴장 −)
function investSync(p, date) {
  const T = investTransits(date), N = natalFullOf(p);
  const harm = [], tense = [];
  let west = 0;
  for (const t of T) for (const n of N) {
    const a = findTAspect(t.elon, n.elon);
    if (!a) continue;
    const c = a.s * t.w;
    west += c;
    const item = { t, n, a, diff: tDiff(t, n), c };
    (a.s > 0 ? harm : tense).push(item);
  }
  return { harm, tense, west: Math.round(west * 10) / 10 };
}
