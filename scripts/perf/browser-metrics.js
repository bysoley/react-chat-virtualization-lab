(function attachChatPerf(globalObject) {
  const state = {
    longTasks: [],
    longTaskObserver: null,
    samples: []
  };

  function now() {
    return performance.now();
  }

  function getLongTaskSupport() {
    return typeof PerformanceObserver !== 'undefined'
      && PerformanceObserver.supportedEntryTypes?.includes('longtask');
  }

  function startLongTasks() {
    if (!getLongTaskSupport()) {
      console.warn('[chatPerf] Long Task API is not available in this browser.');
      return false;
    }

    stopLongTasks();
    state.longTasks = [];
    state.longTaskObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        state.longTasks.push({
          name: entry.name,
          duration: Number(entry.duration.toFixed(2)),
          startTime: Number(entry.startTime.toFixed(2))
        });
      });
    });
    state.longTaskObserver.observe({ type: 'longtask', buffered: true });
    return true;
  }

  function stopLongTasks() {
    if (state.longTaskObserver) {
      state.longTaskObserver.disconnect();
      state.longTaskObserver = null;
    }
  }

  function collectSnapshot(label) {
    const domNodes = document.querySelectorAll('*').length;
    const messageNodes = document.querySelectorAll('.message-item[data-message-id]').length;
    const imageNodes = document.querySelectorAll('.message-item img').length;
    const heapUsed = performance.memory?.usedJSHeapSize ?? null;

    return {
      label,
      timestamp: new Date().toISOString(),
      timeOrigin: performance.timeOrigin,
      domNodes,
      messageNodes,
      imageNodes,
      heapUsed,
      longTaskCount: state.longTasks.length,
      longTaskTotal: Number(
        state.longTasks.reduce((sum, task) => sum + task.duration, 0).toFixed(2)
      )
    };
  }

  function sample(label = `sample-${state.samples.length + 1}`) {
    const snapshot = collectSnapshot(label);
    state.samples.push(snapshot);
    return snapshot;
  }

  function snapshot(label = 'snapshot') {
    return collectSnapshot(label);
  }

  function exportCSV() {
    if (state.samples.length === 0) {
      console.warn('[chatPerf] No samples recorded.');
      return '';
    }

    const headers = Object.keys(state.samples[0]);
    const rows = state.samples.map((entry) =>
      headers.map((header) => JSON.stringify(entry[header] ?? '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  function reset() {
    stopLongTasks();
    state.longTasks = [];
    state.samples = [];
  }

  function help() {
    return {
      startLongTasks,
      stopLongTasks,
      sample,
      snapshot,
      exportCSV,
      reset
    };
  }

  globalObject.__chatPerf = {
    startLongTasks,
    stopLongTasks,
    sample,
    snapshot,
    exportCSV,
    reset,
    help
  };
})(window);
