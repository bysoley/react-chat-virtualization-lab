# Methodology

## Test Environment

- Browser: Chrome stable, Incognito window
- Build mode: `bun run build` followed by `bun run preview`
- Machine state: close unrelated heavy tabs or applications before running
- Network: normal broadband is sufficient because placeholder images are external

## Scenarios

### 1. Initial Render

1. Open the demo with a fixed query string such as `?mode=plain&items=5000&imageRatio=0.30`.
2. Open DevTools and paste `scripts/perf/browser-metrics.js` into the console.
3. Run `__chatPerf.reset()` and `__chatPerf.startLongTasks()`.
4. Reload the page and wait until the list settles.
5. Run `__chatPerf.sample('initial-render')`.
6. Repeat the same flow with `mode=virtualized`.

Record:

- DOM node count
- Message node count
- Heap usage if `performance.memory` is available
- Long task count and total long task duration

### 2. Scroll Performance

1. Open a heavy scenario such as `?mode=plain&items=10000&imageRatio=0.50`.
2. Paste `scripts/perf/browser-metrics.js` and `scripts/perf/pagination-metrics.js` into DevTools.
3. Run `__paginationPerf.arm('before-scroll')`.
4. Scroll quickly from bottom to top, then back to bottom.
5. Run `await __paginationPerf.autoCapture(300, 'after-scroll')`.
6. Run `__chatPerf.sample('after-scroll')`.
7. Repeat with virtualized mode.

Record:

- Maximum item top shift
- Maximum item height shift
- DOM node count after aggressive scroll
- Heap usage after aggressive scroll

## Notes

- Keep the same `items`, `imageRatio`, and browser conditions when comparing modes.
- Use the seeded dataset so both modes render the same content mix.
- If images are still loading, wait for the layout to settle before taking measurements.
