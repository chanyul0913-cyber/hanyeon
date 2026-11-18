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

  // 9) 일별 스코어 400일 — 범위·형식, 1년 안에 '좋음' 이상 존재
  let peak = 0;
  let d = new Date(2026, 10, 15, 12);
  for (let i = 0; i < 400; i++) {
    const r = dailySync(p1, p2, d);
    ok(r.score >= 0 && r.score <= 100 && r.grade && r.flags);
    if (r.score > peak) peak = r.score;
    d = addDays(d, 1);
  }
  ok(peak >= 68);

  // 10) 고정 궁합 — 부분 구성·점수 범위
  const c = coupleFixed(p1, p2);
  ok(c.score >= 0 && c.score <= 100 && c.parts.length >= 3 && c.grade);

  // 10-1) 합성 커플(남=수 일간, 여=금 일간) — 화일 애정 동조, 합궁(✿)은 토·금일만
  const fk1 = { name: "합성남", dmGan: 8, dmJi: 8, dmOh: "수", jaeOh: OH_KEUK["수"], gwanOh: ohKeukMe("수"), yongsin: "목", cnt: { 목: 0, 화: 1, 토: 2, 금: 2, 수: 3 } };
  const fk2 = { name: "합성녀", dmGan: 7, dmJi: 9, dmOh: "금", jaeOh: OH_KEUK["금"], gwanOh: ohKeukMe("금"), yongsin: "수", cnt: { 목: 1, 화: 0, 토: 1, 금: 4, 수: 1 } };
  let fLove = 0, fDanger = 0;
  d = new Date(2026, 0, 1, 12);
  for (let i = 0; i < 200; i++) {
    const r = dailySync(fk1, fk2, d);
    if (r.flags.love) fLove++;
    eq(!!r.flags.herStrong, ["토", "금"].includes(r.dayGZ.oh), "여자합궁" + r.date);
    const chung = r.reasons.some(q => /일지와 충/.test(q.t)), keuk = r.reasons.some(q => /긴장 유입\(관살\)/.test(q.t));
    eq(r.flags.danger, chung && keuk, "최고위험" + r.date);
    if (r.flags.danger) fDanger++;
    ok(r.score >= 0 && r.score <= 100);
    d = addDays(d, 1);
  }
  ok(fLove > 0); ok(fDanger > 0 && fDanger < 40); // 200일 중 최고 위험일은 있되 드물어야
  const fc = coupleFixed(fk1, fk2);
  ok(fc.score >= 0 && fc.score <= 100);

  // 10-4) 신살 — 일지 자(子)의 도화는 유(酉), 갑 일간 천을귀인은 축·미 (인덱스 입력)
  ok(shinsalOf(0, 0, 9).some(x => x.name === "도화살"));
  ok(shinsalOf(0, 0, 1).some(x => x.name === "천을귀인"));

  // 10-5) 월운 — 범위, 2026년 월건(양력 2월 15일 = 경인월)
  eq(getMonthGZ(2026, 2).hanja, "庚寅", "2026-02월건");
  for (let m = 1; m <= 12; m++) { const L = monthlyLuck(p1, true, 2026, m); ok(L.wealth >= 1 && L.wealth <= 5 && L.love >= 1 && L.love <= 5); }

  // 10-6) 토정비결 — 공개 조견표 값(갑자20·경자19·병오16), 괘 범위, 낭월 예시(64세+경자년 → 상괘 3)
  eq(tjNum("甲子"), 20, "태세수갑자"); eq(tjNum("庚子"), 19, "태세수경자"); eq(tjNum("丙午"), 16, "태세수병오");
  eq((64 + tjNum("庚子")) % 8 || 8, 3, "낭월예시상괘");
  const tj = tojeong(p1, 2026);
  ok(tj.up >= 1 && tj.up <= 8 && tj.mid >= 1 && tj.mid <= 6 && tj.low >= 1 && tj.low <= 3);
  if (typeof TJ === "object") { eq(Object.keys(TJ).length, 144, "토정144괘"); ok(TJ[tj.gwae]); }

  // 11) 별자리 경계
  eq(zodiacSign(2000, 1, 5).name, "염소자리", "별자리염소");
  eq(zodiacSign(2000, 3, 22).name, "양자리", "별자리양");
  eq(zodiacSign(2000, 12, 21).name, "사수자리", "별자리사수");

  // 11-1) 개인 하루 운(운세 상담) — 범위·형식·세운 년건
  const pd = personDay(p1, new Date(2026, 10, 17, 12));
  ok(pd.score >= 0 && pd.score <= 100 && pd.grade && pd.sg && pd.ws && typeof pd.wealth.raw === "number");
  d = new Date(2026, 10, 17, 12);
  for (let i = 0; i < 7; i++) { const x = personDay(p1, addDays(d, i)); ok(x.score >= 0 && x.score <= 100); }
  eq(getYearGZ(2026).hanja, "丙午", "2026세운"); eq(getYearGZ(2025).hanja, "乙巳", "2025세운");

  // 12) 서양 일별 궁합(트랜짓) — 범위·형식, 1년 안에 조화일 존재 (astronomy.js 있을 때만)
  if (window.Astronomy && typeof dailyWestSync === "function") {
    let wSync = 0, wLotto = 0; d = new Date(2026, 10, 15, 12);
    for (let i = 0; i < 365; i++) {
    const r = dailyWestSync(p1, p2, d);
    ok(r.score >= 0 && r.score <= 100 && r.grade && r.moon);
    ok(r.moon.el && ["불", "흙", "바람", "물"].includes(r.moon.el)); // 달 별자리 원소 — 심리운세 표기용
      if (r.syncList.length) wSync++;
      const mv = r.aspects.filter(x => x.who === 2 && ["Moon", "Venus"].includes(x.t.key));
      eq(r.herStrong, mv.some(x => x.a.s > 0) && !mv.some(x => x.a.s < 0), "서양합궁" + r.date);
      const L = lottoOf(p1, 1, d, r); // 로또일 = 사주 재물≥2 · 서양 재물>0 · 합산≥20
      eq(L.ok, L.saju.raw >= 2 && L.west > 0 && L.score >= 20, "로또일" + r.date);
      if (L.ok) wLotto++;
      d = addDays(d, 1);
    }
    ok(wSync > 0); ok(wLotto > 0 && wLotto < 80); // 로또일은 1년에 있되 드물게
    // 13) 투자(주식) 트랜짓 — 합산 범위·쌍 개수 상한(4×4=16)
    const iv = investSync(p1, d);
    ok(typeof iv.west === "number" && Math.abs(iv.west) <= 40 && iv.harm.length + iv.tense.length <= 16);
  }

  // 분포 요약(참고용)
  const dist = { peak: 0, good: 0, normal: 0, care: 0, bad: 0 };
  d = new Date(2026, 10, 15, 12);
  for (let i = 0; i < 365; i++) { dist[dailySync(p1, p2, d).grade.k]++; d = addDays(d, 1); }
  const sum = { ok: P.length === 0, problems: P.filter(Boolean), peak, dist };
  console.log("[합연 selfTest]", sum);
  return sum;
}
