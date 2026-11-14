"use strict";
// 합연 — 신점 탭: 무속 신점의 '오방기 뽑기'를 옮긴 것. 전체운 깃발 2개(들어오는 기운·신령의 당부) + 월별 깃발 12개.
// 신점의 본질(무속인이 받는 공수)은 계산할 수 없어서, 실제 신점에서 쓰는 깃발 뽑기 형식만 구현했다.
// 깃발 뜻은 널리 알려진 해석(유파마다 다름). 뽑기는 무작위지만 그달 재물·애정운(engine.js monthlyLuck)에 따라 좋은 깃발이 조금 더 잘 나온다.
// [키, 이름, 색, 뜻(짧게), 전체운 풀이, 월별 한마디, 길흉 1/0/-1]
const FLAGS = [
  ["red", "빨강", "#d93a3a", "재물·복", "재물과 복이 들어오는 깃발입니다. 하는 일에 돈이 붙고 기쁜 소식이 따릅니다.", "재물과 기쁜 소식이 들어오는 달.", 1],
  ["white", "흰색", "#f2f2f2", "신령·명예", "신령이 보살피는 깃발입니다. 명예와 건강이 지켜지고 뜻한 일이 바르게 풀립니다.", "귀인의 도움과 명예가 따르는 달.", 1],
  ["yellow", "노랑", "#e6c229", "조상의 도움", "조상이 돕는 깃발입니다. 집안이 편안해지고 막힌 일을 조상이 풀어 줍니다. 감사하는 마음이 복이 됩니다.", "조상 덕으로 집안이 평안한 달.", 1],
  ["blue", "파랑", "#2f6fd6", "근심·우환", "근심과 우환의 깃발입니다. 건강과 마음고생을 조심하고 무리한 일은 미루는 것이 좋습니다.", "근심이 생기기 쉬우니 건강과 마음을 챙길 달.", -1],
  ["green", "초록", "#2e9e5b", "구설·풍파", "구설과 풍파의 깃발입니다. 말을 조심하고 다툼, 이동 중 사고를 주의해야 합니다.", "구설과 다툼을 조심할 달. 말을 아끼세요.", -1]
];

function pickFlag(r, mood, skip) { // mood: 그 기간 운의 기울기(−2~+2) — 좋을수록 길한 깃발 가중. skip: 이미 뽑은 깃발(제외)
  const w = FLAGS.map((f, i) => i === skip ? 0 : Math.max(0.2, 1 + (f[6] > 0 ? 1 : -1) * mood * 0.25));
  let x = r * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < FLAGS.length; i++) { x -= w[i]; if (x < 0) return i; }
  return FLAGS.length - 1;
}

function drawShinjeom() {
  const male = (ST.sjWho || "m") === "m", p = male ? ST.p1 : ST.p2, Y = ST.fYear;
  const rnd = new Uint32Array(14); crypto.getRandomValues(rnd);
  const r = i => rnd[i] / 4294967296;
  const months = [];
  for (let m = 1; m <= 12; m++) { const L = monthlyLuck(p, male, Y, m); months.push({ m, gz: L.gz, f: pickFlag(r(m + 1), (L.wealth + L.love) / 2 - 3) }); }
  const yearMood = months.reduce((s, x) => s + (FLAGS[x.f][6]), 0) / 6; // 월 깃발의 흐름을 전체운 가중치로
  const f1 = pickFlag(r(0), yearMood);
  ST.sj = { who: ST.sjWho || "m", year: Y, f1, f2: pickFlag(r(13), yearMood, f1), months }; // 두 번째 깃발은 남은 넷 중에서
  renderShinjeom();
}

function setShinjeomWho(k) { ST.sjWho = k; ST.sj = null; renderShinjeom(); }

function renderShinjeom() {
  $("sjTitle").textContent = `${ST.fYear}년`;
  const who = ST.sjWho || "m", p = who === "m" ? ST.p1 : ST.p2;
  const btn = (k, label) => `<button onclick="setShinjeomWho('${k}')" style="${who === k ? "border-color:var(--gold);color:var(--gold2);font-weight:700" : ""}">${label}</button>`;
  const flag = (i, big) => { const f = FLAGS[i]; return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${big ? 64 : 34}px;height:${big ? 84 : 44}px;border-radius:4px 14px 14px 4px;background:${f[2]};color:${i === 1 || i === 2 ? "#222" : "#fff"};font-weight:800;font-size:${big ? 15 : 11}px;box-shadow:0 2px 8px rgba(0,0,0,.4)">${f[1]}</span>`; };
  const head = `<div class="chips" style="justify-content:center;margin-bottom:12px"><span style="color:var(--sub);font-size:13px">누구의 점을 볼까요?</span>
    ${btn("m", `남자 · ${esc(ST.p1.name)}`)}${btn("f", `여자 · ${esc(ST.p2.name)}`)}</div>`;
  const s = ST.sj && ST.sj.who === who && ST.sj.year === ST.fYear ? ST.sj : null;
  if (!s) {
    $("sjBody").innerHTML = head + `<div class="card gold" style="text-align:center"><div class="sec-t" style="justify-content:center">신점 — 오방기 뽑기 (${ST.fYear}년)</div>
      <div style="margin:10px 0">${[0, 1, 2, 3, 4].map(i => flag(i, false)).join(" ")}</div>
      <div style="color:var(--sub);margin:6px 0 14px">${esc(p.name)}의 올해를 마음속으로 묻고 깃발을 뽑으세요. 전체운 깃발 두 개와 열두 달 깃발이 나옵니다.</div>
      <button onclick="drawShinjeom()" style="font-size:16px;padding:10px 22px">🎌 깃발 뽑기</button>
      <div style="font-size:12px;color:var(--sub);margin-top:12px">빨강 재물·복 · 흰색 신령·명예 · 노랑 조상의 도움 · 파랑 근심·우환 · 초록 구설·풍파</div></div>`;
    return;
  }
  const a = FLAGS[s.f1], b = FLAGS[s.f2], sum = a[6] + b[6];
  const verdict = sum === 2 ? "두 깃발이 모두 길하니 크게 열리는 해입니다. 들어오는 복을 놓치지 마세요."
    : sum === 0 ? "길한 깃발과 조심할 깃발이 함께 나왔습니다. 좋은 기운은 살리고 당부는 꼭 새겨 두세요."
    : "두 깃발 모두 조심하라는 뜻입니다. 큰일은 미루고 몸과 마음, 말을 아끼면 무사히 넘깁니다.";
  $("sjBody").innerHTML = head + `<div class="card gold"><div class="sec-t">${esc(p.name)}의 ${s.year}년 전체운</div>
      <div class="grid2">
        <div style="display:flex;gap:12px;align-items:center">${flag(s.f1, true)}<div><b>들어오는 기운 — ${a[1]} (${a[3]})</b><div class="rx" style="margin-top:4px">${a[4]}</div></div></div>
        <div style="display:flex;gap:12px;align-items:center">${flag(s.f2, true)}<div><b>신령의 당부 — ${b[1]} (${b[3]})</b><div class="rx" style="margin-top:4px">${b[4]}</div></div></div>
      </div>
      <div class="reason" style="margin-top:12px"><b>공수</b> — ${verdict}</div></div>
    <div class="card"><div class="sec-t">월별운</div>
      ${s.months.map(x => { const f = FLAGS[x.f]; return `<div class="reason" style="display:flex;gap:10px;align-items:center">${flag(x.f, false)}<div style="flex:1"><span class="rt">${x.m}월 <small style="color:var(--sub)">${x.gz.hanja}</small> · ${f[1]} (${f[3]})</span><div class="rx">${f[5]}</div></div></div>`; }).join("")}
      <div style="margin-top:12px;text-align:center"><button onclick="drawShinjeom()">🔄 다시 뽑기</button></div>
      <div style="font-size:12px;color:var(--sub);margin-top:8px">실제 신점에서 쓰는 오방기 뽑기 형식을 옮긴 재미용 점입니다. 깃발 뜻은 널리 알려진 해석이며 무속 유파마다 다를 수 있고, 그달 재물·애정운이 좋을수록 길한 깃발이 조금 더 잘 나오게 했습니다.</div></div>`;
}
