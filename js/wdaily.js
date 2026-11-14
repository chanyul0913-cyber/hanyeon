"use strict";
// 합연 — 서양 일별 궁합 탭: 트랜짓(오늘의 행성 × 출생 차트 아스펙트) 월 캘린더 + 요약 + 일 상세 모달.
// 계산 로직은 western.js의 dailyWestSync, 월 상태는 사주 일별 탭과 ST.calYear/calMonth를 공유.
function renderWdaily() {
  if (!window.Astronomy) {
    $("wCalTitle").textContent = "—";
    $("wCalGrid").innerHTML = "";
    $("wCalLegend").innerHTML = "";
    $("wDailySummary").innerHTML = `<div class="card"><div class="sec-t">서양 일별 궁합</div><div class="reason">천문 계산 라이브러리(astronomy.js)를 불러오지 못해 표시할 수 없습니다.</div></div>`;
    return;
  }
  const y = ST.calYear, m = ST.calMonth;
  $("wCalTitle").textContent = `${y}년 ${m}월`;
  const first = new Date(y, m - 1, 1, 12);
  const daysIn = new Date(y, m, 0).getDate();
  const lead = first.getDay();
  const data = [];
  for (let d = 1; d <= daysIn; d++) data.push(dailyWestSync(ST.p1, ST.p2, new Date(y, m - 1, d, 12)));

  let cells = dowK.map((k, i) => `<div class="dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${k}</div>`).join("");
  for (let i = 0; i < lead; i++) cells += `<div class="day-cell dim"></div>`;
  const t0 = new Date(), todayN = ymdOf(new Date(t0.getFullYear(), t0.getMonth(), t0.getDate()));
  for (let d = 1; d <= daysIn; d++) {
    const r = data[d - 1];
    const star = r.grade.k === "peak" ? '<span class="star">⭐</span>' : r.flow.warn ? '<span class="star">⚠</span>' : "";
    cells += `<div class="day-cell ${r.grade.k === "peak" ? "d-peak" : r.grade.k === "good" ? "d-good" : r.grade.k === "normal" ? "" : r.grade.k === "care" ? "d-care" : "d-bad"}"
      onclick="openWestDayModal(${r.date})">
      ${star}<div class="dc-date"><span>${d}</span>${r.date === todayN ? '<b style="color:var(--gold2)">오늘</b>' : ""}</div>
      <div class="dc-score" style="color:${r.score >= 82 ? "var(--peak)" : r.score >= 68 ? "var(--good)" : r.score >= 52 ? "var(--ink)" : r.score >= 38 ? "var(--care)" : "var(--bad)"}">${r.score}</div>
      <div class="dc-flow">${r.flow.icon} ${esc(r.flow.label)}</div>
      <div class="dc-day">☾ ${r.moon ? esc(r.moon.sign.replace("자리", "")) : ""}</div></div>`;
  }
  const tail = (7 - (lead + daysIn) % 7) % 7;
  for (let i = 0; i < tail; i++) cells += `<div class="day-cell dim"></div>`;
  $("wCalGrid").innerHTML = cells;

  $("wCalLegend").innerHTML = `<span><i class="d-peak" style="border:1px solid rgba(240,217,140,.45);background:rgba(240,217,140,.14)"></i>서양 궁합 최고(82+)</span>
    <span><i style="background:rgba(95,185,138,.12);border:1px solid rgba(95,185,138,.35)"></i>좋음(68~)</span>
    <span><i style="background:rgba(255,255,255,.03);border:1px solid var(--line2)"></i>보통</span>
    <span><i style="background:rgba(226,161,92,.12);border:1px solid rgba(226,161,92,.35)"></i>주의</span>
    <span><i style="background:rgba(226,101,92,.13);border:1px solid rgba(226,101,92,.4)"></i>긴장</span>
    <span>☯ 두 사람 조화(같은 행성이 둘 다와 정확 조화각 ±2°) · ↑ 나/그녀 조화 · ⚠ 긴장 · ☾ = 오늘의 달 별자리</span>`;

  const peaks = [...data].sort((a, b) => b.score - a.score).slice(0, 3);
  const syncDays = data.filter(x => x.flow.dir === "sync");
  const loveDays = data.filter(x => x.reasons.some(q => q.t === "사랑의 조화 (금성)"));
  const careDays = data.filter(x => ["care", "bad"].includes(x.grade.k));
  const mkRow = (x, tag) => x ? `<div class="rank-row" onclick="openWestDayModal(${x.date})"><span class="rk">${tag}</span><span class="today-ilju">${fmtYMD(x.date)}</span><span class="today-date">☾ ${x.moon ? esc(x.moon.sign) : ""}</span><span style="flex:1">${wFlowBadge(x)}</span><b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>` : "";
  $("wDailySummary").innerHTML = `<div class="grid2">
    <div class="card"><div class="sec-t">이달 서양 궁합 TOP 3</div>
      ${peaks.map((x, i) => mkRow(x, i + 1)).join("")}</div>
    <div class="card"><div class="sec-t">조화·사랑의 날 — 이달</div>
      <div style="font-size:13px;margin-bottom:6px"><b style="color:var(--su)">☯ 두 사람 조화</b> ${syncDays.length}일 · <b style="color:var(--hwa)">사랑의 조화(금성)</b> ${loveDays.length}일 · 주의 ${careDays.length}일</div>
      ${syncDays.slice(0, 5).map(x => mkRow(x, "☯")).join("") || '<div class="flow-item"><span class="fx">이 달에 두 사람 조화일이 없음</span></div>'}
      ${loveDays.slice(0, 3).map(x => mkRow(x, "♥")).join("")}</div>
  </div>`;
}

function wFlowBadge(r) {
  const cls = r.flow.warn ? "b-tension" : { sync: "b-charge", dual: "b-flow", me: "b-flow", her: "b-flow", tension: "b-tension" }[r.flow.dir] || "b-neutral";
  const love = r.reasons.some(q => q.t === "사랑의 조화 (금성)") ? `<span class="badge b-love">♥ 사랑의 조화</span>` : "";
  return `<span class="badge ${cls}">${r.flow.icon} ${r.flow.label}</span>${love}`;
}

function openWestDayModal(ymd) {
  const d = new Date(Math.floor(ymd / 10000), Math.floor(ymd / 100) % 100 - 1, ymd % 100, 12);
  const r = dailyWestSync(ST.p1, ST.p2, d);
  const T = transitsOf(d);
  const per = who => r.aspects.filter(x => x.who === who).map(x =>
    `<div class="reason"><span class="rt">${x.t.ko} ✕ ${x.n.ko} — ${x.a.ko}각</span><span class="rs" style="color:${x.a.s >= 0 ? "var(--good)" : "var(--bad)"}">${x.a.s * TRANSIT_W[x.t.key] > 0 ? "+" : ""}${(x.a.s * TRANSIT_W[x.t.key]).toFixed(1)}</span><div class="rx">${esc(x.a.mean)} (각도 ${x.diff.toFixed(1)}° · ${esc(x.n.sign)}의 ${x.n.ko})</div></div>`).join("");
  $("dayDetail").innerHTML = `
    <div class="modal-hd"><b>${ymdStr(ymd)} (${dowK[d.getDay()]}) — 서양 일별 궁합</b><button class="modal-x" data-close>✕</button></div>
    <div class="gauge-wrap" style="margin-bottom:12px">${gaugeSVG(r.score, r.grade.label)}<div class="gauge-label">
      ${wFlowBadge(r)}
      <table class="mini-tbl" style="margin-top:10px">
        ${T.map(x => `<tr><td>오늘의 ${x.ko}</td><td>${x.elon.toFixed(1)}° · ${esc(x.sign)}${x.key === "Moon" ? " ☾" : ""}</td></tr>`).join("")}
      </table>
      ${r.reasons.length ? `<div style="margin-top:10px">${r.reasons.map(x => `<div class="reason"><span class="rt">${esc(x.t)}</span><span class="rs" style="color:${x.s >= 0 ? "var(--good)" : "var(--bad)"}">${x.s > 0 ? "+" : ""}${x.s}</span><div class="rx">${esc(x.x)}</div></div>`).join("")}</div>` : '<div class="reason">뚜렷한 트랜짓 작용 없는 고요한 날</div>'}
    </div></div>
    <div class="sec-t">${esc(ST.p1.name)}에게 오는 기운</div>${per(1) || '<div class="reason">뚜렷한 각 없음</div>'}
    <div class="sec-t">${esc(ST.p2.name)}에게 오는 기운</div>${per(2) || '<div class="reason">뚜렷한 각 없음</div>'}
    <div class="sec-t">조언</div><div class="reason">${esc(westDayAdvice(r))}</div>`;
  $("modalDay").hidden = false;
  $("dayDetail").querySelectorAll("[data-close]").forEach(b => b.onclick = () => $("modalDay").hidden = true);
}
