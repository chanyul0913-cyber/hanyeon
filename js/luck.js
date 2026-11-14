"use strict";
// 합연 — 월별 재물운·애정운 탭: 두 사람의 12개월 월운(★1~5)을 나란히 표시. 계산은 engine.js monthlyLuck.
// 월별 한두 문장 — 별점에 맞는 판단 + 그렇게 본 이유(그달 기운)
const LUCK_W = ["", "큰 지출과 투자는 미루고 돈을 지키세요.", "씀씀이를 줄이는 게 좋습니다.", "재물은 무난합니다.", "수입이 늘고 돈 흐름이 좋습니다.", "큰 재물 기회가 오니 적극적으로 움직이세요."];
const LUCK_L = ["", "감정 소모를 줄이고 말을 아끼세요.", "사소한 서운함이 생기기 쉬우니 먼저 다정하게 다가가세요.", "애정은 잔잔하고 편안합니다.", "마음이 잘 통하고 설렙니다.", "애정이 가장 뜨거운 달입니다."];
const WHY = { 재성월: "재물 기운이 들어옴", 식신생재: "일한 만큼 돈이 따라옴", "겁재(지출)": "지출·경쟁이 늘어남", 용신월: "부족한 기운이 채워짐", "일지 충": "변동·충돌이 생기기 쉬움", "일지 육합": "주변의 도움이 있음", "일지 삼합": "주변과 힘을 합침",
  "재성(이성)월": "이성 인연의 기운이 들어옴", "관성(이성)월": "이성 인연의 기운이 들어옴", 도화월: "매력과 끌림이 살아남", 천간합: "마음이 잘 맞음" };
const luckLine = (verdict, tags) => verdict + (tags.length ? ` <span style="opacity:.75">(${tags.map(t => WHY[t] || t).join(" · ")})</span>` : "");

function renderLuck() {
  const Y = ST.fYear, p1 = ST.p1, p2 = ST.p2, now = new Date();
  $("luckTitle").textContent = `${Y}년`;
  const rows = [];
  for (let m = 1; m <= 12; m++) rows.push({ m, a: monthlyLuck(p1, true, Y, m), b: monthlyLuck(p2, false, Y, m) });
  const star = n => `<span style="color:var(--gold2)">${"★".repeat(n)}</span><span style="opacity:.25">${"★".repeat(5 - n)}</span>`;
  const cell = n => `<td>${star(n)}</td>`; // 이유는 아래 문장 줄에 함께 표시
  const isNow = m => Y === now.getFullYear() && m === now.getMonth() + 1;
  const best = (key, who) => { const mx = Math.max(...rows.map(r => r[who][key])); return mx < 4 ? `뚜렷이 좋은 달 없음 (최고 ★${mx})` : rows.filter(r => r[who][key] === mx).map(r => r.m + "월").join("·") + ` (★${mx})`; };
  const both = rows.filter(r => r.a.love >= 4 && r.b.love >= 4).map(r => r.m + "월");

  $("luckBody").innerHTML = `<div class="card gold"><div class="sec-t">${Y}년 한눈에 보기</div>
      <table class="mini-tbl">
        <tr><td>${esc(p1.name)} 재물운 좋은 달</td><td><b>${best("wealth", "a")}</b></td></tr>
        <tr><td>${esc(p1.name)} 애정운 좋은 달</td><td><b>${best("love", "a")}</b></td></tr>
        <tr><td>${esc(p2.name)} 재물운 좋은 달</td><td><b>${best("wealth", "b")}</b></td></tr>
        <tr><td>${esc(p2.name)} 애정운 좋은 달</td><td><b>${best("love", "b")}</b></td></tr>
        <tr><td>두 사람 애정운이 함께 좋은 달</td><td><b>${both.length ? both.join("·") : "없음"}</b></td></tr>
      </table></div>
    <div class="card"><div class="sec-t">월별 재물운 · 애정운</div>
      <div style="overflow-x:auto"><table class="mini-tbl" style="min-width:520px">
        <tr><td><b>월 (월건)</b></td><td><b>${esc(p1.name)} 재물</b></td><td><b>${esc(p1.name)} 애정</b></td><td><b>${esc(p2.name)} 재물</b></td><td><b>${esc(p2.name)} 애정</b></td></tr>
        ${rows.map(r => `<tr style="${isNow(r.m) ? "background:rgba(240,217,140,.10)" : ""}"><td><b>${r.m}월</b>${isNow(r.m) ? ' <b style="color:var(--gold2)">이번 달</b>' : ""}<div style="font-size:11px;color:var(--sub)">${r.a.gz.hanja}(${r.a.gz.ilju})</div></td>${cell(r.a.wealth)}${cell(r.a.love)}${cell(r.b.wealth)}${cell(r.b.love)}</tr>
          <tr style="${isNow(r.m) ? "background:rgba(240,217,140,.10)" : ""}"><td colspan="5" style="font-size:12.5px;color:var(--sub);border-bottom:1px solid var(--line2)"><b style="color:var(--ink)">${esc(p1.name)}</b> 재물: ${luckLine(LUCK_W[r.a.wealth], r.a.wTags)}<br><span style="visibility:hidden"><b>${esc(p1.name)}</b></span> 애정: ${luckLine(LUCK_L[r.a.love], r.a.lTags)}<br><b style="color:var(--ink)">${esc(p2.name)}</b> 재물: ${luckLine(LUCK_W[r.b.wealth], r.b.wTags)}<br><span style="visibility:hidden"><b>${esc(p2.name)}</b></span> 애정: ${luckLine(LUCK_L[r.b.love], r.b.lTags)}</td></tr>`).join("")}
      </table></div>
      <div style="margin-top:8px;font-size:12px;color:var(--sub)">월건은 양력 그달 15일이 속한 절기월 기준. 재물운은 재성·식신·용신·일지 합충, 애정운은 남자는 재성·여자는 관성과 도화·일지 합충·천간합으로 매깁니다.</div></div>`;
}
