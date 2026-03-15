(function attachPaginationPerf(globalObject) {
  const SCROLL_CONTAINER_SELECTOR = '.chat-container';
  const MESSAGE_SELECTOR = '.message-item[data-message-id]';

  const state = {
    armed: false,
    baseline: [],
    captures: []
  };

  function getScrollContainer() {
    return document.querySelector(SCROLL_CONTAINER_SELECTOR);
  }

  function getMessageRects() {
    return Array.from(document.querySelectorAll(MESSAGE_SELECTOR)).map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        id: node.getAttribute('data-message-id'),
        top: Number(rect.top.toFixed(2)),
        height: Number(rect.height.toFixed(2))
      };
    });
  }

  function arm(label = 'baseline') {
    state.armed = true;
    state.baseline = getMessageRects();
    return {
      label,
      count: state.baseline.length,
      scrollTop: getScrollContainer()?.scrollTop ?? null
    };
  }

  function capture(label = `capture-${state.captures.length + 1}`) {
    if (!state.armed) {
      console.warn('[paginationPerf] Call arm() before capture().');
      return null;
    }

    const current = getMessageRects();
    const baselineMap = new Map(state.baseline.map((entry) => [entry.id, entry]));
    const shifts = current
      .map((entry) => {
        const original = baselineMap.get(entry.id);
        if (!original) {
          return null;
        }

        return {
          id: entry.id,
          deltaTop: Number((entry.top - original.top).toFixed(2)),
          deltaHeight: Number((entry.height - original.height).toFixed(2))
        };
      })
      .filter(Boolean);

    const summary = {
      label,
      timestamp: new Date().toISOString(),
      scrollTop: getScrollContainer()?.scrollTop ?? null,
      measuredItems: shifts.length,
      maxTopShift: Math.max(0, ...shifts.map((entry) => Math.abs(entry.deltaTop))),
      maxHeightShift: Math.max(0, ...shifts.map((entry) => Math.abs(entry.deltaHeight)))
    };

    state.captures.push(summary);
    return summary;
  }

  function autoCapture(delay = 250, label = 'auto-capture') {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(capture(label)), delay);
    });
  }

  function summary() {
    return {
      armed: state.armed,
      captureCount: state.captures.length,
      lastCapture: state.captures[state.captures.length - 1] ?? null
    };
  }

  function exportCSV() {
    if (state.captures.length === 0) {
      console.warn('[paginationPerf] No captures recorded.');
      return '';
    }

    const headers = Object.keys(state.captures[0]);
    const rows = state.captures.map((entry) =>
      headers.map((header) => JSON.stringify(entry[header] ?? '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  function help() {
    return {
      arm,
      capture,
      autoCapture,
      summary,
      exportCSV
    };
  }

  globalObject.__paginationPerf = {
    arm,
    capture,
    autoCapture,
    summary,
    exportCSV,
    help
  };
})(window);
