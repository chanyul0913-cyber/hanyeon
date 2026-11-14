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
