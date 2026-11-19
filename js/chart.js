"use strict";
// 합연 — 명반 탭: 두 사람의 사주 8자 표(천간·지지·지장간·십신·12운성), 오행 분포, 대운, 별자리.
// 카드 빌더(myeongbanCardHTML)는 이별·재회 상담(consult.js)에서도 재사용한다.
function myeongbanCardHTML(p, gen) {
    // 4주 → 3행(주이름/천간/지지) 표
    const names = p.pillars.map(x => x ? x.name : "시주");
    const gans = p.pillars.map(x => x ? `<div class="han" style="color:${OH_COLOR[GAN_OH[x.gan]]}">${GAN[x.gan]}</div><span class="oh-tag" style="background:${OH_COLOR[GAN_OH[x.gan]]}">${GAN_OH[x.gan]}</span><div style="font-size:11px;color:var(--sub)">${x.name === "일주" ? "일간" : shiShen(p.dmGan, x.gan)}</div>` : "<div style='color:var(--sub);font-size:12px'>시간 모름</div>");
    const jis = p.pillars.map(x => x ? `<div class="han" style="color:${OH_COLOR[JI_OH[x.ji]]}">${JI[x.ji]}</div><span class="oh-tag" style="background:${OH_COLOR[JI_OH[x.ji]]}">${JI_OH[x.ji]}</span><div style="font-size:11px;color:var(--sub)">${woonseong(p.dmGan, x.ji)} · ${JJI_JANG[x.ji].map(g => GAN[g]).join("·")}</div>` : "<div style='color:var(--sub);font-size:12px'>—</div>");
    const tbl = `<table class="saju-tbl"><tr><th></th>${names.map((n, i) => `<th style="${i === 2 ? "background:rgba(212,175,55,.12)" : ""}">${n}</th>`).join("")}</tr>
      <tr><th>天干</th>${gans.map((g, i) => `<td class="${i === 2 ? "dm-cell" : ""}" style="${i === 3 ? "border-bottom-style:dashed" : ""}">${g}</td>`).join("")}</tr>
      <tr><th>地支</th>${jis.map((j, i) => `<td class="${i === 2 ? "dm-cell" : ""}" style="${i === 3 ? "border-bottom-style:dashed" : ""}">${j}</td>`).join("")}</tr></table>`;
    const maxC = Math.max(...OHS.map(o => p.cnt[o]), 1);
    const bars = OHS.map(o => `<div class="oh-bar-row"><span class="lb">${o}</span><div class="oh-bar"><i style="width:${(p.cnt[o] / maxC * 100).toFixed(0)}%;background:${OH_COLOR[o]}"></i></div><span class="ct">${p.cnt[o]}</span></div>`).join("");
    const dayun = daYunHTML(p, gen);
    return `<div class="card"><div class="sec-t">${esc(p.name)} 명반 <small>${esc(p.profile.name)} · ${p.solarYmd} (음력 ${esc(p.lunarYmd)})</small></div>
      ${tbl}
      <div style="margin:10px 0 4px;font-size:13px"><b class="today-ilju">일주 ${p.dmHanja}</b> · 일간 오행 <b style="color:${OH_COLOR[p.dmOh]}">${p.dmOh}</b> · 용신(근사) <b style="color:${OH_COLOR[p.yongsin]}">${p.yongsin}</b> · 별자리 ${p.zodiac.name}(${p.zodiac.el})</div>
      <div class="sec-t" style="margin-top:14px">오행 분포</div>${bars}
      <div class="sec-t" style="margin-top:14px">대운 <small>(10년 주기 — 현재 위치)</small></div>${dayun}</div>`;
}

function renderMyeongban(targetId) {
  $(targetId || "myeongbanCards").innerHTML = myeongbanCardHTML(ST.p1, 1) + myeongbanCardHTML(ST.p2, 0); // 남자(1)·여자(0) — 양남음녀 대운 방향
}

function daYunHTML(p, gen) {
  try {
    const solar = Solar.fromYmdHms(p.profile.y, p.profile.m, p.profile.d, p.profile.h === "" ? 12 : +p.profile.h, +p.profile.mi || 0, 0);
    const dy = solar.getLunar().getEightChar().getYun(gen).getDaYun(9);
    const rows = dy.map(x => ({ gz: x.getGanZhi(), a: x.getStartAge() })).filter(x => x.gz);
    // 현재 나이에 해당하는 대운 강조
    const nowAge = new Date().getFullYear() - p.profile.y + 1;
    const cur = rows.find(x => nowAge >= x.a && nowAge < x.a + 10);
    const chips = rows.map(x => `<span class="badge ${cur && x.a === cur.a ? "b-charge" : "b-neutral"}" style="font-weight:${cur && x.a === cur.a ? 800 : 500}">${x.a}세 ${x.gz}</span>`).join(" ");
    const curTxt = cur ? `<div style="font-size:12.5px;color:var(--sub);margin-top:6px">현재: 한국식 나이 약 ${nowAge}세 → <b style="color:var(--gold2)">${cur.a}세~ ${cur.gz} 대운</b>${cur.gz.length === 2 ? ` (대운 오행: ${GAN_OH[GAN.indexOf(cur.gz[0])]})` : ""}</div>` : "";
    return `<div>${chips}</div>${curTxt}`;
  } catch (e) {
    return `<div style="color:var(--sub);font-size:12.5px">대운 계산 실패 (${esc(e.message)})</div>`;
  }
}
