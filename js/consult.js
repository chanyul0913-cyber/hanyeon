"use strict";
// 합연 — 운세 상담 탭: 원하는 사람(남자·여자)을 고르고 오늘의 운세 메뉴를 펼쳐 보는 상담 형식.
// 모든 계산은 engine.js(personDay·monthlyLuck·tojeong·wealthRaw)와 western.js(트랜짓)를 사용한다.
// 심리·건강·직업 등은 십신·12운성·신살·오행·트랜짓을 근거로 이 사이트가 만든 자체 해석(재미·소통용).

const CONSULT_MENU = [
  ["all", "🌟", "종합", "오늘 하루의 전반적인 운세에 대해 알려드립니다"],
  ["mind", "🧠", "심리운세", "내 마음과 감정의 흐름을 알려드립니다"],
  ["love", "💗", "애정운세", "나의 사랑과 이성운을 알려드립니다"],
  ["romance", "💞", "연애운세", "우리 사랑의 오늘 상태를 알려드립니다"],
  ["breakup", "💔", "이별·재회 상담", "헤어진 관계의 마음과 재회 시기를 봅니다"],
  ["newlove", "🌸", "새 인연 시기", "좋은 이성 인연이 열리는 시기를 계산합니다"],
  ["tarot", "🃏", "타로운세", "타로 카드를 이용한 나의 오늘 운세"],
  ["wealth", "💰", "재물운세", "금전적 재물운에 대해 알려드립니다"],
  ["stock", "📈", "주식운세", "투자·매매의 컨디션을 알려드립니다"],
  ["health", "🌿", "건강운세", "나의 몸과 마음 건강에 대해 알려드립니다"],
  ["job", "💼", "직업운세", "직업과 관련된 운세를 알려드립니다"],
  ["week", "📅", "週 운세", "일주일간의 운세 흐름을 알려드립니다"],
  ["year", "🗓️", "년 운세", "올해 일년간의 큰 흐름을 알려드립니다"]
];
// 십신 → 오늘의 기조(한 단어)·기조 문장·세부 해석
const SS_DAY = {
  정인: ["채움", "받아들이고 배우는 하루", "새로운 말·정보·가르침이 마음에 잘 들어온다. 공부·문서·상담에 유리하고 마음이 차분한 편이다."],
  편인: ["생각", "생각이 깊어지는 하루", "머릿속이 복잡해지고 직감이 예민해진다. 결정은 미루고 아이디어는 기록해 두면 이롭다."],
  식신: ["표현", "표현하고 즐기는 하루", "말과 표현이 부드럽고 먹고 즐기는 복이 따른다. 발표·요리·만남 같은 생산적인 즐거움에 좋다."],
  상관: ["말", "말이 앞서기 쉬운 하루", "재주와 유머가 넘치지만 말이 날카로워진다. 구설은 조심하고 아이디어는 펼쳐도 된다."],
  정재: ["현실", "현실을 꾸려가는 하루", "성실함과 계획성이 살아난다. 정산·정리·약속 확정처럼 착실한 일에 잘 맞는다."],
  편재: ["기회", "기회와 활동성이 오는 하루", "재물·사람·기회가 움직인다. 큰 거래나 새로운 만남은 이날 노려 볼 만하다."],
  정관: ["책임", "규칙과 책임이 잡히는 하루", "평가와 인정이 따르기 쉬운 날. 윗사람·공문·계약처럼 격식을 갖춘 일에 유리하다."],
  편관: ["압박", "압박과 긴장이 생기는 하루", "부담과 경쟁이 커진다. 무리한 확장보다 기존 일을 단단히 지키는 쪽이 낫다."],
  비견: ["자기", "내 페이스대로 가는 하루", "주체성이 강해지는 날. 친구·동료와 어울리기 좋지만 고집은 한 발 물러서는 게 부드럽다."],
  겁재: ["경쟁", "경쟁과 지출이 느는 하루", "쓸 돈과 나설 일이 많아진다. 보증·도박성 지출은 피하고 실력은 아껴 쓴다."]
};
const REL_DAY = { 육합: "그날의 땅이 내 일지와 육합 — 몸과 마음이 편안해진다.", 삼합: "그날의 땅이 내 일지와 삼합 — 주변과 힘이 합쳐진다.", 충: "그날의 땅이 내 일지와 충 — 이동·변동이 생기고 마음이 흔들리기 쉽다.", 형: "그날의 땅이 내 일지와 형 — 예민해지니 말을 아낄 것.", 원진: "그날의 땅이 내 일지와 원진 — 사소한 말에 서운해질 수 있다.", 파: "그날의 땅이 내 일지와 파 — 약속이 어긋나기 쉽다.", 해: "그날의 땅이 내 일지와 해 — 방해 요소가 끼어들 수 있다." };
const WS_DAY = { 장생: "활력이 살아나는 날", 목욕: "감정이 예민해지기 쉬운 날", 관대: "격식과 품위가 돋보이는 날", 건록: "실력이 안정적으로 발휘되는 날", 제왕: "기세가 가장 강한 날 — 과욕만 조심", 쇠: "기운이 잦아드는 날 — 페이스 조절", 병: "몸이 유난히 피곤한 날 — 휴식 우선", 사: "정리하고 놓아주는 게 좋은 날", 묘: "결과가 정리되어 만족스러운 날", 절: "템포가 끊기기 쉬운 날 — 무리 금지", 태: "새 일을 준비하기 좋은 날", 양: "성장과 확장이 이어지는 날" };
const OH_TIP = { 목: "바깥 산책·스트레칭으로 기운을 펴면 회복이 빠릅니다.", 화: "일찍 자고 심박을 안정시키는 것이 최고의 보약입니다.", 토: "규칙적인 식사와 따뜻한 음식이 몸을 채워 줍니다.", 금: "심호흡·정리정돈으로 마음의 숨통을 트세요.", 수: "수분 섭취와 충분한 수면이 기운을 돌려줍니다." };
const MOON_TONE = { 불: "감정의 온도가 뜨거워집니다 — 열정과 성급함이 함께 옵니다.", 흙: "감정이 느리고 안정적입니다 — 천천히 굳게 움직입니다.", 바람: "생각과 대화가 많아집니다 — 머리로 먼저 움직이는 감정입니다.", 물: "감정이 깊어집니다 — 공감과 그리움이 커집니다." };
const toneWord = sg => SS_DAY[sg][0];
// 타로는 진짜 카드처럼 뽑을 때마다 새로 섞는다(crypto 난수). 메뉴를 열거나 다시 뽑기·조건(날짜·사람)이 바뀔 때만 새로 뽑고,
// 그 사이 화면을 다시 그릴 때(탭 이동 등)는 같은 패를 유지 — holder.tarot = { key, pick }
// 뽑기 함수는 tarot.js drawTarotCards (전역 이름 drawTarot은 타로 탭 버튼 것 — 같은 이름을 다시 정의하면 덮어써 타로 탭이 깨진다)
function tarotSpread(holder, key, n) { if (!holder.tarot || holder.tarot.key !== key) holder.tarot = { key, pick: drawTarotCards(n) }; return holder.tarot.pick; }

function renderConsult() {
  initConsult();
  const who = ST.consult.who, p = who === "m" ? ST.p1 : ST.p2, isMale = who === "m";
  const t = consultDate(); // 선택한 날짜(기본 오늘)
  const pd = personDay(p, t);
  const chip = (k, label) => `<button onclick="setConsultWho('${k}')" style="${who === k ? "border-color:var(--gold);color:var(--gold2);font-weight:700" : ""}">${label}</button>`;
  const todayN = ymdOf(today()), isToday = ST.consult.date === todayN;
  const chipD = n => { const on = ST.consult.date === ymdOf(addDays(today(), n)); return `<button style="font-size:12px;padding:3px 8px;${on ? "border-color:var(--gold);color:var(--gold2);font-weight:700" : ""}" onclick="setConsultDate(${n})">${n === 0 ? "오늘" : n > 0 ? n + "일 후" : (-n) + "일 전"}</button>`; };
  const head = `<div class="card gold"><div class="sec-t">운세 상담<span style="flex:1"></span><button onclick="closeConsult()" style="font-size:12px;padding:4px 10px">상담 종료</button></div>
    <div class="daily-head" style="margin:0 0 8px"><button onclick="shiftConsultDate(-1)" title="하루 전">◀</button>
      <div class="today-ilju" style="font-size:18px">${fmtYMD(ST.consult.date)}</div>
      <button onclick="shiftConsultDate(1)" title="하루 후">▶</button>
      ${isToday ? "" : `<button onclick="goConsultToday()" style="font-size:12px;padding:4px 10px">오늘로</button>`}</div>
    <div class="reason" style="border-left-color:var(--gold)"><b>${esc(josa(p.name, "과", "와"))}</b> 운세 상담이 시작되었어요 — 날짜를 고르고 아래 메뉴를 누르면 <b>그 날의 운세</b>가 펼쳐집니다. <div class="rx">모든 운세는 ${esc(p.name)}의 사주(일주 ${p.dmHanja})와 선택 날짜(${fmtYMD(ST.consult.date)})의 간지·트랜짓으로 계산합니다.</div></div>
    <div class="chips" style="margin-top:10px"><span style="color:var(--sub);font-size:12.5px;align-self:center">누구의 운세?</span> ${chip("m", `남자 · ${esc(ST.p1.name)}`)} ${chip("f", `여자 · ${esc(ST.p2.name)}`)}</div>
    <div class="chips" style="margin-top:8px">${[-7, -6, -5, -4, -3, -2, -1].map(chipD).join("")}${chipD(0)}${[1, 2, 3, 4, 5, 6, 7].map(chipD).join("")}</div></div>`;

  // 아코디언 — 열린 메뉴의 결과 카드를 그 메뉴 줄 바로 아래에 끼워 넣는다(맨 밑까지 내려갈 필요 없음)
  const menu = CONSULT_MENU.map(([k, ic, ti, de]) => {
    const open = ST.consult.open === k;
    const row = `<div class="menu-row ${open ? "on" : ""}" id="consultRow-${k}" onclick="openConsult('${k}')">
      <span class="mi">${ic}</span><span class="mt"><b>${ti}</b><small>${de}</small></span><span class="chev">${open ? "▲" : "▼"}</span></div>`;
    return row + (open ? `<div id="consultReading">${buildConsult(k, p, isMale, t, pd)}</div>` : "");
  }).join("");

  $("consultBody").innerHTML = head + `<div>${menu}</div>` + (ST.consult.open ? "" : `<div class="card" style="text-align:center;color:var(--sub);font-size:13px">메뉴를 누르면 <b>${fmtYMD(ST.consult.date)}</b> ${esc(p.name)}의 운세가 바로 아래 펼쳐집니다.</div>`);
  if (ST.consult.scrollAfter) { // 메뉴 클릭 직후 — 클릭한 줄이 화면 위에 오도록 부드럽게 스크롤(결과가 바로 밑에 보임)
    ST.consult.scrollAfter = false;
    const el = document.getElementById("consultRow-" + ST.consult.open);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }
}

function initConsult() {
  if (!ST.consult) ST.consult = { who: "m", open: null, tarot: null };
  if (!ST.consult.date) ST.consult.date = ymdOf(today());
}
function consultDate() { const c = ST.consult.date; return new Date(Math.floor(c / 10000), Math.floor(c / 100) % 100 - 1, c % 100, 12); }
function setConsultWho(k) { initConsult(); ST.consult.who = k; ST.consult.open = null; ST.consult.scrollAfter = false; renderConsult(); }
function openConsult(k) { initConsult(); ST.consult.open = ST.consult.open === k ? null : k; if (k === "tarot") ST.consult.tarot = null; if (k === "breakup" && ST.breakup) ST.breakup.tarot = null; ST.consult.scrollAfter = ST.consult.open !== null; renderConsult(); }
function closeConsult() { initConsult(); ST.consult.open = null; ST.consult.scrollAfter = false; renderConsult(); window.scrollTo({ top: 0, behavior: "smooth" }); }
function redrawConsultTarot() { initConsult(); ST.consult.tarot = null; ST.consult.scrollAfter = true; renderConsult(); }
// 이별·재회 — 입력 상태 관리
function setBrokeDate(v) { if (!ST.breakup) ST.breakup = { date: null, who: null, tarot: null };
  const m = (v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return;
  const n = +m[1] * 10000 + +m[2] * 100 + +m[3];
  if (n < 19000101 || n > ymdOf(today())) return;
  ST.breakup.date = n; renderConsult(); }
function setBreakupWho(k) { if (!ST.breakup) ST.breakup = { date: null, who: null, tarot: null }; ST.breakup.who = k; renderConsult(); }
function redrawBreakupTarot() { if (ST.breakup) ST.breakup.tarot = null; renderConsult(); }
// 날짜 선택 — 칩(오늘 기준 ±7일)과 하루 이동. lunar.js 안전 범위(1900~2100)로 clamp
function setConsultDate(n) { initConsult(); ST.consult.date = ymdOf(addDays(today(), n)); ST.consult.scrollAfter = ST.consult.open !== null; renderConsult(); }
function shiftConsultDate(dir) {
  initConsult();
  let y = Math.floor(ST.consult.date / 10000), m2 = Math.floor(ST.consult.date / 100) % 100, d2 = ST.consult.date % 100;
  const dt = new Date(y, m2 - 1, d2 + dir, 12);
  const n = ymdOf(dt);
  if (n < 19000101 || n > 21001231) return;
  ST.consult.date = n; ST.consult.scrollAfter = false; renderConsult();
}
function goConsultToday() { initConsult(); ST.consult.date = ymdOf(today()); ST.consult.scrollAfter = ST.consult.open !== null; renderConsult(); }

function buildConsult(key, p, isMale, t, pd) {
  const w = westOf(t), whoIdx = p === ST.p1 ? 1 : 2, Y = t.getFullYear(), m = t.getMonth() + 1;
  const advice = { peak: "기운이 가장 잘 열린 날입니다. 하고 싶었던 만남·말·시작을 이날 하세요.", good: "부드럽게 흐르는 날. 평소 하던 일을 조금 더 밀어붙여도 좋습니다.", normal: "무난한 날입니다. 특별한 기대 없이 리듬을 지키면 충분합니다.", care: "조금 조심스러운 날. 중요한 결정과 예민한 대화는 하루 미루는 것이 유리합니다.", bad: "긴장이 쉽게 생기는 날입니다. 쉬어가고 말을 아끼면 부딪힘을 피합니다." }[pd.grade.k];
  let title = "", rows = [];

  if (key === "all") {
    title = "종합 — 오늘 하루의 전반적인 운세";
    rows.push({ t: `${pd.dayGZ.hanja}일 · 내 일간에 ${pd.sg} / 지지에 ${pd.bg}`, s: SS_TONE[pd.sg] + Math.round(SS_TONE[pd.bg] / 2), x: SS_DAY[pd.sg][1] });
    if (REL_DAY[pd.rel]) rows.push({ t: "일지 관계", s: pd.rel === "육합" || pd.rel === "삼합" ? 5 : -4, x: REL_DAY[pd.rel] });
    rows.push({ t: `12운성 — ${pd.ws}`, s: 0, x: WS_DAY[pd.ws] });
    if (pd.inflow === 1) rows.push({ t: "기운 유입(인성)", s: 4, x: `그날의 ${pd.dayGZ.oh} 기운이 내 일간을 生 — 채워지고 보호받는 날` });
    if (pd.inflow === -1) rows.push({ t: "긴장 유입(관살)", s: -4, x: `그날의 ${pd.dayGZ.oh} 기운이 내 일간을 극 — 부담을 느끼기 쉬운 날` });
    pd.ss.forEach(x => rows.push({ t: x.name, s: x.name === "도화살" ? 4 : 3, x: x.desc }));
    if (pd.dayGZ.oh === p.yongsin) rows.push({ t: "용신일", s: 6, x: `가장 부족한 ${p.yongsin} 오행이 들어오는 날 — 균형이 맞아간다` });
    rows.push(...gradeRow(pd));
    return wrap(title, pd, rows, advice);
  }

  if (key === "mind") {
    title = "심리운세 — 마음과 감정의 흐름";
    rows.push({ t: `내면의 기조: ${pd.sg}`, s: SS_TONE[pd.sg], x: SS_DAY[pd.sg][2] });
    rows.push({ t: `겉으로 드러나는 태도: ${pd.bg}`, s: SS_TONE[pd.bg], x: `지지 본기까지 더하면 오늘의 나는 '${toneWord(pd.sg)}'${josa(toneWord(pd.sg), "과", "와").slice(-1)} '${toneWord(pd.bg)}'${josa(toneWord(pd.bg), "이", "가").slice(-1)} 섞인 상태` });
    if (w && w.moon) rows.push({ t: `달 ☾ ${w.moon.sign}(${w.moon.el})`, s: 0, x: MOON_TONE[w.moon.el] || "오늘의 달이 감정의 배경을 만듭니다." });
    if (pd.inflow === 1) rows.push({ t: "받는 기운", s: 4, x: "바깥에서 나를 生해주는 날 — 사람·상황이 나를 도와주는 쪽" });
    else if (pd.inflow === 2) rows.push({ t: "주는 기운", s: 0, x: "내 기운을 밖으로 생해주는 날 — 표현·소모가 먼저 오는 하루" });
    else if (pd.inflow === -1) rows.push({ t: "눌리는 기운", s: -4, x: "바깥이 나를 극 — 압박감을 느끼기 쉬우니 방어적으로 대응" });
    return wrap(title, pd, rows, "마음은 말보다 먼저 흔들립니다. 오늘의 기조('" + toneWord(pd.sg) + "')" + josa(toneWord(pd.sg), "을", "를").slice(-1) + " 알고 있으면 감정에 쓸리지 않고 선택할 수 있습니다.");
  }

  if (key === "love") {
    title = "애정운세 — 나의 사랑과 이성운";
    const loveOh = isMale ? p.jaeOh : p.gwanOh, hit = pd.dayGZ.oh === loveOh;
    if (hit) rows.push({ t: isMale ? "애정운(재성일)" : "애정운(관성일)", s: 8, x: `그날의 기운이 ${p.name}의 ${isMale ? "사랑(재성)" : "이끌림(관성)"} 오행(${loveOh})과 같음 — 표현하고 끌리는 힘이 살아나는 날` });
    else rows.push({ t: "애정 기운", s: 0, x: `내 애정 오행은 ${loveOh}인데 오늘은 ${pd.dayGZ.oh} — 애정보다 다른 일이 먼저 오는 날` });
    pd.ss.filter(x => x.name === "도화살").forEach(x => rows.push({ t: "도화살(✦)", s: 4, x: x.desc }));
    if (w) {
      const mv = w.aspects.filter(x => x.who === whoIdx && ["Venus", "Moon"].includes(x.t.key));
      mv.filter(x => x.a.s > 0).forEach(x => rows.push({ t: `금성·달 조화 (${x.t.ko} ✕ 내 ${x.n.ko})`, s: 3, x: "오늘의 행성이 내 애정·감정 행성과 조화 — 부드러운 끌림이 살아나는 날" }));
      mv.filter(x => x.a.s < 0).forEach(x => rows.push({ t: `금성·달 긴장 (${x.t.ko} ✕ 내 ${x.n.ko})`, s: -3, x: "애정 행성에 긴장각 — 서운함을 크게 느끼기 쉬우니 표현을 곱게" }));
    }
    const mL = monthlyLuck(p, isMale, Y, m);
    rows.push({ t: `이번 달(${m}월) 애정운`, s: 0, x: `★${mL.love} — ${mL.lTags.length ? mL.lTags.map(x => ({ "재성(이성)월": "이성 인연의 기운", "관성(이성)월": "이성 인연의 기운", "도화월": "매력이 살아나는 달", "천간합": "마음이 잘 맞는 달", "일지 육합": "가까운 사람과 잘 맞는 달", "일지 삼합": "힘이 합쳐지는 달", "일지 충": "감정 소모 조심 달" })[x] || x).join(" · ") : "특별한 애정 기운 없는 평범한 달"}` });
    return wrap(title, pd, rows, hit || pd.ss.some(x => x.name === "도화살") ? "오늘은 마음을 표현해도 잘 통하는 날입니다. 먼저 다가가 보세요." : "오늘은 애정보다 내 일에 집중하고, 감정 확인은 기운이 맞는 날에 하는 게 서로 편합니다.");
  }

  if (key === "romance") {
    title = "연애운세 — 우리 사랑의 오늘 상태";
    const cr = dailySync(ST.p1, ST.p2, t);
    rows.push({ t: `두 사람 속궁합 점수 ${cr.score}`, s: cr.score - 50, x: cr.grade.label + (cr.flags.danger ? " · ⚡ 최고 위험(일지 충+일간 극) 겹침" : cr.flags.herStrong ? " · ✿ 합궁(여자가 채워지는 날)" : "") });
    cr.reasons.slice(0, 4).forEach(x => rows.push({ t: x.t, s: x.s, x: x.x }));
    const wHap = !!(w && w.herStrong);
    if (wHap) rows.push({ t: "✿ 서양합궁", s: 5, x: "오늘의 달·금성이 여자 출생 차트를 조화각으로만 비춤 — 여자가 편안해지는 날" });
    // 위는 두 사람 공통(속궁합). 아래는 고른 사람(나) 쪽과 상대 쪽을 따로 — 예전엔 공통만 있어 남녀 결과가 글자까지 같았다
    const partner = isMale ? ST.p2 : ST.p1, pdP = personDay(partner, t);
    const side = (q, loveOh, me) => {
      const who = me ? "나" : "상대", out = [{ t: `${who}의 오늘 컨디션 — ${q.score}점 · ${q.grade.label}`, s: q.score - 50, x: `${me ? "내" : partner.name + "의"} 일간에 ${q.sg} / 지지에 ${q.bg} — ${SS_DAY[q.sg][1]}` }];
      if (q.dayGZ.oh === loveOh) out.push({ t: `${who} — 이성 기운일(${isMale === me ? "재성" : "관성"})`, s: 4, x: me ? "상대가 더 그립고 마음이 쏠리는 날 — 먼저 연락해도 자연스럽습니다." : "상대가 당신을 떠올리기 쉬운 날 — 연락에 반응이 좋습니다." });
      if (q.rel === "육합" || q.rel === "삼합") out.push({ t: `${who} — 일지 ${q.rel}`, s: 3, x: me ? "내 마음이 편안하게 열리는 날입니다." : "상대의 마음이 편안하게 열리는 날입니다." });
      else if (["충", "원진", "형"].includes(q.rel)) out.push({ t: `${who} — 일지 ${q.rel}`, s: -3, x: me ? "내가 예민해지기 쉬운 날 — 서운한 말이 먼저 나가지 않게." : "상대가 예민한 날 — 날 선 말은 흘려 듣고 먼저 감싸 주세요." });
      if (q.ss.some(x => x.name === "도화살")) out.push({ t: `${who} — 도화살`, s: 3, x: me ? "내 매력이 돋보이는 날입니다." : "상대의 매력이 살아나는 날 — 칭찬 한마디가 잘 통합니다." });
      return out;
    };
    rows.push(...side(pd, isMale ? p.jaeOh : p.gwanOh, true), ...side(pdP, isMale ? partner.gwanOh : partner.jaeOh, false));
    const calm = isMale ? "그녀가 편안해지는 날 — 오늘 만나면 관계가 한 단계 부드러워집니다." : "내 몸과 마음이 편안해지는 날 — 오늘은 마음을 조금 더 열어 보여도 좋습니다.";
    return wrap(title, cr, rows, cr.flags.danger ? "오늘은 예민한 이야기를 미루는 게 사랑을 지키는 길입니다. 말투를 세 배로 부드럽게." : cr.flags.herStrong || wHap ? calm : cr.grade.k === "peak" || cr.grade.k === "good" ? "두 사람 모두 기운이 열려 있습니다. 하고 싶었던 말을 오늘 꺼내세요." : "평소처럼 존중하는 것만으로 충분한 날입니다.");
  }

  if (key === "breakup") {
    title = "이별·재회 상담";
    const who = isMale ? "m" : "f"; // buildConsult 스코프 — isMale에서 파생
    // 상태 초기화 — 헤어진 날짜·청한 사람이 있으면 바로 분석
    if (!ST.breakup) ST.breakup = { date: null, who: null, tarot: null };
    const partner = who === "m" ? ST.p2 : ST.p1;
    const viewerWantOh = who === "m" ? ST.p1.jaeOh : ST.p2.gwanOh, partnerWantOh = who === "m" ? ST.p2.gwanOh : ST.p1.jaeOh;
    const ready = !!(ST.breakup.date && ST.breakup.who);
    const whoBtn = (k, label) => `<button onclick="setBreakupWho('${k}')" style="${ST.breakup.who === k ? "border-color:var(--gold);color:var(--gold2);font-weight:700" : ""}">${label}</button>`;
    const head2 = `<div class="reason" style="border-left-color:var(--gold)">두 사람의 사주와 그날 기운으로 <b>상대의 마음 · 인연의 잔여 강도 · 연락·재회가 맞는 날</b>을 계산합니다. 답은 규칙 기반 근사치이며 재미·참고용입니다.</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
        <label style="font-size:13px;color:var(--sub)">헤어진 날짜 <input type="date" onchange="setBrokeDate(this.value)" value="${ST.breakup.date ? ymdStr(ST.breakup.date) : ""}" style="margin-left:8px"></label>
        <div class="chips" style="margin:0"><span style="color:var(--sub);font-size:12.5px;align-self:center">누가 청했나요?</span> ${whoBtn("m", `남자가 청함`)} ${whoBtn("f", `여자가 청함`)} ${whoBtn("both", `상호 합의`)}</div>
        ${ST.breakup.date && !ST.breakup.who ? '<div style="color:var(--sub);font-size:12.5px">누가 청했는지 선택하면 분석이 시작됩니다.</div>' : ""}
      </div>`;
    if (!ready) return `<div class="card gold"><div class="sec-t">${title}</div>${head2}</div>`;

    // 분석 — engine.js breakupAnalysis (고정 인연 + 60일 추이 + 90일 재회 스캔)
    const A = breakupAnalysis(ST.p1, ST.p2, ST.breakup.date);
    const lvCls = { recover: "b-charge", time: "b-neutral", end: "b-tension" }[A.level.k];
    const brokeDate = new Date(Math.floor(ST.breakup.date / 10000), Math.floor(ST.breakup.date / 100) % 100 - 1, ST.breakup.date % 100, 12);
    // 🔮 신점 — 오방기 2깃발 (이별 분석 점수에 가중)
    // 🌠 점성술 — 헤어진 날의 하늘과 지금
    let astroHtml = "";
    if (window.Astronomy) {
      const skyList = [{ key: "Moon", ko: "달", mean: "감정" }, ...INVEST_PLANETS];
      const skyB = planetPositions(skyList, brokeDate), skyN = planetPositions(skyList, today());
      const natalPos = key => natalOf(partner).find(x => x.key === key) || natalFullOf(partner).find(x => x.key === key);
      const sigRow = sky => {
        const hits = [];
        for (const key of ["Saturn", "Pluto", "Moon", "Venus"]) {
          const tO = sky.find(x => x.key === key), nO = natalPos(key);
          if (!tO || !nO) continue;
          const a = findTAspect(tO.elon, nO.elon);
          if (a) hits.push({ tO, nO, a, dev: Math.abs(tDiff(tO, nO) - a.ang) });
        }
        hits.sort((x, y) => x.dev - y.dev);
        return hits.slice(0, 2).map(x => `${x.tO.ko} ${x.a.ko} — ${x.a.mean} (각도 ${x.dev.toFixed(1)}°)`);
      };
      const posStr = sky => sky.map(x => `${x.ko} ${x.sign}`).join(" · ");
      const bSig = sigRow(skyB), nSig = sigRow(skyN);
      astroHtml = `<div class="sec-t">🌠 점성술 — 헤어진 날의 하늘과 지금</div>
        <div class="reason"><b>${fmtYMD(ST.breakup.date)} 하늘</b> — ${posStr(skyB)}<div class="rx">${bSig.length ? esc(bSig.join(" / ")) : "뚜렷한 각 없음"}</div></div>
        <div class="reason"><b>지금 하늘</b> — ${posStr(skyN)}<div class="rx">${nSig.length ? esc(nSig.join(" / ")) : "뚜렷한 각 없음"}</div></div>`;
    }
    // 타로 5장 — 이별 스프레드 (메뉴 열 때·다시 뽑기·조건 변경 시 새로 섞음)
    const pick = tarotSpread(ST.breakup, `${ST.breakup.date}-${ST.p1.name}-${ST.p2.name}-${ST.breakup.who}-${who}`, 5);
    const BPOS = ["그동안의 관계", "헤어진 뒤 상대의 마음", "상대가 남긴 연결고리", "앞으로의 상대 마음", "이 관계의 미래"];
    const cards = pick.map(c2 => { const t2 = TAROT[c2.i]; return { t: t2, rev: c2.rev, tone: c2.rev ? t2[7] : t2[6], text: c2.rev ? t2[5] : t2[4] }; });
    const cardHtml = cards.map((c, k) => `<div class="part"><div class="pt"><span>${BPOS[k]} <span class="pv">${c.t[0]}. ${c.t[1]} · ${c.rev ? "역방향" : "정방향"}</span></span><span class="ps" style="color:${c.tone > 0 ? "var(--good)" : c.tone < 0 ? "var(--bad)" : "var(--sub)"}">${c.tone > 0 ? "긍정" : c.tone < 0 ? "주의" : "복합"}</span></div><div class="px" style="font-size:20px;text-align:center;margin:4px 0;${c.rev ? "transform:rotate(180deg)" : ""}">${c.t[3]}</div><div class="px">${esc(c.text)}</div></div>`).join("");
    const tSum = cards.reduce((s, c) => s + c.tone, 0) + cards[1].tone;
    const tVerdict = tSum >= 4 ? "카드는 아직 마음이 완전히 식지 않았다고 봅니다. 연결고리를 끊지 말고 천천히." : tSum >= 1 ? "마음은 복잡하지만 문이 닫힌 상태는 아닙니다. 서두르지 않고 신호를 보세요." : tSum >= -2 ? "정리 중인 마음입니다. 지금은 부재중 신호 — 기다림과 자기 회복이 병행되어야 합니다." : "카드도 마음이 멀어졌다고 봅니다. 붙잡기보다 스스로를 돌보는 시간이 필요합니다.";
    // 사주로 보는 상대의 마음 — 그리움 기운(상대의 관성·재성일)을 지난 7일과 앞 7일로 나눠 센다.
    // 7일 연속 일간에는 오행 5개 중 하나가 아예 안 들어올 수 있으므로 0일은 정상값이다.
    // (표기 버그 수정: 예전엔 "최근 7일"이라 쓰고 미래 7일을 세고 있었다)
    let pMiss = 0, pMissNext = 0, vMiss = 0, vMissNext = 0;
    for (let i = 0; i < 7; i++) {
      const dPast = getDayGZ(addDays(today(), -i)), dNext = getDayGZ(addDays(today(), i + 1));
      if (dPast.oh === partnerWantOh) pMiss++;
      if (dNext.oh === partnerWantOh) pMissNext++;
      if (dPast.oh === viewerWantOh) vMiss++;
      if (dNext.oh === viewerWantOh) vMissNext++;
    }
    const lvAdvice = {
      recover: "연결고리가 살아 있습니다. 긴 대화보다 짧고 따뜻한 연락부터 — 아래 '기운이 맞는 날'을 골라 보세요.",
      time: "서로의 기운이 정리 중입니다. 연락은 미루고, 아래 기운이 맞는 날에 딱 한 번, 짧고 진솔하게.",
      end: "계산상 연결고리가 약한 상태입니다. 붙잡기보다 자기 회복의 시간으로 쓰는 것이 서로를 위한 길입니다."
    }[A.level.k];
    const whoNote = { m: "남자가 청한 이별 — 상대는 상처받은 상태라 사과·안정이 먼저이고, 재연락은 짧고 진솔하게.", f: "여자가 청한 이별 — 상대의 결정을 존중하는 태도가 다시 문을 여는 열쇠입니다.", both: "상호 합의 이별 — 서로에게 시간이 필요한 시기라 무리한 재접촉보다 기다림이 맞습니다." }[ST.breakup.who];
    return `<div class="card gold"><div class="sec-t">${title}</div>${head2}
      <div class="gauge-wrap" style="margin-top:10px">${gaugeSVG(A.final, A.level.label)}
        <div class="gauge-label"><span class="badge ${lvCls}">💔 ${esc(A.level.label)}</span>
          <table class="mini-tbl" style="margin-top:10px">
            <tr><td>고정 인연 점수</td><td>${A.c.score} (${A.c.grade}) — 천간합·지지 합충 기준</td></tr>
            <tr><td>헤어진 뒤 기운 추이</td><td>재결합 기운 ${A.bond}일 vs 이별 기운 ${A.sep}일 (최근 60일)</td></tr>
            <tr><td>앞 90일 재회 신호</td><td>기운이 맞는 날 ${A.recoveryDays}일 / 90일</td></tr>
            <tr><td>이별 후 경과</td><td>${A.daysSince}일</td></tr>
          </table></div></div>
      <div class="sec-t">상대의 현재 마음 — 타로 5장 <small><button onclick="redrawBreakupTarot()" style="font-size:12px;padding:3px 8px">🔄 다시 뽑기</button></small></div>${cardHtml}
      <div class="reason"><b>타로 종합</b> — ${esc(tVerdict)}</div>
      <div class="sec-t">사주로 보는 상대의 마음</div>
      <div class="reason"><span class="rt">상대(${esc(partner.name)})의 그리움 — ${partnerWantOh} 기운</span><div class="rx">지난 7일 중 <b>${pMiss}일</b> · 앞 7일 중 <b>${pMissNext}일</b>. 그날의 기조는 '${toneWord(personDay(partner, today()).sg)}' 상태입니다. (일주일에 오행 하나가 아예 안 들어올 수 있어 0일도 정상입니다)</div></div>
      <div class="reason"><span class="rt">나의 그리움 — ${viewerWantOh} 기운</span><div class="rx">지난 7일 중 <b>${vMiss}일</b> · 앞 7일 중 <b>${vMissNext}일</b>. 내 쪽 그리움 기운이 먼저 오면, 먼저 짧게 연락하기 좋은 타이밍입니다.</div></div>
      ${astroHtml}
      <div class="sec-t">연락·재회 유리한 날 — 앞 90일 TOP 5</div>
      ${A.top.length ? A.top.map(x2 => `<div class="reason"><span class="rt">${fmtYMD(x2.date)} <span class="rs" style="color:var(--good)">+${x2.score}</span></span><div class="rx">${esc(x2.why.map(y2 => y2.t).join(" · "))}</div></div>`).join("") : '<div class="reason">앞 90일 안에 뚜렷한 재회 신호일이 없습니다 — 무리한 접촉보다 기다림이 유리합니다.</div>'}
      <div class="sec-t">월별 재회 기운</div><div class="reason"><div class="rx">${A.months.length ? `남자의 재성운과 여자의 관성운이 동시에 드는 달: <b style="color:var(--gold2)">${A.months.join(" · ")}</b> — 연락·재회를 시도하기 좋은 달입니다.` : "향후 12개월 중 두 기운이 겹치는 달은 없습니다."}</div></div>
      <div class="sec-t">조언</div><div class="reason">${esc(lvAdvice)} ${esc(whoNote)}</div>
      <div style="font-size:12px;color:var(--sub);margin-top:8px">⚠️ 사주·타로 규칙 기반의 재미용 참고이며 미래를 보장하지 않습니다. 상대의 마음은 대화로 확인하세요.</div></div>`;
  }

  if (key === "newlove") {
    title = "새 인연 시기 — 이성 인연이 열리는 때";
    const wantOh = isMale ? p.jaeOh : p.gwanOh; // 이성 오행 — 남자=재성, 여자=관성
    const ssn = isMale ? "재성(여자 인연)" : "관성(남자 인연)";
    const loveSS = isMale ? ["정재", "편재"] : ["정관", "편관"];
    const rows = [];
    // 세운 — 올해·내년 년간이 이성 기운인지
    for (const [yy, lbl] of [[t.getFullYear(), "올해"], [t.getFullYear() + 1, "내년"]]) {
      const yg = getYearGZ(yy), ss = shiShen(p.dmGan, yg.gan);
      const isLoveYear = loveSS.includes(ss);
      rows.push({ t: `${lbl} ${yg.hanja}년 — 천간 ${ss}`, s: isLoveYear ? 6 : 0, x: isLoveYear ? `${ssn}의 기운이 1년 내내 깔리는 해 — 인연이 열리기 쉬운 큰 흐름` : `${ss}의 해 — 이성보다 다른 일이 앞서는 흐름` });
      // 배우자궁(일지) — 같은 해라도 사람마다 달라지는 부분
      const yr = zaRel(JI_K[p.dmJi], JI_K[yg.ji]);
      const yrS = yr === "육합" ? 4 : yr === "삼합" ? 3 : yr === "충" ? -3 : ["형", "원진"].includes(yr) ? -2 : 0;
      rows.push({ t: `${lbl} 배우자궁 — ${yg.hanja.slice(1)}(년지)와 내 일지 ${p.dmHanja.slice(1)}${yr ? " " + yr : ""}`, s: yrS, x: yr === "육합" ? "배우자 자리가 그해와 하나로 묶임 — 마음 맞는 상대와 인연이 맺어지기 쉬운 해" : yr === "삼합" ? "배우자 자리에 힘이 모임 — 주변 소개·모임으로 인연이 이어지기 쉬운 해" : yr === "충" ? "배우자 자리가 흔들림 — 만남·이별의 변동이 크니 서두르지 말 것" : yr ? `배우자 자리와 ${yr} — 오해와 서운함을 조심할 해` : "배우자 자리와 특별한 관계 없음 — 큰 흐름(천간)을 따름" });
    }
    // 월별 12개월 — 이성월·도화월·애정 ★
    const months = [];
    for (let i = 0; i < 12; i++) {
      const dt = new Date(t.getFullYear(), t.getMonth() + i, 15, 12);
      const L = monthlyLuck(p, isMale, dt.getFullYear(), dt.getMonth() + 1);
      months.push({ y: dt.getFullYear(), m: dt.getMonth() + 1, L, isJae: L.lTags.some(x => x.includes("이성")), isDowhwa: L.lTags.includes("도화월"), spouse: L.lTags.filter(x => /일지|천간합/.test(x)) });
    }
    const loveScore = m2 => m2.L.lRaw * 10 + m2.L.love; // 원점수 우선 — ★가 같아도 근거 많은 달이 앞
    const best = [...months].sort((a, b) => loveScore(b) - loveScore(a)).slice(0, 3);
    // 90일 일별 스캔 — 이성 기운일(정재·정관=진지한 인연 / 편재·편관=새로운 만남) + 도화 + 천을귀인
    const days = [];
    for (let i = 0; i < 90; i++) {
      const dt = addDays(t, i), pd2 = personDay(p, dt);
      const isJaeDay = pd2.dayGZ.oh === wantOh;
      const dow = pd2.ss.find(x => x.name === "도화살"), gui = pd2.ss.find(x => x.name === "천을귀인");
      const sp = pd2.rel === "육합";
      if (!isJaeDay && !dow && !gui && !sp) continue;
      const kind = [];
      if (isJaeDay) kind.push(shiShen(p.dmGan, pd2.dayGZ.gan) === (isMale ? "정재" : "정관") ? "진지한 인연의 기운" : "새로운 만남의 기운");
      if (dow) kind.push("매력 상승(도화)");
      if (gui) kind.push("귀인의 소개");
      if (sp) kind.push("배우자궁 육합(마음이 열림)");
      days.push({ date: pd2.date, score: pd2.score + (isJaeDay ? 6 : 0) + (dow ? 4 : 0) + (gui ? 3 : 0), kind: kind.join(" + ") });
    }
    days.sort((a, b) => b.score - a.score);
    const top = days.slice(0, 10);
    const byMonth = {};
    days.forEach(x2 => { const k2 = String(Math.floor(x2.date / 100)); byMonth[k2] = (byMonth[k2] || 0) + 1; });
    const byMonthStr = Object.entries(byMonth).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k2, v]) => String(k2).slice(4) + "월 " + v + "일").join(" · ");
    const advice = `가장 강한 시기는 ${best.map(m2 => m2.y + "-" + String(m2.m).padStart(2, "0") + "월").join(" · ")} — 이 시기 앞뒤로 소개·모임에 응하는 것이 유리합니다. 귀인의 소개가 뜨는 날(천을귀인)에는 지인의 소개를, 도화가 뜨는 날에는 외출과 자기 표현이 인연의 문을 엽니다.`;
    return `<div class="card gold"><div class="sec-t">${title} <small>${esc(p.name)} · ${fmtYMD(t)}부터 90일</small></div>
      <div class="reason"><span class="rt">이성 기운의 열쇠 — ${wantOh} 오행</span><div class="rx">${isMale ? "남자에게 여자는 재성" : "여자에게 남자는 관성"} — ${wantOh} 기운이 해(년)·달·날에 들어올 때 인연이 열립니다. (${esc(p.name)}의 일주 ${p.dmHanja})</div></div>
      ${(() => { const q = isMale ? ST.p2 : ST.p1, qOh = isMale ? q.gwanOh : q.jaeOh; return qOh === wantOh ? `<div class="reason"><span class="rt">💞 ${esc(q.name)}도 같은 ${wantOh} 오행이 열쇠</span><div class="rx">두 사람이 서로에게 이성 기운(${isMale ? "남자의 재성 = 여자의 관성" : "여자의 관성 = 남자의 재성"})이라 해·달의 큰 흐름은 비슷하게 나옵니다. 사람마다 다른 부분은 <b>배우자궁(일지 ${p.dmHanja.slice(1)})</b>의 합·충, 도화, 천을귀인입니다.</div></div>` : ""; })()}
      ${rows.map(x => scoreRow(x)).join("")}
      <div class="sec-t">월별 이성 기운 — 12개월</div>
      ${months.map(m2 => `<div class="reason"><span class="rt">${m2.y}-${String(m2.m).padStart(2, "0")}월 <span class="rs" style="color:var(--gold2)">애정 ★${m2.L.love}</span></span><div class="rx">${m2.isJae ? "<b>🌸 이성 인연의 달</b> · " : ""}${m2.isDowhwa ? "<b>도화월(매력)</b> · " : ""}${m2.spouse.map(x => `<b>${{ "일지 육합": "배우자궁 육합", "일지 삼합": "배우자궁 삼합", "천간합": "일간 천간합(끌림)", "일지 충": "배우자궁 충(변동)" }[x] || x}</b> · `).join("")}애정 기운 ${m2.L.love >= 4 ? "좋음" : m2.L.love >= 3 ? "무난" : "차분"}</div></div>`).join("")}
      <div class="sec-t">🌸 새 만남에 유리한 날 — TOP 10</div>
      ${top.map(x2 => `<div class="reason"><span class="rt">${fmtYMD(x2.date)} <span class="rs" style="color:var(--good)">+${x2.score}</span></span><div class="rx">${esc(x2.kind)}</div></div>`).join("") || '<div class="reason">뚜렷한 신호일 없음 — 기운이 고르게 분포합니다.</div>'}
      <div class="reason"><b>기운이 몰리는 달</b> — ${byMonthStr || "고르게 분포"}</div>
      <div class="sec-t">조언</div><div class="reason">${esc(advice)}</div>
      <div style="font-size:12px;color:var(--sub);margin-top:8px">⚠️ 사주 규칙 기반의 재미용 참고이며 인연을 보장하지 않습니다. 좋은 인연은 준비된 자에게 옵니다.</div></div>`;
  }

  if (key === "tarot") {
    title = "타로운세 — 오늘의 카드 3장";
    if (typeof TAROT === "undefined") return `<div class="card"><div class="sec-t">${title}</div><div class="reason">타로 데이터(tarot.js)를 불러오지 못했습니다.</div></div>`;
    const pick = tarotSpread(ST.consult, `${pd.date}-${p.name}`, 3);
    const cards = pick.map(c => { const t2 = TAROT[c.i]; return { t: t2, rev: c.rev, tone: c.rev ? t2[7] : t2[6], text: c.rev ? t2[5] : t2[4] }; });
    const POS = ["과거 — 그동안의 흐름", "현재 — 지금의 상태", "미래 — 앞으로의 방향"];
    const sum = cards.reduce((s, c) => s + c.tone, 0) + cards[1].tone;
    const verdict = sum >= 3 ? "흐름이 분명히 좋습니다. 원하는 방향으로 과감히 가도 됩니다."
      : sum >= 1 ? "호조건이지만 한 군데 조심스러운 부분이 있습니다. 서두르지 마세요."
      : sum >= -1 ? "복잡하게 얽힌 하루입니다. 한 걸음 물러나 확인하고 움직이세요."
      : "지치기 쉬운 하루입니다. 결정과 다툼은 피하고 쉬어 가세요.";
    const cardHtml = cards.map((c, k) => `<div class="part"><div class="pt"><span>${POS[k]} <span class="pv">${c.t[0]}. ${c.t[1]} · ${c.rev ? "역방향" : "정방향"}</span></span><span class="ps" style="color:${c.tone > 0 ? "var(--good)" : c.tone < 0 ? "var(--bad)" : "var(--sub)"}">${c.tone > 0 ? "긍정" : c.tone < 0 ? "주의" : "복합"}</span></div><div class="px" style="font-size:22px;text-align:center;margin:6px 0;${c.rev ? "transform:rotate(180deg)" : ""}">${c.t[3]}</div><div class="px">${esc(c.text)}</div></div>`).join("");
    return `<div class="card gold"><div class="sec-t">${title} <small>${esc(p.name)} · ${String(pd.date).slice(4, 6)}/${String(pd.date).slice(6)} · 결과는 하루 동안 같게 유지</small></div>${cardHtml}
      <div class="reason"><b>종합</b> — ${esc(verdict)}</div>
      <div style="margin-top:10px;text-align:center"><button onclick="redrawConsultTarot()">🔄 다시 뽑기</button></div>
      <div style="font-size:12px;color:var(--sub);margin-top:8px">재미용 점입니다. 메뉴를 열 때마다, 다시 뽑기를 누를 때마다 카드를 새로 섞습니다.</div></div>`;
  }

  if (key === "wealth") {
    title = "재물운세 — 돈의 흐름";
    const L = lottoOf(p, whoIdx, t, w);
    rows.push({ t: `오늘 재물 원점수 ${pd.wealth.raw}점`, s: pd.wealth.raw, x: pd.wealth.tags.length ? "근거: " + pd.wealth.tags.join(" · ") : "재성·식신·용신 기운 없는 평범한 하루" });
    if (w) { const wm = westMoney(w, whoIdx); if (wm) rows.push({ t: "서양 재물 기운", s: Math.round(wm), x: `금성(돈·즐거움)·태양·달이 내 출생 차트에 만드는 각의 합 (${wm > 0 ? "조화가 우세" : "긴장이 우세"})` }); }
    const mL = monthlyLuck(p, isMale, Y, m);
    rows.push({ t: `이번 달(${m}월) 재물운 ★${mL.wealth}`, s: 0, x: mL.wTags.length ? mL.wTags.map(x2 => ({ "재성월": "재물 기운이 들어옴", "식신생재": "일한 만큼 돈이 따라옴", "겁재(지출)": "지출·경쟁이 늘어남", "용신월": "부족한 기운이 채워짐", "일지 충": "변동이 생기기 쉬움", "일지 육합": "주변의 도움", "일지 삼합": "힘을 합침" })[x2] || x2).join(" · ") : "평범한 재물의 달" });
    rows.push({ t: "🍀 로또 판정", s: 0, x: `합산 ${L.score}점 — ${L.ok ? "로또 사기 좋은 날(사주 재물≥2 · 서양 재물>0 · 합산≥20)" : "오늘은 아님"} (재미용 — 추첨은 무작위)` });
    return wrap(title, pd, rows, pd.wealth.raw >= 2 ? "돈의 흐름이 열려 있는 날. 계약·구매·정산처럼 '돈이 오가는 일'에 유리합니다." : pd.wealth.raw < 0 ? "지출이 늘기 쉬운 날. 큰 결제와 투자는 하루 미루세요." : "평범한 재물의 날. 무리한 베팅보다 착실한 소비 관리가 이득입니다.");
  }

  if (key === "stock") {
    title = "주식운세 — 투자·매매 컨디션";
    const dw = dayWealth(p, t);
    let iv = null;
    try { iv = investSync(p, t); } catch (e) { rows.push({ t: "천문 계산 불가", s: 0, x: "astronomy.js 로드 실패 — 사주 재물 기운만 반영합니다" }); }
    // 사주 쪽 — 재성 성향과 손실 경계
    rows.push({ t: `오늘 재물 기운 ${dw.raw}점`, s: dw.raw, x: dw.tags.length ? "근거: " + dw.tags.join(" · ") : "특별한 재물 기운 없는 평범한 하루" });
    if (pd.sg === "편재") rows.push({ t: "투자 성향 — 편재(단타·변동성)", s: 2, x: "기회를 빠르게 잡는 기운. 변동성 매매엔 유리하지만 욕심은 두 배로 커진다" });
    else if (pd.sg === "정재") rows.push({ t: "투자 성향 — 정재(안정·장기)", s: 2, x: "차분한 계산이 살아나는 날. 배당·적립식·장유물(장기 보유) 관점에 유리" });
    else if (pd.sg === "겁재") rows.push({ t: "겁재(손실 경계)", s: -3, x: "투기 심리와 경쟁이 커지는 날 — 추격 매수·레버리지·남들이 사는 것 따라 사기 금지" });
    if (pd.rel === "충") rows.push({ t: "일지 충(변동성)", s: -2, x: "시장·내 자리가 흔들리는 날 — 호가 실수·타이밍 놓침 조심" });
    if (pd.dayGZ.oh === p.yongsin) rows.push({ t: "용신일(판단력 회복)", s: 3, x: "부족한 기운이 채워져 냉정한 판단이 가능한 날" });
    // 서양 쪽 — 투자 행성 트랜짓
    if (iv) {
      iv.harm.forEach(x => rows.push({ t: `${x.t.ko} 조화 (${x.a.ko} · 내 ${x.n.ko})`, s: Math.round(x.c * 10) / 10, x: `${x.t.mean} 행성이 내 ${josa(x.n.ko, "과", "와")} 조화 — ${x.t.mean} 기운이 나를 돕는 날` }));
      iv.tense.forEach(x => rows.push({ t: `${x.t.ko} 긴장 (${x.a.ko} · 내 ${x.n.ko})`, s: Math.round(x.c * 10) / 10, x: `${x.t.mean} 행성에 긴장각 — ${x.t.mean} 쪽에 변수가 끼어들기 쉬운 날` }));
    }
    // 판정 — 사주 재물×3 + 투자 행성 합산 (임계값은 1년 분포 시뮬레이션으로 보정: 적극 ~14%)
    const total = Math.round(dw.raw * 3 + (iv ? iv.west : 0));
    const verdict = total >= 16 ? ["적극 매매 유리", "b-charge", "기운이 가장 잘 맞는 날. 계획한 매매라면 움직여도 좋습니다."]
      : total >= 8 ? ["분할 접근 유리", "b-flow", "방향은 맞지만 확신은 중간. 한 번에 다 넣지 말고 나눠 접근하세요."]
      : total >= 0 ? ["관망", "b-neutral", "특별한 신호 없는 날. 관찰하고 기회를 기다리는 게 이득입니다."]
      : total >= -6 ? ["추격·레버리지 조심", "b-tension", "실수가 늘어나는 기운. 포지션을 줄이고 손절 원칙을 지키세요."]
      : ["현금 지키기", "b-tension", "손실 기운이 우세한 날. 새 진입은 피하고 현금을 지키는 것이 최선."];
    // 상품별 컨디션 — 현물 주식(정재·안정 기운)과 파생·선물·레버리지(편재·변동 기운)는 성격이 다르다
    // 명리: 정재=안정 재물 / 편재=변동·투기 재물. 점성: 금성=돈, 토성=제한·손실, 명왕성=레버리지·대량 자금
    const venusHarm = iv ? iv.harm.filter(x => x.t.key === "Venus").reduce((s, x) => s + x.c, 0) : 0;
    const saturnTense = iv ? iv.tense.filter(x => x.t.key === "Saturn").reduce((s, x) => s + x.c, 0) : 0; // 음수(감점)
    const plutoHarm = iv ? iv.harm.filter(x => x.t.key === "Pluto").reduce((s, x) => s + x.c, 0) : 0;
    const spot = Math.round((dw.raw + (pd.sg === "정재" ? 2 : pd.sg === "편재" ? -2 : 0) + venusHarm + saturnTense * 1.5) * 10) / 10;
    const spotLv = spot >= 3 ? ["유리", "b-charge"] : spot >= 0 ? ["보통", "b-neutral"] : spot >= -3 ? ["조심", "b-tension"] : ["위험", "b-tension"];
    const deriv = Math.round(((pd.sg === "편재" ? 2 : pd.sg === "정재" ? -2 : 0) + plutoHarm + (pd.rel === "충" ? 1 : 0) + saturnTense) * 10) / 10;
    const derivLv = deriv >= 4 ? ["유리 (고변동)", "b-charge"] : deriv >= 1 ? ["기회 (고변동 주의)", "b-flow"] : deriv >= -2 ? ["보통", "b-neutral"] : ["조심", "b-tension"];
    const instNote = deriv > spot ? "변동성을 직접 다루는 파생·선물·레버리지 쪽 기운이 현물보다 강한 날입니다." : spot > deriv ? "안정적인 현물 주식 쪽 기운이 파생보다 강한 날입니다." : "현물과 파생의 기운 차이가 크지 않은 날입니다.";
    return `<div class="card gold"><div class="sec-t">${title} <small>${esc(p.name)} · ${fmtYMD(t)} · 판정 ${total}점</small></div>
      <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span class="badge ${verdict[1]}">${verdict[0]}</span>
        <span class="badge ${spotLv[1]}" title="정재·안정 기운 기준">🏢 현물 주식 — ${spotLv[0]}</span>
        <span class="badge ${derivLv[1]}" title="편재·변동 기운 기준">🌊 파생·선물·레버리지 — ${derivLv[0]}</span></div>
      ${rows.map(x => scoreRow(x)).join("")}
      <div class="sec-t">조언</div><div class="reason">${esc(verdict[2])} ${esc(instNote)}</div>
      <div style="font-size:12px;color:var(--sub);margin-top:8px">⚠️ 사주·점성술 기반의 재미용 참고이며 <b>투자 판단이나 매매 권유가 아닙니다</b>. 실제 투자 결정과 책임은 본인에게 있습니다. 실시간 주가·종목 데이터는 반영되지 않습니다.</div></div>`;
  }

  if (key === "health") {
    title = "건강운세 — 몸과 마음";
    let s = 0;
    if (pd.inflow === -1) { s -= 3; rows.push({ t: "스트레스 유입(관살)", s: -3, x: `그날의 ${pd.dayGZ.oh} 기운이 내 일간을 극 — 긴장이 몸에 먼저 쌓이는 날` }); }
    if (["충", "형"].includes(pd.rel)) { s -= 3; rows.push({ t: `일지 ${pd.rel}`, s: -3, x: "몸의 땅(일지)이 흔들리는 날 — 무리한 일정·과격한 활동 조심" }); }
    if (["절", "사", "병"].includes(pd.ws)) { s -= 2; rows.push({ t: `12운성 ${pd.ws}`, s: -2, x: "기운이 쉬어야 하는 국면 — 오늘은 회복의 날로 쓰는 게 이롭다" }); }
    if (["장생", "제왕"].includes(pd.ws)) { s += 2; rows.push({ t: `12운성 ${pd.ws}`, s: 2, x: "활력이 넘치는 날 — 다만 과확장·과운동은 오히려 피로" }); }
    if (pd.dayGZ.oh === p.yongsin) { s += 3; rows.push({ t: "용신일", s: 3, x: `부족한 ${p.yongsin} 오행이 채워져 컨디션이 돌아오는 날` }); }
    if (w) { const mh = w.aspects.filter(x => x.who === whoIdx && x.t.key === "Mars" && x.a.s < 0); if (mh.length) { s -= 2; rows.push({ t: "화성 긴장각", s: -2, x: "행동·에너지 행성에 긴장 — 사고·과열 조심, 운동 강도는 낮추기" }); } }
    rows.push({ t: "오행 보충 팁", s: 0, x: OH_TIP[p.yongsin] });
    return wrap(title, pd, rows, s < 0 ? "오늘은 몸이 먼저 말을 걸어 오는 날입니다. 일정을 하나 덜어내고 일찍 쉬세요." : s > 0 ? "컨디션이 좋은 날입니다. 밀린 운동과 일을 처리하기 좋습니다." : "평범한 컨디션입니다. 평소 루틴을 지키는 것만으로 충분합니다.");
  }

  if (key === "job") {
    title = "직업운세 — 일과 평가의 기운";
    if (["정관", "편관"].includes(pd.sg)) rows.push({ t: `평가의 날(${pd.sg})`, s: pd.sg === "정관" ? 3 : -2, x: pd.sg === "정관" ? "인정·평가가 따르는 날 — 보고·면담·지원에 유리" : "압박과 책임이 큰 날 — 중요한 결정은 서류로 남기고 서두르지 않기" });
    if (["정인", "편인"].includes(pd.sg)) rows.push({ t: `문서·학습의 날(${pd.sg})`, s: 2, x: "정보·문서·계획이 잘 들어오는 날 — 공부·검토·글쓰기에 유리" });
    if (["정재", "편재"].includes(pd.sg)) rows.push({ t: `실적의 날(${pd.sg})`, s: 2, x: "협상·거래·영업처럼 결과가 숫자로 남는 일에 좋은 날" });
    if (["식신", "상관"].includes(pd.sg)) rows.push({ t: `표현·생산의 날(${pd.sg})`, s: pd.sg === "식신" ? 2 : 0, x: "발표·제작·아이디어가 잘 나오는 날. 상관일은 말을 매끈하게 다듬기" });
    pd.ss.filter(x => x.name === "역마살").forEach(x => rows.push({ t: "역마살", s: 2, x: "이동·출장·외근에 좋은 날 — 움직이며 일이 풀린다" }));
    pd.ss.filter(x => x.name === "천을귀인").forEach(x => rows.push({ t: "천을귀인", s: 3, x: "윗사람·귀인의 도움이 따르는 날 — 부탁·협조를 청해도 잘 들어진다" }));
    if (pd.rel === "충") rows.push({ t: "일지 충", s: -3, x: "현장·자리가 흔들리는 날 — 이동·변경은 두 번 확인" });
    if (w) { const js = w.aspects.filter(x => x.who === whoIdx && x.t.key === "Sun"); js.filter(x => x.a.s > 0).forEach(x => rows.push({ t: "태양 조화", s: 2, x: "오늘의 태양이 내 차트와 조화 — 인정·활력이 따르는 날" })); }
    return wrap(title, pd, rows, rows.some(x => x.s >= 2) ? "일의 기운이 살아 있는 날입니다. 밀린 중요 일을 오늘 배치하세요." : "특별한 직업 기운 없는 날입니다. 루틴을 지키며 준비하는 게 이득입니다.");
  }

  if (key === "week") {
    title = "週 운세 — 선택 날짜 중심 앞뒤 3일";
    const todayN = ymdOf(today());
    const rows7 = [];
    let best = null;
    for (let i = -3; i <= 3; i++) {
      const dt = addDays(t, i), x = personDay(p, dt);
      if (!best || x.score > best.score) best = x;
      rows7.push({ x, off: i });
    }
    const list = rows7.map(({ x, off }) => `<div class="rank-row" style="${x.date === best.date ? "background:rgba(240,217,140,.06)" : ""}"><span class="rk">${off === 0 ? "선택" : off > 0 ? "+" + off : off}</span><span class="today-ilju">${fmtYMD(x.date)}${x.date === todayN ? ' <b style="color:var(--gold2)">오늘</b>' : ""}</span><span class="today-date">${x.dayGZ.hanja} · ${x.sg}(${toneWord(x.sg)})${x.rel ? " · " + x.rel : ""}</span><span style="flex:1"></span><b style="font-family:var(--serif);font-size:15px;color:${x.score >= 68 ? "var(--good)" : x.score >= 38 ? "var(--ink)" : "var(--bad)"}">${x.score}</b></div>`).join("");
    return `<div class="card"><div class="sec-t">${title} <small>${esc(p.name)} · ${fmtYMD(t)}</small></div>${list}
      <div class="reason" style="margin-top:10px"><b>가장 좋은 날</b> — ${fmtYMD(best.date)} (${best.dayGZ.hanja}일, ${best.score}점 · ${best.grade.label}) <div class="rx">중요한 만남·결정·시작은 이 날에 배치하는 게 유리합니다.</div></div>
      <div style="font-size:12px;color:var(--sub);margin-top:6px">점수는 그날 간지가 ${esc(p.name)}의 사주와 맺는 십신·지지 관계·용신·신살의 합산입니다.</div></div>`;
  }

  if (key === "year") {
    title = `년 운세 — ${Y}년의 큰 흐름`;
    const yg = getYearGZ(Y), ySs = shiShen(p.dmGan, yg.gan), yRel = zaRel(JI_K[p.dmJi], JI_K[yg.ji]);
    rows.push({ t: `세운 ${yg.hanja}년 — 일간에 ${ySs}`, s: SS_TONE[ySs], x: SS_DAY[ySs][2] });
    if (yRel) rows.push({ t: `년지와 내 일지 ${yRel}`, s: yRel === "육합" || yRel === "삼합" ? 6 : yRel === "충" ? -6 : -3, x: REL_DAY[yRel] || "" });
    try { const tj = tojeong(p, Y); if (typeof TJ === "object" && TJ[tj.gwae]) rows.push({ t: `토정비결 ${tj.gwae}괘 (${TJ[tj.gwae].g})`, s: TJ[tj.gwae].g === "길" ? 4 : TJ[tj.gwae].g === "흉" ? -4 : 0, x: `${TJ[tj.gwae].h} — ${TJ[tj.gwae].x}` }); } catch {}
    const months = []; for (let mm = 1; mm <= 12; mm++) months.push(monthlyLuck(p, isMale, Y, mm));
    const bestW = Math.max(...months.map(x2 => x2.wealth)), bestL = Math.max(...months.map(x2 => x2.love));
    rows.push({ t: "재물운 좋은 달", s: 0, x: `${months.filter(x2 => x2.wealth === bestW).map(x2 => x2.m + "월").join("·")} (★${bestW})` });
    rows.push({ t: "애정운 좋은 달", s: 0, x: `${months.filter(x2 => x2.love === bestL).map(x2 => x2.m + "월").join("·")} (★${bestL})` });
    return wrap(title, pd, rows, `올해는 '${toneWord(ySs)}'의 기운이 큰 물결입니다. 좋은 달에 중요한 일을 배치하고, ${yRel === "충" ? "년지 충의 해라 변동을 계획적으로 받아들이세요." : "흐름이 꺾이는 달(일지 충월)만 피하면 무난합니다."}`);
  }
  return "";
}

function gradeRow(pd) {
  return [{ t: `종합 ${pd.score}점 — ${pd.grade.label}`, s: pd.score - 50, x: "십신 톤 + 지지 합충 + 용신·신살 + 오행 유입의 합산(0~100)" }];
}
function wrap(title, r, rows, advice) {
  return `<div class="card gold"><div class="sec-t">${title} <small>${r.date ? fmtYMD(r.date) + " · " : ""}${r.grade ? `${r.score}점 · ${r.grade.label}` : ""}</small></div>
    ${rows.map(x => scoreRow(x)).join("")}
    ${advice ? `<div class="sec-t">조언</div><div class="reason">${esc(advice)}</div>` : ""}</div>`;
}
function scoreRow(r) { return `<div class="reason"><span class="rt">${esc(r.t)}</span><span class="rs" style="color:${r.s >= 0 ? "var(--good)" : "var(--bad)"}">${r.s > 0 ? "+" : ""}${r.s}</span><div class="rx">${esc(r.x)}</div></div>`; }
