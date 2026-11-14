"use strict";
// 합연 — 일별 궁합 탭: 월 캘린더(속궁합 점수·피크·합궁)·필터·이달 요약(피크 TOP 3·합방합궁).
function renderDaily() {
  const y = ST.calYear, m = ST.calMonth;
  $("calTitle").textContent = `${y}년 ${m}월`;
  const first = new Date(y, m - 1, 1, 12);
  const daysIn = new Date(y, m, 0).getDate();
  const lead = first.getDay();

  // 이달 전체 계산
  const data = [];
  for (let d = 1; d <= daysIn; d++) data.push(dailySync(ST.p1, ST.p2, new Date(y, m - 1, d, 12)));
  const byYmd = Object.fromEntries(data.map(r => [r.date, r]));

  // 캘린더 셀
  let cells = dowK.map((k, i) => `<div class="dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${k}</div>`).join("");
  for (let i = 0; i < lead; i++) cells += `<div class="day-cell dim"></div>`;
  const tY = new Date(), todayN = ymdOf(new Date(tY.getFullYear(), tY.getMonth(), tY.getDate()));
  const show = { peak: $("fPeak").checked, herStrong: $("fHerStrong").checked };
  for (let d = 1; d <= daysIn; d++) {
    const r = data[d - 1];
    const dimmed = !(show.peak && r.grade.k === "peak") && !(show.herStrong && r.flags.herStrong);
    const isPeak = r.grade.k === "peak", star = isPeak ? '<span class="star">⭐</span>' : "";
    cells += `<div class="day-cell ${isPeak ? "d-peak" : r.flags.herStrong ? "d-good" : ""} ${dimmed ? "dim" : ""}"
      onclick="openDayModal(${r.date})">
      ${star}<div class="dc-date"><span>${d}</span>${r.date === todayN ? '<b style="color:var(--gold2)">오늘</b>' : ""}</div>
      <div class="dc-score" style="color:${isPeak ? "var(--peak)" : r.flags.herStrong ? "var(--good)" : "var(--ink)"}">${r.score}</div>
      <div class="dc-flow">${r.flags.herStrong ? "✿ 합궁" : "&nbsp;"}</div>
      <div class="dc-day">${r.dayGZ.hanja}</div></div>`;
  }
  const tail = (7 - (lead + daysIn) % 7) % 7;
  for (let i = 0; i < tail; i++) cells += `<div class="day-cell dim"></div>`;
  $("calGrid").innerHTML = cells;

  // 범례
  $("calLegend").innerHTML = `<span><i style="border:1px solid rgba(240,217,140,.45);background:rgba(240,217,140,.14)"></i>⭐ 피크</span>
    <span><i style="background:rgba(95,185,138,.12);border:1px solid rgba(95,185,138,.35)"></i>✿ 합궁</span>
    <span><i style="background:rgba(255,255,255,.03);border:1px solid var(--line2)"></i>그 외 날</span>
    <span>숫자 = 그날의 속궁합 점수(0~100) · 피크이면서 합궁인 날은 금색 칸에 ✿ 표시</span>`;

  // 이달 요약 — 피크 TOP 3 + 합방합궁(✿ 그녀 컨디션 좋은 날)
  const peaks = [...data].sort((a, b) => b.score - a.score).slice(0, 3);
  const hs = data.filter(x => x.flags.herStrong);
  const hList = hs.length ? hs.map(x => `<div class="flow-item" onclick="openDayModal(${x.date})" style="cursor:pointer"><span class="fd">${fmtYMD(x.date)}</span><span class="fi" style="color:var(--su)">✿ 합궁</span><span class="fx">${x.dayGZ.hanja}일 · 점수 ${x.score}</span></div>`).join("") : `<div class="flow-item"><span class="fx">이 달에 없음</span></div>`;
  $("dailySummary").innerHTML = `
    <div class="grid2">
      <div class="card"><div class="sec-t">이달 속궁합 피크 TOP 3</div>
        ${peaks.map((x, i) => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="rk">${i + 1}</span><span class="today-ilju">${fmtYMD(x.date)}</span><span class="today-date">${x.dayGZ.hanja}일</span><span style="flex:1">${peakBadge(x.grade.k === "peak", x.flags.herStrong)}</span><b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>`).join("")}</div>
      <div class="card"><div class="sec-t">합방합궁 — 이달</div>
        <div style="font-size:13px;margin-bottom:6px"><b style="color:var(--su)">✿ 합궁</b> ${hs.length}일</div>
        ${hList}</div>
    </div>`;
}
