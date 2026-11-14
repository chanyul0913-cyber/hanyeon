"use strict";
// 합연 — 일별 궁합 탭: 월 캘린더(속궁합 점수·기의 흐름 배지)·필터·이달 요약(피크일·흐름일 랭킹).
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
  const show = { peak: $("fPeak").checked, me: $("fMe").checked, her: $("fHer").checked, care: $("fCare").checked, yongsin: $("fYongsin").checked, herStrong: $("fHerStrong").checked };
  for (let d = 1; d <= daysIn; d++) {
    const r = data[d - 1];
    const dimmed = !(show.peak && r.grade.k === "peak") && !(show.me && r.flags.meToHer && !r.flow.warn) && !(show.her && r.flags.herToMe && !r.flow.warn) && !(show.care && ["care", "bad"].includes(r.grade.k)) && !(show.yongsin && r.flow.yongsin) && !(show.herStrong && r.flags.herStrong);
    const star = r.grade.k === "peak" ? '<span class="star">⭐</span>' : r.flags.tension || r.flow.warn ? '<span class="star">⚠</span>' : "";
    cells += `<div class="day-cell ${r.grade.k === "peak" ? "d-peak" : r.grade.k === "good" ? "d-good" : r.grade.k === "normal" ? "" : r.grade.k === "care" ? "d-care" : "d-bad"} ${dimmed ? "dim" : ""}"
      onclick="openDayModal(${r.date})">
      ${star}<div class="dc-date"><span>${d}</span>${r.date === todayN ? '<b style="color:var(--gold2)">오늘</b>' : ""}</div>
      <div class="dc-score" style="color:${r.score >= 82 ? "var(--peak)" : r.score >= 68 ? "var(--good)" : r.score >= 52 ? "var(--ink)" : r.score >= 38 ? "var(--care)" : "var(--bad)"}">${r.score}</div>
      <div class="dc-flow">${r.flow.yongsin ? "✧ " : ""}${r.flow.icon} ${esc(r.flow.label)}${r.flags.love ? " ♥" : ""}${r.flags.herStrong ? " ✿" : ""}</div>
      <div class="dc-day">${r.dayGZ.hanja}</div></div>`;
  }
  const tail = (7 - (lead + daysIn) % 7) % 7;
  for (let i = 0; i < tail; i++) cells += `<div class="day-cell dim"></div>`;
  $("calGrid").innerHTML = cells;

  // 범례
  $("calLegend").innerHTML = `<span><i class="d-peak" style="border:1px solid rgba(240,217,140,.45);background:rgba(240,217,140,.14)"></i>속궁합 최고(82+)</span>
    <span><i style="background:rgba(95,185,138,.12);border:1px solid rgba(95,185,138,.35)"></i>좋음(68~)</span>
    <span><i style="background:rgba(255,255,255,.03);border:1px solid var(--line2)"></i>보통</span>
    <span><i style="background:rgba(226,161,92,.12);border:1px solid rgba(226,161,92,.35)"></i>주의</span>
    <span><i style="background:rgba(226,101,92,.13);border:1px solid rgba(226,101,92,.4)"></i>긴장</span>
    <span>→ 나→그녀(생: 상대를 채움) · ← 그녀→나(생) · →(부담): 기운은 가지만 극으로 닿음 · ✧ 용신 전달 · ✿ 그녀 컨디션 좋음(그날이 그녀를 生하거나 같은 오행) · ♥ 애정 · ⭐ 피크 · ⚠ 충·형</span>`;

  // 이달 요약 — 기의 흐름은 상대를 채우는(생) 좋은 흐름만, 용신 전달일 별도 표시
  const peaks = [...data].sort((a, b) => b.score - a.score).slice(0, 3);
  const me = data.filter(x => x.flags.meToHer && !x.flow.warn), her = data.filter(x => x.flags.herToMe && !x.flow.warn);
  const ys = data.filter(x => x.flow.yongsin), hs = data.filter(x => x.flags.herStrong), care = data.filter(x => ["care", "bad"].includes(x.grade.k));
  const flowList = (arr, dir) => arr.length ? arr.map(x => `<div class="flow-item" onclick="openDayModal(${x.date})" style="cursor:pointer"><span class="fd">${fmtYMD(x.date)}</span><span class="fi" style="color:var(--su)">${dir}${x.flow.yongsin ? " ✧" : ""}</span><span class="fx">${x.dayGZ.hanja}일 · 점수 ${x.score}</span></div>`).join("") : `<div class="flow-item"><span class="fx">이 달에 없음</span></div>`;
  $("dailySummary").innerHTML = `
    <div class="grid2">
      <div class="card"><div class="sec-t">이달 속궁합 피크 TOP 3</div>
        ${peaks.map((x, i) => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="rk">${i + 1}</span><span class="today-ilju">${fmtYMD(x.date)}</span><span class="today-date">${x.dayGZ.hanja}일</span><span style="flex:1">${flowBadge(x)}</span><b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>`).join("")}</div>
      <div class="card"><div class="sec-t">기의 흐름 — 이달</div>
        <div style="font-size:13px;margin-bottom:6px"><b style="color:var(--su)">나 → 그녀</b> ${me.length}일 · <b style="color:var(--su)">그녀 → 나</b> ${her.length}일 · ✧ 용신 전달 ${ys.length}일 · ✿ 그녀 컨디션 좋음 ${hs.length}일 · 주의 ${care.length}일</div>
        ${flowList(ys, "✧ 용신 전달")}${flowList(me, "나 → 그녀")}${flowList(her, "그녀 → 나")}${flowList(hs, "✿ 그녀 컨디션")}</div>
    </div>`;
}
