(function attachChatPerf(globalObject) {
  const state = {
    longTasks: [],
    layoutShifts: [],
    longTaskObserver: null,
    layoutShiftObserver: null,
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

  function startLayoutShifts() {
    const supported = typeof PerformanceObserver !== 'undefined'
      && PerformanceObserver.supportedEntryTypes?.includes('layout-shift');

    if (!supported) {
      console.warn('[chatPerf] Layout Shift API is not available in this browser.');
      return false;
    }

    stopLayoutShifts();
    state.layoutShifts = [];
    state.layoutShiftObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.hadRecentInput) {
          return;
        }

        state.layoutShifts.push({
          value: Number((entry.value ?? 0).toFixed(4)),
          startTime: Number(entry.startTime.toFixed(2))
        });
      });
    });
    state.layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
    return true;
  }

  function stopLongTasks() {
    if (state.longTaskObserver) {
      state.longTaskObserver.disconnect();
      state.longTaskObserver = null;
    }
  }

  function stopLayoutShifts() {
    if (state.layoutShiftObserver) {
      state.layoutShiftObserver.disconnect();
      state.layoutShiftObserver = null;
    }
  }

  function collectSnapshot(label) {
    const domNodes = document.querySelectorAll('*').length;
    const messageNodes = document.querySelectorAll('.message-item[data-message-id]').length;
    const images = Array.from(document.querySelectorAll('.message-item img'));
    const heapUsed = performance.memory?.usedJSHeapSize ?? null;

    return {
      label,
      timestamp: new Date().toISOString(),
      timeOrigin: performance.timeOrigin,
      domNodes,
      messageNodes,
      imageNodes: images.length,
      loadingImages: images.filter((img) => !img.complete).length,
      heapUsed,
      longTaskCount: state.longTasks.length,
      longTaskTotal: Number(
        state.longTasks.reduce((sum, task) => sum + task.duration, 0).toFixed(2)
      ),
      layoutShiftCount: state.layoutShifts.length,
      clsValue: Number(
        state.layoutShifts.reduce((sum, shift) => sum + shift.value, 0).toFixed(4)
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

  async function measureMemory(label = `memory-${state.samples.length + 1}`) {
    const snapshot = collectSnapshot(label);
    const detailedMemoryBytes =
      typeof performance.measureUserAgentSpecificMemory === 'function'
        ? (await performance.measureUserAgentSpecificMemory()).bytes
        : snapshot.heapUsed;

    const result = {
      ...snapshot,
      detailedMemoryBytes: detailedMemoryBytes ?? null
    };

    state.samples.push(result);
    return result;
  }

  function reset() {
    stopLongTasks();
    stopLayoutShifts();
    state.longTasks = [];
    state.layoutShifts = [];
    state.samples = [];
  }

  function startObservers() {
    return {
      longTasks: startLongTasks(),
      layoutShifts: startLayoutShifts()
    };
  }

  function getSupport() {
    return {
      longTask: getLongTaskSupport(),
      layoutShift:
        typeof PerformanceObserver !== 'undefined'
        && PerformanceObserver.supportedEntryTypes?.includes('layout-shift'),
      heapMemory: typeof performance.memory !== 'undefined',
      uaSpecificMemory: typeof performance.measureUserAgentSpecificMemory === 'function'
    };
  }

  function help() {
    return {
      getSupport,
      startObservers,
      startLongTasks,
      startLayoutShifts,
      stopLongTasks,
      stopLayoutShifts,
      sample,
      snapshot,
      measureMemory,
      exportCSV,
      reset
    };
  }

  globalObject.__chatPerf = {
    getSupport,
    startObservers,
    startLongTasks,
    startLayoutShifts,
    stopLongTasks,
    stopLayoutShifts,
    sample,
    snapshot,
    measureMemory,
    exportCSV,
    reset,
    help
  };
})(window);
