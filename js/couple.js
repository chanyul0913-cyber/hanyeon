"use strict";
// 합연 — 궁합 분석 탭: 일주×일주 고정 궁합(천간·일지·오행 보완·도화·12운성) + 오행 조합 시각화.
function renderCouple() {
  const c = coupleFixed(ST.p1, ST.p2);
  const p1 = ST.p1, p2 = ST.p2;

  $("coupleTop").innerHTML = `<div class="card gold">
    <div class="sec-t">일주 궁합 — ${esc(p1.name)}의 ${p1.dmHanja} × ${esc(p2.name)}의 ${p2.dmHanja}</div>
    <div class="gauge-wrap">${gaugeSVG(c.score, c.grade)}
      <div class="gauge-label">
        <div class="today-ilju">${p1.ilju} × ${p2.ilju}</div>
        <div style="margin-top:6px;color:var(--sub);font-size:13.5px">두 사람의 마음(일간)과 삶터(일지)의 관계를 사주 규칙(천간합·지지 육합/삼합/충/형/원진·오행 생극·도화·12운성)으로 종합한 점수입니다. 이 점수는 고정 궁합이며, 일별 변화는 <b>일별 궁합</b> 탭에서 봅니다.</div>
      </div></div></div>`;

  $("coupleParts").innerHTML = `<div class="sec-t">궁합 근거 상세</div>` +
    c.parts.map(x => `<div class="part"><div class="pt"><span>${esc(x.t)}<span class="pv">${esc(x.v)}</span></span><span class="ps" style="color:${x.s >= 0 ? "var(--good)" : "var(--bad)"}">${x.s > 0 ? "+" : ""}${x.s}</span></div><div class="px">${esc(x.x)}</div></div>`).join("");

  // 오행 나란히 비교
  const maxC = Math.max(...OHS.flatMap(o => [p1.cnt[o], p2.cnt[o]]), 1);
  const rows = OHS.map(o => `<div class="oh-bar-row"><span class="lb">${o}</span>
      <div class="oh-bar"><i style="width:${(p1.cnt[o] / maxC * 100).toFixed(0)}%;background:${OH_COLOR[o]};opacity:.9"></i></div><span class="ct">${p1.cnt[o]}</span></div>
    <div class="oh-bar-row" style="margin-left:34px"><div class="oh-bar"><i style="width:${(p2.cnt[o] / maxC * 100).toFixed(0)}%;background:${OH_COLOR[o]};opacity:.55"></i></div><span class="ct">${p2.cnt[o]}</span></div>`).join("");
  const lack1 = OHS.reduce((a, b) => p1.cnt[a] <= p1.cnt[b] ? a : b), lack2 = OHS.reduce((a, b) => p2.cnt[a] <= p2.cnt[b] ? a : b);
  $("coupleOh").innerHTML = `<div class="card"><div class="sec-t">오행 균형 비교 <small>— 위: ${esc(p1.name)}, 아래(연한 바): ${esc(p2.name)}</small></div>${rows}
    <div style="margin-top:10px;font-size:13px;color:var(--sub)">
      ${esc(p1.name)}가 부족한 오행 <b style="color:${OH_COLOR[lack1]}">${lack1}</b> / ${esc(p2.name)}가 부족한 오행 <b style="color:${OH_COLOR[lack2]}">${lack2}</b> —
      서로의 다수 오행이 상대의 부족 오행이면 채워주는 궁합입니다.</div>
    <div style="margin-top:10px;font-size:13px">
      <b style="color:${OH_COLOR[p1.dmOh]}">${p1.dmOh}</b> 일간의 나와 <b style="color:${OH_COLOR[p2.dmOh]}">${p2.dmOh}</b> 일간의 그녀:
      ${OH_GEN[p1.dmOh] === p2.dmOh ? `내가 그녀를 生(생해주는) 구조 — 내가 주고 그녀가 웃는 순환` :
        OH_GEN[p2.dmOh] === p1.dmOh ? `그녀가 나를 生(생해주는) 구조 — 그녀가 나를 채워주는 순환` :
        OH_KEUK[p1.dmOh] === p2.dmOh ? `내가 그녀를 극(누르는) 구조 — 주도권은 내게, 그러나 부드럽게` :
        OH_KEUK[p2.dmOh] === p1.dmOh ? `그녀가 나를 극(누르는) 구조 — 서로 긴장하되 대화 방식이 해법` : `생극 관계가 없는 평행 구조 — 서로 독립적`}</div></div>`;
}
