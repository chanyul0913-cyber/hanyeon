# 합연(合緣) — 커플 사주·궁합 웹사이트

두 사람(남자=본인, 여자=상대)의 사주(四柱八字)를 계산해 **일주 기준 일별 속궁합·피크·합궁**을 보여 주는 비공개 정적 사이트.
`D:\AI로또` 사이트(luckylab)와 같은 구조·방식: 정적 HTML+CSS+JS, 로컬 라이브러리, PWA.

- 공개 주소: https://chanyul0913-cyber.github.io/hanyeon/
- 저장소: https://github.com/chanyul0913-cyber/hanyeon (main 브랜치, push하면 Pages 바로 배포)

## 파일 구조

| 파일 | 역할 | 수정 금지 |
|---|---|---|
| `js/vendor/lunar.js` | lunar-javascript 1.7.7(6tail, MIT) — 사주·만세력·대운 계산 라이브러리 | 예 |
| `js/vendor/astronomy.js` | astronomy-engine(MIT) — 서양 점성술 행성 위치 | 예 |
| `js/engine.js` | 사주 계산·십신·지지 관계·12운성·신살·궁합 스코어·합궁 엔진 + 개인 일운(`personDay`)·세운(`getYearGZ`)·공용 유틸(`josa`·`randN`) (UI 없음) | |
| `js/app.js` | 입력 폼·탭·localStorage·공유 링크 | |
| `js/chart.js` | 명반 탭 렌더링 (사주 8자·오행·십신·대운) | |
| `js/couple.js` | 궁합 분석 탭 (일주×일주 고정 궁합 + 별자리) | |
| `js/daily.js` | 일별 궁합 탭 (월 캘린더·피크·합궁·일 상세 모달) | |
| `js/western.js` | 서양 점성술: synastry + 트랜짓 일별 궁합(`dailyWestSync`) + 합궁·로또 판정(`lottoOf`·`westMoney`) + **투자 트랜짓**(`investSync` — 금성·목성·토성·명왕성), planetPositions 공용화·캐시. astronomy-engine 있을 때만 | |
| `js/luck.js` | 재물·애정운 탭 (두 사람 12개월 월운 ★, 계산은 engine.js `monthlyLuck`) | |
| `js/tojeong.js` | 토정비결 탭 (144괘 원문·풀이 데이터, 괘 계산은 engine.js `tojeong`) | |
| `js/tarot.js` | 타로 탭 (메이저 아르카나 22장, 그녀의 마음 3장 뽑기) | |
| `js/shinjeom.js` | 신점 탭 (오방기 뽑기 — 전체운 2깃발 + 월별 12깃발, 월운에 따라 가중) | |
| `js/consult.js` | 운세 상담 탭 (사람·날짜 선택 → 종합·심리·애정·연애·타로·재물·**주식**·건강·직업·주간·년간 11메뉴 아코디언 — engine.js `personDay` 등으로 계산, 날짜 clamp 1900~2100) | |
| `js/selftest.js` | 자가 점검 (`await selfTest()` 콘솔) | |

## 규칙

- 배포 후 JS/CSS를 수정하면 **index.html의 `?v=N` 버전을 올려야** 브라우저·서비스워커 캐시가 갱신된다 (Pages 캐시 10분).
- 개발 확인: 폴더에서 `python -m http.server 8890` → http://localhost:8890 (8790은 AI로또가 사용)
- 콘솔에서 `await selfTest()` → `ok: true`여야 함. 페이지 열 때 자동 실행은 주소에 `?selftest`를 붙였을 때만.
- 렌더링은 보이는 탭만(`renderAll()` = 현재 탭, `switchTab`이 열 때 그림). 새 탭을 추가하면 `renderAll`의 표(R)와 `switchTab` 해시 정규식에 등록. 렌더 중 오류는 `renderAll`이 탭 상단에 ⚠ 오류 카드로 표시하고(성공 렌더마다 정리) 콘솔에 기록한다.
- 달·연도 이동은 lunar.js 안전 범위로 clamp: 일별 캘린더 1900~2100, 월운·토정·신점 연도 1901~2099 (`moveMonth`·`moveYear` — 밖으로 나가면 이동 자체를 막음).
- 서비스 워커: 페이지(HTML)는 네트워크 우선, js·css는 `?v=N` 정확 일치 캐시. **설치 시 index.html에서 `?v=N` URL을 파싱해 워밍**하므로 sw.js에 자산 목록을 따로 관리하지 않는다. js·css 내용을 바꿨으면 `?v=N`을 올리고 `sw.js`의 `CACHE` 이름도 올린다.
- **저장 공간 오리진 공유 주의 (2026-11-20 실제 버그 수정)**: github.io에서 luckylab(/luckylab/)과 같은 오리진을 공유한다 — localStorage·Cache Storage가 사이트 경로가 아니라 오리진 단위로 저장된다. 따라서 ① sw.js activate는 **`hanyeon-` 접두사 캐시만** 삭제해야 하고(luckylab의 `robunso-*` 캐시를 지우면 다른 사이트의 오프라인 기능이 깨짐) ② localStorage 키는 `hanyeon_` 접두사를 유지하고 ③ `caches.keys()`·localStorage 전체 순회/삭제 코드를 추가하지 않는다.
- 사주 계산은 오직 `js/engine.js`를 통해서만 — 개별 파일에서 직접 lunar.js 호출 금지. 계산 파일(engine·western·selftest)은 UI 파일(app.js)의 함수를 쓰지 않는다(공용 유틸 `josa`·`randN`은 engine.js, `esc`만 app.js). Node에서도 돌아야 하므로 window 의존은 라이브러리 노출(Solar·Lunar·LunarYear·Astronomy)만.
- 서울 태양시 30분 보정(동경 135° vs 127°) 규칙 유지.
- 시간을 모르면 시주를 계산하지 않는다(12:00 가정 표시 없이 `시주: 모름`).
- 비밀번호 잠금 없음(사용자 요청으로 제거). 생년월일은 각 브라우저 localStorage에만 저장.
- 커밋: 작업 단위마다 한국어 한 줄 요약 커밋.
- **세션 종료 인수인계 (2026-11-18 사용자 지시 — 말하지 않아도 항상 적용)**: 작업을 끝낼 때마다 사용자가 묻지 않아도 ① 모든 변경 커밋·push(작업 트리 비움) ② 이 파일의 파일 구조·규칙이 최신인지 확인·갱신 ③ `작업기록.md`에 날짜별 기록(한 일·검증 결과·남은 과제) ④ `STATE.md`(현재 위치·다음 할 일 절차) 갱신. 다음 세션(Claude Code 포함)은 `CLAUDE.md`→이 문서→`STATE.md`만 읽고 바로 이어서 작업할 수 있어야 한다.
