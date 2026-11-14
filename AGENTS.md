# 합연(合緣) — 커플 사주·궁합 웹사이트

두 사람(남자=본인, 여자=상대)의 사주(四柱八字)를 계산해 **일주 기준 일별 속궁합·기의 흐름**을 보여 주는 비공개 정적 사이트.
`D:\AI로또` 사이트(luckylab)와 같은 구조·방식: 정적 HTML+CSS+JS, 로컬 라이브러리, PWA.

- 공개 주소: https://chanyul0913-cyber.github.io/hanyeon/
- 저장소: https://github.com/chanyul0913-cyber/hanyeon (main 브랜치, push하면 Pages 바로 배포)

## 파일 구조

| 파일 | 역할 | 수정 금지 |
|---|---|---|
| `js/vendor/lunar.js` | lunar-javascript 1.7.7(6tail, MIT) — 사주·만세력·대운 계산 라이브러리 | 예 |
| `js/vendor/astronomy.js` | astronomy-engine(MIT) — 서양 점성술 행성 위치 | 예 |
| `js/engine.js` | 사주 계산·십신·지지 관계·12운성·신살·궁합 스코어·기의 흐름 엔진 (UI 없음) | |
| `js/app.js` | 비밀번호 게이트·입력 폼·탭·localStorage·공유 링크 | |
| `js/chart.js` | 명반 탭 렌더링 (사주 8자·오행·십신·대운) | |
| `js/couple.js` | 궁합 분석 탭 (일주×일주 고정 궁합 + 별자리) | |
| `js/daily.js` | 일별 궁합 탭 (월 캘린더·피크일·기의 흐름 배지·일 상세 모달) | |
| `js/western.js` | 서양 점성술 synastry (행성 아스펙트, astronomy-engine 있을 때만) | |
| `js/selftest.js` | 자가 점검 (`await selfTest()` 콘솔) | |

## 규칙

- 개발 확인: 폴더에서 `python -m http.server 8890` → http://localhost:8890 (8790은 AI로또가 사용)
- 콘솔에서 `await selfTest()` → `ok: true`여야 함.
- 사주 계산은 오직 `js/engine.js`를 통해서만 — 개별 파일에서 직접 lunar.js 호출 금지.
- 서울 태양시 30분 보정(동경 135° vs 127°) 규칙 유지.
- 시간을 모르면 시주를 계산하지 않는다(12:00 가정 표시 없이 `시주: 모름`).
- 비밀번호: 기본 `0817` (SHA-256 해시가 `js/app.js` 상단 `PASS_SHA256`). 변경은 해시를 교체.
  - 클라이언트 게이트는 URL 아는 사람의 캐주얼한 접근 막기용일 뿐 완전한 보안이 아님 — README에 명시.
- 커밋: 작업 단위마다 한국어 한 줄 요약 커밋.
