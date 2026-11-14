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
  for (let d = 1; d <= daysIn; d++) { const dt = new Date(y, m - 1, d, 12), r = dailySync(ST.p1, ST.p2, dt); const w = westOf(dt); r.westHap = !!w?.herStrong; r.lotto1 = lottoOf(ST.p1, 1, dt, w); r.lotto2 = lottoOf(ST.p2, 2, dt, w); data.push(r); }
  const byYmd = Object.fromEntries(data.map(r => [r.date, r]));

  // 캘린더 셀
  let cells = dowK.map((k, i) => `<div class="dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${k}</div>`).join("");
  for (let i = 0; i < lead; i++) cells += `<div class="day-cell dim"></div>`;
  const tY = new Date(), todayN = ymdOf(new Date(tY.getFullYear(), tY.getMonth(), tY.getDate()));
  const show = { peak: $("fPeak").checked, herStrong: $("fHerStrong").checked, west: $("fWestHap").checked, danger: $("fDanger").checked, l1: $("fLotto1").checked, l2: $("fLotto2").checked };
  for (let d = 1; d <= daysIn; d++) {
    const r = data[d - 1];
    const dimmed = !(show.peak && r.grade.k === "peak") && !(show.herStrong && r.flags.herStrong) && !(show.west && r.westHap) && !(show.danger && r.flags.danger) && !(show.l1 && r.lotto1.ok) && !(show.l2 && r.lotto2.ok);
    const isPeak = r.grade.k === "peak", star = (r.flags.danger ? '<span class="star">⚡</span>' : "") + (isPeak ? '<span class="star">⭐</span>' : "");
    cells += `<div class="day-cell ${r.flags.danger ? "d-bad" : isPeak ? "d-peak" : r.flags.herStrong ? "d-good" : r.westHap ? "d-west" : r.lotto1.ok || r.lotto2.ok ? "d-lotto" : ""} ${dimmed ? "dim" : ""}"
      onclick="openDayModal(${r.date})">
      ${star}<div class="dc-date"><span>${d}</span>${r.date === todayN ? '<b style="color:var(--gold2)">오늘</b>' : ""}</div>
      <div class="dc-score" style="color:${r.flags.danger ? "var(--bad)" : isPeak ? "var(--peak)" : r.flags.herStrong ? "var(--good)" : r.westHap ? "#e88fc0" : r.lotto1.ok || r.lotto2.ok ? "#a98bf0" : "var(--ink)"}">${r.score}</div>
      <div class="dc-flow" style="color:var(--good)">${r.flags.herStrong ? "✿ 합궁" : "&nbsp;"}</div><div class="dc-flow" style="color:#e88fc0">${r.westHap ? "✿ 서양합궁" : "&nbsp;"}</div>${r.lotto1.ok || r.lotto2.ok ? `<div class="dc-flow" style="color:#a98bf0">🍀 ${r.lotto1.ok && r.lotto2.ok ? "둘 다 로또" : r.lotto1.ok ? "나의 로또" : "그녀 로또"}</div>` : ""}
      <div class="dc-day">${r.dayGZ.hanja}</div></div>`;
  }
  const tail = (7 - (lead + daysIn) % 7) % 7;
  for (let i = 0; i < tail; i++) cells += `<div class="day-cell dim"></div>`;
  $("calGrid").innerHTML = cells;

  // 범례
  $("calLegend").innerHTML = `<span><i style="border:1px solid rgba(240,217,140,.45);background:rgba(240,217,140,.14)"></i>⭐ 피크</span>
    <span><i style="background:rgba(95,185,138,.12);border:1px solid rgba(95,185,138,.35)"></i>✿ 합궁</span>
    <span><i style="background:rgba(232,143,192,.14);border:1px solid rgba(232,143,192,.45)"></i>✿ 서양합궁</span>
    <span><i style="background:rgba(226,101,92,.13);border:1px solid rgba(226,101,92,.4)"></i>⚡ 최고 위험(일지 충 + 일간 극)</span>
    <span><i style="background:rgba(169,139,240,.14);border:1px solid rgba(169,139,240,.45)"></i>🍀 나의 로또 · 그녀 로또</span>
    <span><i style="background:rgba(255,255,255,.03);border:1px solid var(--line2)"></i>그 외 날</span>
    <span>숫자 = 그날의 속궁합 점수(0~100) · 피크이면서 합궁인 날은 금색 칸에 ✿ 표시</span>`;

  // 이달 요약 — 피크 TOP 3 + 합방합궁(✿ 그녀 컨디션 좋은 날)
  const peaks = [...data].sort((a, b) => b.score - a.score).slice(0, 3);
  const dz = data.filter(x => x.flags.danger);
  const hs = data.filter(x => x.flags.herStrong), ws = data.filter(x => x.westHap), any = data.filter(x => x.flags.herStrong || x.westHap);
  const hList = any.length ? any.map(x => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="today-ilju">${fmtYMD(x.date)}</span><span class="today-date">${x.dayGZ.hanja}</span><span style="flex:1">${peakBadge(false, x.flags.herStrong, x.westHap)}</span><b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>`).join("") : `<div class="flow-item"><span class="fx">이 달에 없음</span></div>`;
  $("dailySummary").innerHTML = `
    <div class="grid2">
      <div class="card"><div class="sec-t">이달 속궁합 피크 TOP 3</div>
        ${peaks.map((x, i) => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="rk">${i + 1}</span><span class="today-ilju">${fmtYMD(x.date)}</span><span class="today-date">${x.dayGZ.hanja}일</span><span style="flex:1">${peakBadge(x.grade.k === "peak", x.flags.herStrong, x.westHap)}</span><b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>`).join("")}</div>
      <div class="card"><div class="sec-t">합방합궁 — 이달</div>
        <div style="font-size:13px;margin-bottom:6px"><b style="color:var(--good)">✿ 합궁</b> ${hs.length}일 · <b style="color:#e88fc0">✿ 서양합궁</b> ${ws.length}일 · 둘 다 ${data.filter(x => x.flags.herStrong && x.westHap).length}일</div>
        ${hList}</div>
    </div>
    <div class="card"><div class="sec-t">⚡ 최고 위험 — 이달 <small>(일지 충 + 일간 극)</small></div>
      ${dz.length ? dz.map(x => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="today-ilju" style="color:var(--bad)">${fmtYMD(x.date)}</span><span class="today-date">${x.dayGZ.hanja}일</span><span style="flex:1;font-size:12.5px;color:var(--sub)">${esc(x.reasons.filter(q => q.s < 0).map(q => q.t).join(" · "))}</span><b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>`).join("") : '<div class="flow-item"><span class="fx">이 달에 없음</span></div>'}
      <div style="font-size:12px;color:var(--sub);margin-top:6px">만나거나 통화할 때 감정이 가장 부딪히기 쉬운 날입니다. 예민한 이야기는 미루고 말투를 부드럽게.</div></div>
    <div class="card"><div class="sec-t">🍀 로또 사기 좋은 날 — 이달 <small>(사주 재물 ×4 + 서양 재물 합산)</small></div>
      <div class="grid2">${[[ST.p1, "lotto1", "나의 로또"], [ST.p2, "lotto2", "그녀 로또"]].map(([p, k, lb]) => { const L = data.filter(x => x[k].ok); return `<div><b>${esc(p.name)} · ${lb}</b> ${L.length}일
        ${L.length ? L.map(x => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="today-ilju">${fmtYMD(x.date)}</span><span class="today-date">${x.dayGZ.hanja}일</span><span style="flex:1;font-size:12px;color:var(--sub)">${esc(x[k].saju.tags.join(" · "))}</span><b style="font-family:var(--serif);font-size:16px">${x[k].score}</b></div>`).join("") : '<div class="flow-item"><span class="fx">이 달에 없음</span></div>'}</div>`; }).join("")}</div>
      <div style="font-size:12px;color:var(--sub);margin-top:6px">재미로 보는 운입니다. 로또는 무작위 추첨이라 당첨과는 무관해요.</div></div>`;
}
