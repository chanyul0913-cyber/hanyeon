"use strict";
// 합연 — 엔진 자가 점검. 콘솔에서 `await selfTest()` 실행 → ok:true(빈 problems)여야 함.
async function selfTest() {
  const P = [], ok = x => { if (!x) P.push(x); };
  const eq = (a, b, tag) => { if (a !== b) P.push(`${tag}: ${a} ≠ ${b}`); };

  // 0) 라이브러리
  ok(window.Solar && window.Lunar);

  // 1) 일진 60주기 — 60일 뒤에 같은 간지
  const d1 = new Date(2026, 10, 15, 12);
  eq(getDayGZ(d1).hanja, getDayGZ(addDays(d1, 60)).hanja, "일진60주기");
  eq(getDayGZ(addDays(d1, 7)).hanja.length, 2, "일진형식");

  // 2) 년주·월주 — 2026년은 병오년, 6월 초(입하~망종)는 癸巳月
  const ec = Solar.fromYmdHms(2026, 6, 1, 12, 0, 0).getLunar().getEightChar();
  eq(ec.getYear(), "丙午", "2026년주");
  eq(ec.getMonth(), "癸巳", "2026-06월주");

  // 3) 지지 관계 — 우선순위(인해는 육합이자 파 → 육합이 우선), 충·원진
  eq(zaRel("인", "해"), "육합", "관계우선순위");
  eq(zaRel("자", "오"), "충", "충");
  eq(zaRel("자", "술"), "원진", "원진");
  eq(zaRel("신", "진"), "삼합", "삼합");

  // 4) 천간합
  ok(isGanHap(0, 5) && isGanHap(5, 0)); ok(!isGanHap(0, 6));
  eq(ganHapWith(3).with, 8, "천간합정임");

  // 5) 십신 — 갑 일간 기준
  eq(shiShen(0, 1), "겁재", "십신겁재"); eq(shiShen(0, 2), "식신", "십신식신");
  eq(shiShen(0, 4), "편재", "십신편재"); eq(shiShen(0, 6), "편관", "십신편관");
  eq(shiShen(0, 9), "정인", "십신정인"); eq(shiShen(0, 0), "비견", "십신비견");

  // 6) 12운성 — 갑 장생=해, 을 장생=오, 경 장생=사, 을 기준 인=제왕(음간 역행)
  eq(woonseong(0, 11), "장생", "운성갑"); eq(woonseong(1, 6), "장생", "운성을");
  eq(woonseong(6, 5), "장생", "운성경"); eq(woonseong(1, 2), "제왕", "운성을역행");

  // 7) 사람 계산 — 8글자(시간 있음)·6글자(없음), 오행 합
  const prof1 = { name: "테스트남", y: 1990, m: 5, d: 15, cal: "solar", leap: false, h: "10", mi: 30 };
  const p1 = calcPerson(prof1);
  eq(p1.pillars.filter(Boolean).length, 4, "사주4주");
  eq(OHS.reduce((s, o) => s + p1.cnt[o], 0), 8, "오행합8");
  eq(p1.pillars[2].hanja.length, 2, "일주형식");
  const prof2 = { name: "테스트녀", y: 1993, m: 2, d: 3, cal: "solar", leap: false, h: "", mi: 0 };
  const p2 = calcPerson(prof2);
  eq(p2.pillars.filter(Boolean).length, 3, "시주모름3주");
  eq(OHS.reduce((s, o) => s + p2.cnt[o], 0), 6, "오행합6");

  // 8) 양력↔음력 동일성 — 위 양력 생일을 음력으로 다시 계산해 같은 사주인지
  const lun = Solar.fromYmdHms(1990, 5, 15, 12, 0, 0).getLunar();
  const p1b = calcPerson({ name: "x", y: lun.getYear(), m: Math.abs(lun.getMonth()), d: lun.getDay(), cal: "lunar", leap: lun.getMonth() < 0, h: "10", mi: 30 });
  eq(p1b.dmHanja, p1.dmHanja, "양음력일주일치");
  eq(p1b.pillars[0].hanja, p1.pillars[0].hanja, "양음력년주일치");

  // 9) 일별 스코어 400일 — 범위·플래그 일관성
  let peak = 0, her2me = 0, me2her = 0;
  let d = new Date(2026, 10, 15, 12);
  for (let i = 0; i < 400; i++) {
    const r = dailySync(p1, p2, d);
    ok(r.score >= 0 && r.score <= 100);
    ok(r.grade && r.flow && r.flow.dir);
    ok(!(r.flags.meToHer && r.flags.herToMe));
    if (r.score > peak) peak = r.score;
    if (r.flags.meToHer) me2her++;
    if (r.flags.herToMe) her2me++;
    d = addDays(d, 1);
  }
  ok(peak >= 68); // 1년 안에 최소한 '좋음' 이상은 존재해야 함
  ok(me2her > 0 || her2me > 0); // 기의 흐름일이 1년에 최소 한 번은 존재

  // 10) 고정 궁합 — 부분 구성·점수 범위
  const c = coupleFixed(p1, p2);
  ok(c.score >= 0 && c.score <= 100 && c.parts.length >= 3 && c.grade);

  // 10-1) 합성 커플(남=수 일간, 여=금 일간) — 금생수 체인으로 그녀→나 흐름·애정 동조일 검증
  const fk1 = { name: "합성남", dmGan: 8, dmJi: 8, dmOh: "수", jaeOh: OH_KEUK["수"], gwanOh: ohKeukMe("수"), yongsin: "목", cnt: { 목: 0, 화: 1, 토: 2, 금: 2, 수: 3 } };
  const fk2 = { name: "합성녀", dmGan: 7, dmJi: 9, dmOh: "금", jaeOh: OH_KEUK["금"], gwanOh: ohKeukMe("금"), yongsin: "수", cnt: { 목: 1, 화: 0, 토: 1, 금: 4, 수: 1 } };
  let fMe2her = 0, fHer2me = 0, fLove = 0;
  d = new Date(2026, 0, 1, 12);
  for (let i = 0; i < 200; i++) {
    const r = dailySync(fk1, fk2, d);
    if (r.flags.meToHer) fMe2her++;
    if (r.flags.herToMe) fHer2me++;
    if (r.flags.love) fLove++;
    d = addDays(d, 1);
  }
  ok(fHer2me > 0); ok(fMe2her === 0); ok(fLove > 0); // 금→수 흐름만 성립, 화일에 애정 동조
  const fc = coupleFixed(fk1, fk2);
  ok(fc.score >= 0 && fc.score <= 100);

  // 10-2) 합성 커플(남=목 일간, 여=금 일간) — 부담 흐름(내 기→상대를 극)과 용신 전달 검증
  const fk3 = { name: "합성남3", dmGan: 0, dmJi: 2, dmOh: "목", jaeOh: OH_KEUK["목"], gwanOh: ohKeukMe("목"), yongsin: "수", cnt: { 목: 3, 화: 1, 토: 1, 금: 0, 수: 1 } };
  const fk4 = { name: "합성녀4", dmGan: 6, dmJi: 8, dmOh: "금", jaeOh: OH_KEUK["금"], gwanOh: ohKeukMe("금"), yongsin: "수", cnt: { 목: 0, 화: 1, 토: 2, 금: 4, 수: 1 } };
  let pWarn = 0, pGood = 0, pYongsin = 0, pHerWarn = 0;
  d = new Date(2026, 0, 1, 12);
  for (let i = 0; i < 400; i++) {
    const r = dailySync(fk3, fk4, d);
    if (r.flow.dir === "me2her" && r.flow.warn) pWarn++;
    if (r.flow.dir === "me2her" && !r.flow.warn) pGood++;
    if (r.flow.dir === "her2me" && r.flow.warn) pHerWarn++;
    if (r.flow.yongsin === "me" || r.flow.yongsin === "her") pYongsin++;
    ok(r.score >= 0 && r.score <= 100);
    d = addDays(d, 1);
  }
  ok(pWarn > 0);    // 목→화→(화 극 금): 내 기운이 가지만 부담이 되는 날 존재
  ok(pGood === 0);  // 남목·여금 구조상 상대를 生하는 me2her 체인은 성립하지 않음
  ok(pYongsin > 0); // 그녀→나(금→수 체인) + 내 용신 수 → 용신 수혜일(✧) 존재
  ok(pHerWarn === 0); // 금→수→(수 극 목)? 수 극 화이므로 성립하지 않음

  // 10-3) 그녀 컨디션(✿) — 여=금 일간이면 토(무·기)·금(경·신)일만 해당
  d = new Date(2026, 0, 1, 12);
  for (let i = 0; i < 60; i++) {
    const r = dailySync(fk3, fk4, d);
    eq(!!r.flags.herStrong, ["토", "금"].includes(r.dayGZ.oh), "그녀컨디션" + r.date);
    d = addDays(d, 1);
  }

  // 11) 별자리 경계
  eq(zodiacSign(2000, 1, 5).name, "염소자리", "별자리염소");
  eq(zodiacSign(2000, 3, 22).name, "양자리", "별자리양");
  eq(zodiacSign(2000, 12, 21).name, "사수자리", "별자리사수");

  // 12) 서양 일별 궁합(트랜짓) — 범위·형식, 1년 안에 조화일 존재 (astronomy.js 있을 때만)
  if (window.Astronomy && typeof dailyWestSync === "function") {
    let wSync = 0; d = new Date(2026, 10, 15, 12);
    for (let i = 0; i < 365; i++) {
      const r = dailyWestSync(p1, p2, d);
      ok(r.score >= 0 && r.score <= 100 && r.grade && r.flow && r.moon);
      if (r.flow.dir === "sync") wSync++;
      d = addDays(d, 1);
    }
    ok(wSync > 0);
  }

  // 분포 요약(참고용)
  const dist = { peak: 0, good: 0, normal: 0, care: 0, bad: 0 };
  d = new Date(2026, 10, 15, 12);
  for (let i = 0; i < 365; i++) { dist[dailySync(p1, p2, d).grade.k]++; d = addDays(d, 1); }
  const sum = { ok: P.length === 0, problems: P.filter(Boolean), peak, me2her, her2me, warnMe2her: pWarn, yongsin: pYongsin, dist };
  console.log("[합연 selfTest]", sum);
  return sum;
}
