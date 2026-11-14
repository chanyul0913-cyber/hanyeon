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

  // 피크·합궁 — 향후 1년 통계 + 피크이면서 합궁인 날
  const hasW = !!window.Astronomy, t0 = today(), days = [];
  for (let i = 0; i < 365; i++) {
    const dt = addDays(t0, i), r = dailySync(p1, p2, dt), w = hasW ? dailyWestSync(p1, p2, dt) : null;
    days.push({ r, sPeak: r.grade.k === "peak", sHap: !!r.flags.herStrong, wPeak: !!(w && w.grade.k === "peak"), wHap: !!(w && w.herStrong) });
  }
  const cnt = f => days.filter(f).length;
  const hapGan = [...GAN_K].filter((g, i) => GAN_OH[i] === p2.dmOh || GAN_OH[i] === ohGenMe(p2.dmOh)).join("·");
  const best = days.filter(o => o.sPeak && (o.sHap || o.wHap)).slice(0, 5);
  const fallback = best.length ? best : days.filter(o => o.sHap && o.wHap).sort((a, b) => b.r.score - a.r.score).slice(0, 5).sort((a, b) => a.r.date - b.r.date);
  const stat = (label, v) => `<tr><td>${label}</td><td><b>${v}일</b></td></tr>`;
  $("couplePeak").innerHTML = `<div class="card"><div class="sec-t">피크 · 합궁 <small>(향후 1년)</small></div>
    <div style="font-size:13.5px;margin-bottom:8px">사주 합궁 = <b style="color:${OH_COLOR[ohGenMe(p2.dmOh)]}">${ohGenMe(p2.dmOh)}</b>·<b style="color:${OH_COLOR[p2.dmOh]}">${p2.dmOh}</b>의 날 (${hapGan}일)</div>
    <table class="mini-tbl">${stat("⭐ 사주 피크", cnt(o => o.sPeak))}${stat("✿ 사주 합궁", cnt(o => o.sHap))}${hasW ? stat("⭐ 서양 피크", cnt(o => o.wPeak)) + stat("✿ 서양 합궁", cnt(o => o.wHap)) + stat("✿ 사주·서양 둘 다 합궁", cnt(o => o.sHap && o.wHap)) : ""}${stat("⭐✿ 피크이면서 합궁", cnt(o => o.sPeak && (o.sHap || o.wHap)))}</table>
    <div class="sec-t" style="margin-top:12px">${best.length ? "피크이면서 합궁인 날" : "사주·서양 둘 다 합궁인 날"}</div>
    ${fallback.length ? fallback.map(o => `<div class="rank-row" onclick="openDayModal(${o.r.date})"><span class="today-ilju">${fmtYMD(o.r.date)}</span><span class="today-date">${o.r.dayGZ.hanja}</span><span style="flex:1">${peakBadge(o.sPeak, o.sHap)}${o.wHap ? '<span class="badge b-flow">✿ 서양 합궁</span>' : ""}</span><b style="font-family:var(--serif);font-size:16px">${o.r.score}</b></div>`).join("") : '<div class="flow-item"><span class="fx">향후 1년 안에 해당하는 날이 없습니다.</span></div>'}</div>`;

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
</div>`;
}
