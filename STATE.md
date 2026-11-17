# STATE — 합연(合緣) 현재 상태

> 이 문서는 "지금 프로젝트가 어디에 있는지"를 담는 살아있는 문서다. **세션을 마칠 때마다 최신으로 갱신**한다.
> 규칙·파일 구조는 `AGENTS.md`, 세션별 작업 이력은 `작업기록.md`를 본다.

최종 갱신: 2026-11-18 (ZCode)

- 배포: https://chanyul0913-cyber.github.io/hanyeon/ (main push → GitHub Pages 자동 배포, 캐시 최대 10분)
- 로컬: `python -m http.server 8890` → http://localhost:8890
- 최신 커밋: `8e6f91f` 운세 상담 아코디언 UX + 시스템 강화(오류 카드·clamp·토정 격리)
- 캐시 버전: sw CACHE `hanyeon-v42` / index `?v` — engine 36 · app 37 · daily 35 · western 36 · consult 6 · selftest 35 · style 9

## 현재 위치

- 탭 10개 모두 안정: 오늘 / 운세 상담(아코디언 UX) / 일별 궁합(사주+서양합궁+로또 통합 캘린더) / 재물·애정운 / 토정비결 / 신점 / 타로 / 명반 / 궁합 분석 / 서양 점성술
- 검증 상태: Node `selfTest()` ok:true · 브라우저 10탭 오류 0 · 배포본 반영 확인 완료
- 사용자 실제 프로필(임천봉·황은정)은 각 브라우저 localStorage에 있음(저장소에 없음 — 개인정보 미포함)

## 다음 할 일 절차 (이어받는 세션용)

1. `git pull --ff-only` → `python -m http.server 8890` → http://localhost:8890 로컬 확인
2. 콘솔 `await selfTest()` → `ok: true` 확인 (자동 실행은 `?selftest` 붙였을 때만)
3. js/css 내용 수정 시 → index.html `?v=N` +1 → `sw.js` CACHE 이름 +1 → 커밋·push(자동 배포)
4. 새 탭 추가 시 → index.html(버튼·section) + `renderAll`의 R 표 + `switchTab` 해시 정규식
5. 남은 과제: 없음 — 사용자의 새 요청을 받으면 AGENTS.md 규칙대로 진행
