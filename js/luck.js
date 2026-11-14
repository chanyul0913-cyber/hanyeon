"use strict";
// 합연 — 월별 재물운·애정운 탭: 두 사람의 12개월 월운(★1~5)을 나란히 표시. 계산은 engine.js monthlyLuck.
// 월별 한두 문장 — 재물·애정 ★ 단계별 문장 (★1~5)
const LUCK_W = ["", "돈이 새기 쉬우니 큰 지출과 투자는 미루세요.", "지출이 늘기 쉬운 달이라 씀씀이를 줄이는 게 좋습니다.", "재물은 평소만큼 무난합니다.", "수입이 늘고 돈 흐름이 좋은 달입니다.", "큰 재물 기회가 오는 달이니 적극적으로 움직이세요."];
const LUCK_L = ["", "감정이 부딪히기 쉬우니 말을 아끼세요.", "사소한 서운함이 생기기 쉬우니 먼저 다정하게 다가가세요.", "애정은 잔잔하고 편안합니다.", "마음이 잘 통하고 설레는 달입니다.", "애정이 가장 뜨거운 달입니다."];

function renderLuck() {
  const Y = ST.fYear, p1 = ST.p1, p2 = ST.p2, now = new Date();
  $("luckTitle").textContent = `${Y}년`;
  const rows = [];
  for (let m = 1; m <= 12; m++) rows.push({ m, a: monthlyLuck(p1, true, Y, m), b: monthlyLuck(p2, false, Y, m) });
  const star = n => `<span style="color:var(--gold2)">${"★".repeat(n)}</span><span style="opacity:.25">${"★".repeat(5 - n)}</span>`;
  const cell = (n, tags) => `<td>${star(n)}${tags.length ? `<div style="font-size:11px;color:var(--sub)">${tags.map(esc).join(" · ")}</div>` : ""}</td>`;
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
        ${rows.map(r => `<tr style="${isNow(r.m) ? "background:rgba(240,217,140,.10)" : ""}"><td><b>${r.m}월</b>${isNow(r.m) ? ' <b style="color:var(--gold2)">이번 달</b>' : ""}<div style="font-size:11px;color:var(--sub)">${r.a.gz.hanja}(${r.a.gz.ilju})</div></td>${cell(r.a.wealth, r.a.wTags)}${cell(r.a.love, r.a.lTags)}${cell(r.b.wealth, r.b.wTags)}${cell(r.b.love, r.b.lTags)}</tr>
          <tr style="${isNow(r.m) ? "background:rgba(240,217,140,.10)" : ""}"><td colspan="5" style="font-size:12.5px;color:var(--sub);border-bottom:1px solid var(--line2)"><b style="color:var(--ink)">${esc(p1.name)}</b> ${LUCK_W[r.a.wealth]} ${LUCK_L[r.a.love]}<br><b style="color:var(--ink)">${esc(p2.name)}</b> ${LUCK_W[r.b.wealth]} ${LUCK_L[r.b.love]}</td></tr>`).join("")}
      </table></div>
      <div style="margin-top:8px;font-size:12px;color:var(--sub)">월건은 양력 그달 15일이 속한 절기월 기준. 재물운은 재성·식신·용신·일지 합충, 애정운은 남자는 재성·여자는 관성과 도화·일지 합충·천간합으로 매깁니다.</div></div>`;
}
