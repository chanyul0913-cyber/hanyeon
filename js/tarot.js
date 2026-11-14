"use strict";
// 합연 — 타로 탭: 메이저 아르카나 22장 중 3장(과거·현재·미래)을 뽑아 '나를 향한 상대의 마음'을 읽는다.
// 방향 선택: 여자의 마음(남자가 뽑기) / 남자의 마음(여자가 뽑기). 카드 뜻은 주어 없이 써서 양방향 공용.
// 카드 뜻은 일반적으로 알려진 메이저 아르카나 의미를 연애 질문에 맞게 이 사이트가 정리한 것. 사주 계산과 무관.
// [번호, 이름, 영문, 기호, 정방향 뜻, 역방향 뜻, 정방향 톤, 역방향 톤] — 톤: 1 긍정 · 0 복합 · -1 주의
const TAROT = [
  [0, "바보", "The Fool", "🌱", "가볍고 설레는 호기심. 부담 없이 다가오고 싶어 하며 함께 있으면 자유롭다고 느낍니다.", "관계에 대한 확신이 아직 없습니다. 진지해지는 것을 망설이거나 즉흥적으로 행동합니다.", 1, -1],
  [1, "마법사", "The Magician", "✨", "당신에게 매력을 느끼고 적극적으로 표현하고 싶어 합니다. 먼저 움직일 준비가 되어 있습니다.", "마음과 말이 다를 수 있습니다. 표현이 서툴거나 상황을 재고 있습니다.", 1, -1],
  [2, "여사제", "The High Priestess", "🌙", "속마음을 드러내지 않지만 깊이 생각하고 있습니다. 조용하고 진지한 호감입니다.", "감정을 숨기고 거리를 둡니다. 말하지 않은 서운함이나 비밀이 있을 수 있습니다.", 0, -1],
  [3, "여황제", "The Empress", "🌸", "따뜻하게 보살피고 싶은 마음. 당신 곁에서 안정감과 애정을 느낍니다.", "애정 표현이 줄었거나 지쳐 있습니다. 돌봄을 받고 싶은 쪽은 상대일 수 있습니다.", 1, -1],
  [4, "황제", "The Emperor", "🏛️", "당신을 믿음직하게 보고 관계를 책임감 있게 지키려 합니다.", "통제받는다고 느끼거나 서로의 고집에 답답해합니다.", 1, -1],
  [5, "교황", "The Hierophant", "📜", "진지하고 안정된 관계를 원합니다. 신뢰와 약속을 중요하게 생각합니다.", "틀에 박힌 관계에 지쳤거나 가치관 차이를 느낍니다.", 1, 0],
  [6, "연인", "The Lovers", "💞", "강한 끌림과 마음이 통한다는 느낌. 당신을 사랑하는 마음이 분명합니다.", "마음이 엇갈리거나 선택 앞에서 흔들립니다. 대화가 필요합니다.", 1, -1],
  [7, "전차", "The Chariot", "🏇", "관계를 앞으로 끌고 가려는 의지가 강합니다. 함께 목표를 향해 가고 싶어 합니다.", "감정을 다스리기 어렵거나 서로 다른 방향을 보고 있습니다.", 1, -1],
  [8, "힘", "Strength", "🦁", "부드러운 인내와 깊은 애정. 당신의 부족한 점도 너그럽게 감싸려 합니다.", "참다가 지쳐 있습니다. 서운함이 쌓여 터지기 직전일 수 있습니다.", 1, -1],
  [9, "은둔자", "The Hermit", "🏮", "혼자 생각할 시간이 필요합니다. 마음은 진심이지만 조용히 정리하는 중입니다.", "마음을 닫고 거리를 두고 있습니다. 외로움을 느끼지만 말하지 않습니다.", 0, -1],
  [10, "운명의 수레바퀴", "Wheel of Fortune", "🎡", "당신을 인연이라고 느낍니다. 관계가 좋은 쪽으로 바뀌는 전환점입니다.", "타이밍이 어긋나고 감정 기복이 있습니다. 시간이 필요합니다.", 1, -1],
  [11, "정의", "Justice", "⚖️", "관계를 공정하게 바라보고 솔직한 대화를 원합니다.", "불공평하다고 느끼고 서운함이 쌓여 있습니다.", 0, -1],
  [12, "매달린 사람", "The Hanged Man", "🙃", "기다리며 관계를 다른 시각으로 보고 있습니다. 당신을 위해 양보하고 있습니다.", "멈춰 버린 관계에 답답해합니다. 기다림이 지쳐 갑니다.", 0, -1],
  [13, "죽음", "Death", "🦋", "관계가 새 단계로 바뀌는 중입니다. 예전 방식을 끝내고 새로 시작하고 싶어 합니다.", "변화를 두려워하거나 끝내지 못한 감정에 머물러 있습니다.", 0, -1],
  [14, "절제", "Temperance", "🍶", "균형 잡힌 편안한 마음. 서로 맞춰 가는 조화로운 관계라고 느낍니다.", "균형이 깨졌습니다. 한쪽만 애쓴다고 느낄 수 있습니다.", 1, -1],
  [15, "악마", "The Devil", "🔥", "강한 끌림과 집착. 몸과 마음이 강하게 묶여 있지만 건강한지 살펴야 합니다.", "얽매임에서 벗어나고 싶어 합니다. 부담을 덜어 주면 마음이 풀립니다.", 0, 0],
  [16, "탑", "The Tower", "⚡", "갑작스러운 감정 변화나 충격이 있습니다. 쌓인 것이 한꺼번에 드러날 수 있습니다.", "큰 위기는 피하려 하지만 불안이 남아 있습니다.", -1, 0],
  [17, "별", "The Star", "⭐", "희망과 순수한 호감. 당신과의 관계에서 위로와 치유를 느낍니다.", "실망하거나 자신감을 잃었습니다. 다정한 확신이 필요합니다.", 1, -1],
  [18, "달", "The Moon", "🌘", "마음이 불안하고 헷갈립니다. 오해나 확인되지 않은 걱정이 있습니다.", "오해가 풀리고 진심이 드러나기 시작합니다.", -1, 1],
  [19, "태양", "The Sun", "☀️", "밝고 행복한 감정. 당신과 함께 있으면 즐겁고 편안합니다.", "즐거움이 잠시 흐려졌지만 마음은 그대로입니다. 일시적인 서운함입니다.", 1, 0],
  [20, "심판", "Judgement", "📯", "관계를 다시 돌아보고 새롭게 시작하려 합니다. 다시 기회를 주고 싶어 합니다.", "지난 일에 머물러 결정을 내리지 못합니다.", 1, -1],
  [21, "세계", "The World", "🌍", "만족스럽고 완성된 마음. 오래 함께하고 싶다고 느낍니다.", "조금 아쉬움이 남아 있습니다. 마무리하지 못한 이야기가 있습니다.", 1, 0]
];
const TAROT_POS = ["과거 — 그동안 나를 어떻게 느껴 왔나", "현재 — 지금 나를 향한 마음", "미래 — 앞으로 마음이 향하는 곳"];

function drawTarot() {
  const r = new Uint32Array(6); crypto.getRandomValues(r);
  const pool = TAROT.map((_, i) => i), pick = [];
  for (let k = 0; k < 3; k++) pick.push({ i: pool.splice(r[k] % pool.length, 1)[0], rev: r[k + 3] % 2 === 1 });
  ST.tarot = pick;
  renderTarot();
}

function setTarotDir(k) { ST.tarotDir = k; ST.tarot = null; renderTarot(); } // 질문이 바뀌면 새로 뽑기

function renderTarot() {
  const her = ST.tarotDir === "me" ? "남자" : "여자", me = ST.tarotDir === "me" ? "여자" : "남자"; // 마음의 주인·받는 사람 — 설정 칸(남자·여자) 기준
  const dirBtn = (k, label) => `<button onclick="setTarotDir('${k}')" style="${(ST.tarotDir || "her") === k ? "border-color:var(--gold);color:var(--gold2);font-weight:700" : ""}">${label}</button>`;
  const head = `<div class="chips" style="justify-content:center;margin-bottom:12px"><span style="color:var(--sub);font-size:13px">누구의 마음을 볼까요?</span>
    ${dirBtn("her", "여자의 마음 (남자가 뽑을 때)")}${dirBtn("me", "남자의 마음 (여자가 뽑을 때)")}</div>`;
  if (!ST.tarot) {
    $("tarotBody").innerHTML = head + `<div class="card gold" style="text-align:center"><div class="sec-t" style="justify-content:center">${her}의 마음 — 타로 3장</div>
      <div style="color:var(--sub);margin:6px 0 14px">마음속으로 ${her}를 떠올리고 카드를 뽑으세요. 과거 · 현재 · 미래 세 장으로 ${me}를 향한 마음을 읽습니다.</div>
      <button onclick="drawTarot()" style="font-size:16px;padding:10px 22px">🃏 카드 3장 뽑기</button></div>`;
    return;
  }
  const cards = ST.tarot.map((c, k) => { const t = TAROT[c.i]; return { k, t, rev: c.rev, tone: c.rev ? t[7] : t[6], text: c.rev ? t[5] : t[4] }; });
  const sum = cards.reduce((s, c) => s + c.tone, 0) + cards[1].tone; // 현재 카드는 한 번 더 반영
  const verdict = sum >= 3 ? `${her}의 마음은 지금 당신을 향해 따뜻하게 열려 있습니다. 표현을 아끼지 마세요.`
    : sum >= 1 ? `호감은 분명하지만 아직 조심스러운 부분이 있습니다. 서두르기보다 편안함을 쌓아 주세요.`
    : sum >= -1 ? `마음이 복잡하게 얽혀 있습니다. 한 번 진솔하게 이야기를 들어 주는 것이 좋겠습니다.`
    : `지금은 지치거나 서운한 마음이 큽니다. 요구보다 배려와 휴식을 먼저 건네 주세요.`;
  $("tarotBody").innerHTML = head + `<div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
    ${cards.map(c => `<div class="card ${c.tone > 0 ? "gold" : ""}" style="text-align:center">
      <div style="font-size:12px;color:var(--sub)">${TAROT_POS[c.k]}</div>
      <div style="font-size:46px;margin:8px 0;${c.rev ? "transform:rotate(180deg)" : ""}">${c.t[3]}</div>
      <b style="font-family:var(--serif);font-size:18px">${c.t[0]}. ${c.t[1]}</b><div style="font-size:12px;color:var(--sub)">${c.t[2]} · ${c.rev ? "역방향" : "정방향"}</div>
      <div class="reason" style="text-align:left;margin-top:10px">${esc(c.text)}</div></div>`).join("")}
  </div>
  <div class="card"><div class="sec-t">종합 — ${me}를 향한 ${her}의 마음</div><div class="reason">${esc(verdict)}</div>
    <div style="margin-top:12px;text-align:center"><button onclick="drawTarot()">🔄 다시 뽑기</button></div>
    <div style="font-size:12px;color:var(--sub);margin-top:8px">타로는 마음을 돌아보는 재미용 점입니다. 실제 마음은 대화로 확인하세요.</div></div>`;
}
