# 채팅 가상화 테스트

React 18 + Vite 5 + TypeScript 5 + `react-virtuoso` 4.17 기반의 채팅 목록 가상화 성능 비교 데모.

일반 렌더링(`.map()`)과 가상화 렌더링(`react-virtuoso`)을 동일한 결정론적 데이터셋으로 비교한다.

## 시작하기

```bash
bun install
bun run dev
```

[http://localhost:5173](http://localhost:5173) 접속.

## URL 쿼리 파라미터

모든 설정은 URL에 반영되므로 테스트 환경을 공유할 수 있다.

| 파라미터 | 설명 | 기본값 |
|---|---|---|
| `mode` | `virtualized` \| `plain` | `virtualized` |
| `items` | 메시지 수 (10 ~ 10000) | `500` |
| `imageRatio` | 이미지 메시지 비율 (0 ~ 1) | `0.3` |
| `replyRatio` | 답장 메시지 비율 (0 ~ 0.5) | `0.1` |
| `pageSize` | 페이지당 로드 수 (50/100/150/300) | `150` |
| `liveMessages` | 실시간 메시지 시뮬레이션 (`1` \| `0`) | `0` |

예시:

```
http://localhost:5173/?mode=virtualized&items=5000&pageSize=150&imageRatio=0.2&replyRatio=0.15
```

## 주요 기능

- **결정론적 데이터 생성** — `mulberry32` 시드 기반 RNG로 동일 파라미터면 항상 동일한 메시지 생성
- **날짜 구분선** — 날짜가 바뀌는 지점에 자동 삽입
- **읽지 않은 메시지 구분선** — 초기 로드 시 표시
- **firstItemIndex 페이지네이션** — 위로 스크롤 시 이전 페이지 로드, 스크롤 위치 유지
- **followOutput** — 하단에 있을 때 새 메시지 수신 시 자동 스크롤
- **최신 메시지로 버튼** — 위로 스크롤 시 하단 이동 버튼 표시
- **실시간 메시지 시뮬레이션** — 2~4초 간격으로 자동 메시지 추가
- **낙관적 UI** — 메시지 전송 시 `sending → sent` 상태 처리
- **useTransition** — 옵션 변경 중 스피너 표시, UI 블로킹 방지

## 성능 측정 (콘솔 API)

```js
__chatPerf.startLongTasks()   // Long Task 관찰 시작
__chatPerf.sample(label)      // 현재 DOM 수 / 힙 샘플
__chatPerf.snapshot(label)    // 스냅샷 저장
__chatPerf.exportCSV()        // CSV 내보내기
__chatPerf.reset()            // 초기화

__paginationPerf.arm(label)           // 페이지 로드 측정 준비
__paginationPerf.capture(label)       // 결과 캡처
__paginationPerf.autoCapture(delay, label)
__paginationPerf.summary()
__paginationPerf.exportCSV()
```

## 예상 결과

| 시나리오 | 일반 렌더링 | 가상화 렌더링 |
|---|---|---|
| 대량 초기 렌더 | 아이템 수에 비례해 DOM·힙 증가 | DOM 수 일정하게 유지 |
| 빠른 스크롤 | 대용량에서 Long Task 빈도 높음 | 스크롤 비용 안정적 |
| 이미지 포함 혼합 | 전체 렌더 수에 비례해 레이아웃 비용 증가 | 화면에 보이는 행 위주 비용 |
