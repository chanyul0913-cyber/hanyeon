"use strict";
// 합연 — 앱 컨트롤러: 비밀번호 게이트·입력·공유 링크·탭·오늘 탭 렌더링.
// 각 탭의 실제 렌더링은 chart.js(명반)·couple.js(궁합)·daily.js(일별)·western.js(서양)가 ST를 읽어 한다.

// ---------- 전역 상태 ----------
const LS_PROFILES = "hanyeon_profiles", LS_PASS = "hanyeon_pass";
const DEFAULT_PASS_SHA256 = "d3cf6b77fdeae5ff43871acc766c91e3bca9b7d3b3a6c8c073d1ec0751df786d"; // 기본 비밀번호 0817
const ST = { profiles: null, p1: null, p2: null, calYear: 0, calMonth: 0 };
const today = () => new Date();

// ---------- 공용 유틸 ----------
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = id => document.getElementById(id);
const ymdStr = n => `${Math.floor(n / 10000)}-${String(Math.floor(n / 100) % 100).padStart(2, "0")}-${String(n % 100).padStart(2, "0")}`;
const fmtYMD = n => `${Math.floor(n / 100) % 100}/${String(n % 100).padStart(2, "0")}(${dowK[new Date(Math.floor(n / 10000), Math.floor(n / 100) % 100 - 1, n % 100).getDay()]})`;
const gradeCls = k => ({ peak: "grade-peak", good: "grade-good", normal: "grade-normal", care: "grade-care", bad: "grade-bad" }[k] || "grade-normal");

async function sha256hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// 원형 게이지 SVG
function gaugeSVG(score, label) {
  const R = 54, C = 2 * Math.PI * R, pct = Math.max(0, Math.min(100, score)) / 100;
  const col = score >= 82 ? "#f0d98c" : score >= 68 ? "#5fb98a" : score >= 52 ? "#c8ccd8" : score >= 38 ? "#e2a15c" : "#e2655c";
  return `<svg class="gauge" viewBox="0 0 130 130">
    <circle cx="65" cy="65" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="11"/>
    <circle cx="65" cy="65" r="${R}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round"
      stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 65 65)"/>
    <text x="65" y="62" text-anchor="middle" font-size="30" font-weight="900" fill="${col}" font-family="Noto Serif KR">${score}</text>
    <text x="65" y="86" text-anchor="middle" font-size="11" fill="#9aa0b0">${esc(label || "")}</text></svg>`;
}

// 흐름 배지 HTML
function flowBadge(r) {
  const f = r.flow, cls = { me2her: "b-flow", her2me: "b-flow", charge: "b-charge", tension: "b-tension" }[f.dir] || "b-neutral";
  let extra = "";
  if (r.flags.love) extra += `<span class="badge b-love">♥ 애정 동조</span>`;
  if (r.flags.mutualCharge) extra += `<span class="badge b-charge">⊕ 충전</span>`;
  if (r.flags.charm) extra += `<span class="badge b-love">✦ 도화</span>`;
  return `<span class="badge ${cls}">${f.icon} ${f.label}</span>${extra}`;
}

// ---------- 비밀번호 게이트 ----------
async function tryUnlock() {
  const pw = $("lockPass").value.trim();
  if (!pw) return;
  const h = await sha256hex(pw);
  const target = localStorage.getItem(LS_PASS) || DEFAULT_PASS_SHA256;
  if (h === target) {
    $("lock").style.display = "none";
    $("app").hidden = false;
    renderAll();
  } else {
    $("lockMsg").textContent = "비밀번호가 맞지 않습니다.";
    $("lockPass").value = "";
    $("lockPass").focus();
  }
}
function initLock() {
  $("lockBtn").onclick = tryUnlock;
  $("lockPass").onkeydown = e => { if (e.key === "Enter") tryUnlock(); };
  $("lockPass").focus();
}

// ---------- 프로필(생년월일) ----------
function loadProfiles() {
  try { const j = localStorage.getItem(LS_PROFILES); return j ? JSON.parse(j) : null; } catch { return null; }
}
function saveProfiles(p) { localStorage.setItem(LS_PROFILES, JSON.stringify(p)); }

function buildProfile(f) { // 폼 → profile 객체
  const nohour = f.nohour.checked;
  const h = nohour ? "" : f.h.value;
  const mi = nohour ? 0 : (+f.mi.value || 0);
  return {
    name: f.name.value.trim() || (f === form1 ? "나" : "그녀"),
    y: +f.y.value, m: +f.m.value, d: +f.d.value,
    cal: f.cal.value, leap: f.leap.checked, h, mi
  };
}
function calcPersonSafe(p) { try { return calcPerson(p); } catch (e) { throw e; } }

function saveFromForms() {
  const msgs = [];
  let p1 = null, p2 = null;
  try {
    const pr1 = buildProfile(form1);
    if (!pr1.y || !pr1.m || !pr1.d) throw new Error("나의 생년월일을 입력하세요.");
    p1 = calcPersonSafe(pr1);
  } catch (e) { msgs.push("나: " + e.message); }
  try {
    const pr2 = buildProfile(form2);
    if (!pr2.y || !pr2.m || !pr2.d) throw new Error("상대의 생년월일을 입력하세요.");
    p2 = calcPersonSafe(pr2);
  } catch (e) { msgs.push("상대: " + e.message); }
  if (msgs.length) { $("setMsg").textContent = msgs.join(" / "); return; }
  ST.profiles = [buildProfile(form1), buildProfile(form2)];
  saveProfiles(ST.profiles);
  ST.p1 = p1; ST.p2 = p2;
  $("modalSettings").hidden = true;
  renderAll();
}

function fillForms() {
  const fill = (f, p) => {
    if (!p) return;
    f.name.value = p.name || "";
    f.y.value = p.y; f.m.value = p.m; f.d.value = p.d;
    f.cal.value = p.cal || "solar"; f.leap.checked = !!p.leap;
    f.nohour.checked = p.h === "";
    f.h.value = p.h === "" ? "" : p.h; f.mi.value = p.mi || 0;
    f.h.disabled = f.mi.disabled = p.h === "";
  };
  if (ST.profiles) { fill(form1, ST.profiles[0]); fill(form2, ST.profiles[1]); }
  else { ["form1", "form2"].forEach(id => { const f = $(id); f.nohour.checked = false; }); }
}

// ---------- 공유 링크 ----------
async function shareLink() {
  if (!ST.profiles) { alert("먼저 설정에서 두 사람의 생년월일을 저장하세요."); return; }
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(ST.profiles)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const url = location.href.split("#")[0] + "#d=" + b64;
  try { await navigator.clipboard.writeText(url); alert("공유 링크를 복사했습니다.\n상대가 이 링크를 열면 생년월일이 자동으로 채워집니다. (비밀번호도 필요)"); }
  catch { prompt("아래 링크를 복사해 보내세요:", url); }
}
function loadFromHash() {
  const m = location.hash.match(/#d=([A-Za-z0-9\-_]+)/);
  if (!m) return false;
  try {
    const json = decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))));
    const arr = JSON.parse(json);
    if (Array.isArray(arr) && arr.length === 2) { saveProfiles(arr); return true; }
  } catch {}
  return false;
}

// ---------- 탭 ----------
function switchTab(name) {
  document.querySelectorAll(".tabbar button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  document.querySelectorAll("main .tab").forEach(t => t.hidden = t.id !== "tab-" + name);
  history.replaceState(null, "", "#" + name);
  renderAll(name);
}

// ---------- 렌더링 ----------
function renderAll(only) {
  if (!ST.p1 || !ST.p2) { openSettings(); return; }
  const t = today();
  ST.calYear = ST.calYear || t.getFullYear(); ST.calMonth = ST.calMonth || (t.getMonth() + 1);
  try {
    renderHome();
    if (!only || only === "myeongban") renderMyeongban();
    if (!only || only === "couple") renderCouple();
    if (!only || only === "daily") renderDaily();
    if (!only || only === "western") renderWestern();
  } catch (e) { console.error(e); }
}

function openSettings() { fillForms(); $("setMsg").textContent = ""; $("modalSettings").hidden = false; }

// ---------- 오늘(홈) 탭 ----------
function renderHome() {
  const t = new Date();
  const r = dailySync(ST.p1, ST.p2, t);
  const top3 = r.reasons.slice(0, 3);
  $("homeToday").innerHTML = `<div class="card gold">
    <div class="sec-t">오늘의 궁합 <span class="today-date">${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")} (${dowK[t.getDay()]})</span></div>
    <div class="gauge-wrap">
      ${gaugeSVG(r.score, r.grade.label)}
      <div class="gauge-label">
        <div class="today-ilju">오늘 일주: ${r.dayGZ.hanja} (${r.dayGZ.ilju}) · ${r.dayGZ.oh}</div>
        <div style="margin:8px 0 6px">${flowBadge(r)}</div>
        <div>${top3.map(x => `<div class="reason"><span class="rt">${esc(x.t)}</span><span class="rs" style="color:${x.s >= 0 ? "var(--good)" : "var(--bad)"}">${x.s > 0 ? "+" : ""}${x.s}</span><div class="rx">${esc(x.x)}</div></div>`).join("")}</div>
        <div><button id="btnTodayMore" onclick="openDayModal(${ymdOf(t)})">상세 보기 ▸</button></div>
      </div>
    </div></div>`;

  // 다가올 특별한 날 (다음 60일)
  let d = addDays(t, 1), list = [];
  for (let i = 0; i < 60; i++) { list.push(dailySync(ST.p1, ST.p2, d)); d = addDays(d, 1); }
  const peaks = [...list].sort((a, b) => b.score - a.score).slice(0, 5);
  $("homePeak").innerHTML = `<div class="card"><div class="sec-t">다가올 특별한 날 TOP 5 <small>(향후 60일)</small></div>
    ${peaks.map((x, i) => `<div class="rank-row" onclick="openDayModal(${x.date})"><span class="rk">${i + 1}</span><span class="today-ilju">${fmtYMD(x.date)}</span>
      <span class="today-date">${x.dayGZ.hanja}(${x.dayGZ.ilju})</span><span style="flex:1">${flowBadge(x)}</span>
      <b style="font-family:var(--serif);font-size:16px">${x.score}</b></div>`).join("")}</div>`;

  // 기의 흐름 요약 (향후 30일)
  const me = list.filter(x => x.flags.meToHer).slice(0, 6), her = list.filter(x => x.flags.herToMe).slice(0, 6);
  const row = (x, dir) => x ? `<div class="flow-item" onclick="openDayModal(${x.date})" style="cursor:pointer"><span class="fd">${fmtYMD(x.date)}</span><span class="fi" style="color:var(--su)">${dir}</span><span class="fx">${esc(x.reasons.find(q => q.t.includes("기의 흐름"))?.x || "")}</span></div>` : "";
  $("homeFlow").innerHTML = `<div class="card"><div class="sec-t">기의 흐름 — 향후 30일</div>
    <div style="margin-bottom:8px"><span class="badge b-flow">→ 나 → 그녀</span> 내 마음이 전달되는 날 · <span class="badge b-flow">← 그녀 → 나</span> 그녀의 마음이 닿는 날</div>
    ${me.length ? me.map(x => row(x, "나 → 그녀")).join("") : '<div class="flow-item"><span class="fx">향후 30일간 나→그녀 흐름일이 없습니다. (체인 구조 특성상 희소)</span></div>'}
    ${her.length ? her.map(x => row(x, "그녀 → 나")).join("") : '<div class="flow-item"><span class="fx">향후 30일간 그녀→나 흐름일이 없습니다.</span></div>'}</div>`;
}

// ---------- 일별 상세 모달 ----------
function openDayModal(ymd) {
  const d = new Date(Math.floor(ymd / 10000), Math.floor(ymd / 100) % 100 - 1, ymd % 100, 12);
  const r = dailySync(ST.p1, ST.p2, d);
  const reasons = r.reasons.map(x => `<div class="reason"><span class="rt">${esc(x.t)}</span><span class="rs" style="color:${x.s >= 0 ? "var(--good)" : "var(--bad)"}">${x.s > 0 ? "+" : ""}${x.s}</span><div class="rx">${esc(x.x)}</div></div>`).join("");
  const ss1 = r.ss1, ss2 = r.ss2;
  $("dayDetail").innerHTML = `
    <div class="modal-hd"><b>${ymdStr(ymd)} (${dowK[d.getDay()]}) — ${r.dayGZ.hanja}일 (${r.dayGZ.ilju})</b><button class="modal-x" data-close>✕</button></div>
    <div class="gauge-wrap" style="margin-bottom:12px">${gaugeSVG(r.score, r.grade.label)}<div class="gauge-label">${flowBadge(r)}
      <table class="mini-tbl" style="margin-top:10px">
        <tr><td>나에게 오는 기운</td><td>${esc(ss1.십신)} · ${esc(ss1.운성)}운</td></tr>
        <tr><td>그녀에게 오는 기운</td><td>${esc(ss2.십신)} · ${esc(ss2.운성)}운</td></tr>
        ${r.ss.length ? `<tr><td>신살</td><td>${r.ss.map(x => esc(`${x.who}: ${x.name}`)).join(" · ")}</td></tr>` : ""}
      </table></div></div>
    <div class="sec-t">점수 근거</div>${reasons || '<div class="reason">특별한 작용 없는 고요한 날</div>'}
    <div class="sec-t">조언</div><div class="reason">${esc(dayAdvice(r))}</div>`;
  $("modalDay").hidden = false;
  $("dayDetail").querySelectorAll("[data-close]").forEach(b => b.onclick = () => $("modalDay").hidden = true);
}

function dayAdvice(r) {
  if (r.grade.k === "peak") return "두 사람 모두에게 기운이 열리는 날입니다. 소개팅·데이트·대화·약속 모두 좋습니다. 하고 싶었던 말을 이 날 꺼내세요.";
  if (r.grade.k === "good") return "부드럽게 흐르는 날. 함께 있는 시간을 만들면 자연스럽게 좋아집니다.";
  if (r.grade.k === "normal") return "무난한 날. 특별한 기대 없이 평소처럼 존중하면 충분합니다.";
  if (r.grade.k === "care") return "조금 예민해질 수 있는 날. 중요한 대화나 결정은 하루 미루는 것이 유리합니다.";
  return "긴장이 쉽게 생기는 날입니다. 같은 공간에서의 큰 결정·비판·요구는 피하고, 가볍게 지나가세요.";
}

// ---------- 초기화 ----------
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.Solar || !window.Lunar) { document.body.innerHTML = "<p style='padding:40px'>사주 라이브러리(lunar.js)를 불러오지 못했습니다. 파일 위치를 확인하세요.</p>"; return; }
  initLock();
  $("btnSettings").onclick = openSettings;
  $("btnShare").onclick = shareLink;
  $("btnSaveProfile").onclick = saveFromForms;
  document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => b.closest(".modal").hidden = true);
  ["form1", "form2"].forEach(id => { const f = $(id); f.nohour.onchange = () => { f.h.disabled = f.mi.disabled = f.nohour.checked; if (f.nohour.checked) { f.h.value = ""; } }; });
  document.querySelectorAll(".tabbar button").forEach(b => b.onclick = () => switchTab(b.dataset.tab));
  $("btnChangePass").onclick = async () => {
    const np = $("newPass").value.trim();
    if (np.length < 4) { alert("4자 이상으로 입력하세요."); return; }
    localStorage.setItem(LS_PASS, await sha256hex(np));
    $("newPass").value = ""; alert("비밀번호를 변경했습니다. (이 브라우저에만 적용)");
  };
  $("calPrev").onclick = () => { ST.calMonth--; if (ST.calMonth < 1) { ST.calMonth = 12; ST.calYear--; } renderAll("daily"); };
  $("calNext").onclick = () => { ST.calMonth++; if (ST.calMonth > 12) { ST.calMonth = 1; ST.calYear++; } renderAll("daily"); };
  ["fPeak", "fMe", "fHer", "fCare"].forEach(id => { $(id).onchange = () => renderAll("daily"); });

  // 공유 링크 → 프로필 복원
  let restored = loadFromHash();
  ST.profiles = restored ? loadProfiles() : loadProfiles();
  if (restored && ST.profiles) {
    try { ST.p1 = calcPerson(ST.profiles[0]); ST.p2 = calcPerson(ST.profiles[1]); } catch (e) { console.warn("프로필 계산 실패", e); }
  }
  const hashTab = location.hash.match(/^#(home|myeongban|couple|daily|western)$/);
  if (hashTab) switchTab(hashTab[1]);
  selfTest().catch(() => {});
});
