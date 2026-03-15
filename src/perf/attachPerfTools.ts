type LongTaskSample = {
  name: string
  duration: number
  startTime: number
}

type LayoutShiftSample = {
  value: number
  startTime: number
  sources: number
}

type PerfSnapshot = {
  label: string
  timestamp: string
  timeOrigin: number
  domNodes: number
  messageNodes: number
  imageNodes: number
  loadingImages: number
  heapUsed: number | null
  longTaskCount: number
  longTaskTotal: number
  layoutShiftCount: number
  clsValue: number
}

type PaginationCapture = {
  label: string
  timestamp: string
  scrollTop: number | null
  measuredItems: number
  maxTopShift: number
  maxHeightShift: number
}

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
    measureUserAgentSpecificMemory?: () => Promise<{
      bytes: number
      breakdown?: Array<{ bytes: number; attribution?: Array<{ scope?: string; url?: string }> }>
    }>
  }

  interface Window {
    __chatPerf?: ReturnType<typeof createChatPerfApi>
    __paginationPerf?: ReturnType<typeof createPaginationPerfApi>
  }
}

function getObserverSupport(type: string) {
  return (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes(type)
  )
}

function createChatPerfApi() {
  const state = {
    longTasks: [] as LongTaskSample[],
    layoutShifts: [] as LayoutShiftSample[],
    longTaskObserver: null as PerformanceObserver | null,
    layoutShiftObserver: null as PerformanceObserver | null,
    samples: [] as PerfSnapshot[]
  }

  function stopLongTasks() {
    state.longTaskObserver?.disconnect()
    state.longTaskObserver = null
  }

  function stopLayoutShifts() {
    state.layoutShiftObserver?.disconnect()
    state.layoutShiftObserver = null
  }

  function startLongTasks() {
    if (!getObserverSupport('longtask')) {
      console.warn('[chatPerf] Long Task API is not available in this browser.')
      return false
    }

    stopLongTasks()
    state.longTasks = []
    state.longTaskObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        state.longTasks.push({
          name: entry.name,
          duration: Number(entry.duration.toFixed(2)),
          startTime: Number(entry.startTime.toFixed(2))
        })
      })
    })
    state.longTaskObserver.observe({ type: 'longtask', buffered: true })
    return true
  }

  function startLayoutShifts() {
    if (!getObserverSupport('layout-shift')) {
      console.warn('[chatPerf] Layout Shift API is not available in this browser.')
      return false
    }

    stopLayoutShifts()
    state.layoutShifts = []
    state.layoutShiftObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        const shiftEntry = entry as PerformanceEntry & {
          value?: number
          hadRecentInput?: boolean
          sources?: unknown[]
        }

        if (shiftEntry.hadRecentInput) {
          return
        }

        state.layoutShifts.push({
          value: Number((shiftEntry.value ?? 0).toFixed(4)),
          startTime: Number(entry.startTime.toFixed(2)),
          sources: shiftEntry.sources?.length ?? 0
        })
      })
    })
    state.layoutShiftObserver.observe({ type: 'layout-shift', buffered: true })
    return true
  }

  function startObservers() {
    return {
      longTasks: startLongTasks(),
      layoutShifts: startLayoutShifts()
    }
  }

  function collectSnapshot(label: string): PerfSnapshot {
    const domNodes = document.querySelectorAll('*').length
    const messageNodes = document.querySelectorAll('.message-item[data-message-id]').length
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>('.message-item img')
    )
    const heapUsed = performance.memory?.usedJSHeapSize ?? null

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
    }
  }

  function sample(label = `sample-${state.samples.length + 1}`) {
    const snapshot = collectSnapshot(label)
    state.samples.push(snapshot)
    return snapshot
  }

  function snapshot(label = 'snapshot') {
    return collectSnapshot(label)
  }

  async function measureMemory(label = `memory-${state.samples.length + 1}`) {
    const base = collectSnapshot(label)
    const detailedBytes =
      typeof performance.measureUserAgentSpecificMemory === 'function'
        ? (await performance.measureUserAgentSpecificMemory()).bytes
        : base.heapUsed

    const sampleWithMemory = {
      ...base,
      detailedMemoryBytes: detailedBytes ?? null
    }

    state.samples.push(sampleWithMemory)
    return sampleWithMemory
  }

  function exportCSV() {
    if (state.samples.length === 0) {
      console.warn('[chatPerf] No samples recorded.')
      return ''
    }

    const headers = Object.keys(state.samples[0])
    const rows = state.samples.map((entry) =>
      headers.map((header) => JSON.stringify(entry[header as keyof typeof entry] ?? '')).join(',')
    )
    return [headers.join(','), ...rows].join('\n')
  }

  function reset() {
    stopLongTasks()
    stopLayoutShifts()
    state.longTasks = []
    state.layoutShifts = []
    state.samples = []
  }

  function getSupport() {
    return {
      longTask: getObserverSupport('longtask'),
      layoutShift: getObserverSupport('layout-shift'),
      heapMemory: typeof performance.memory !== 'undefined',
      uaSpecificMemory: typeof performance.measureUserAgentSpecificMemory === 'function'
    }
  }

  return {
    startLongTasks,
    stopLongTasks,
    startLayoutShifts,
    stopLayoutShifts,
    startObservers,
    sample,
    snapshot,
    measureMemory,
    exportCSV,
    reset,
    getSupport
  }
}

function createPaginationPerfApi() {
  const SCROLL_CONTAINER_SELECTOR = '.chat-container'
  const MESSAGE_SELECTOR = '.message-item[data-message-id]'
  const state = {
    armed: false,
    baseline: [] as Array<{ id: string | null; top: number; height: number }>,
    captures: [] as PaginationCapture[]
  }

  function getScrollContainer() {
    return document.querySelector<HTMLElement>(SCROLL_CONTAINER_SELECTOR)
  }

  function getMessageRects() {
    return Array.from(document.querySelectorAll<HTMLElement>(MESSAGE_SELECTOR)).map((node) => {
      const rect = node.getBoundingClientRect()
      return {
        id: node.getAttribute('data-message-id'),
        top: Number(rect.top.toFixed(2)),
        height: Number(rect.height.toFixed(2))
      }
    })
  }

  function arm(label = 'baseline') {
    state.armed = true
    state.baseline = getMessageRects()
    return {
      label,
      count: state.baseline.length,
      scrollTop: getScrollContainer()?.scrollTop ?? null
    }
  }

  function capture(label = `capture-${state.captures.length + 1}`) {
    if (!state.armed) {
      console.warn('[paginationPerf] Call arm() before capture().')
      return null
    }

    const current = getMessageRects()
    const baselineMap = new Map(state.baseline.map((entry) => [entry.id, entry]))
    const shifts = current
      .map((entry) => {
        const original = baselineMap.get(entry.id)
        if (!original) {
          return null
        }

        return {
          deltaTop: Number((entry.top - original.top).toFixed(2)),
          deltaHeight: Number((entry.height - original.height).toFixed(2))
        }
      })
      .filter((entry): entry is { deltaTop: number; deltaHeight: number } => entry !== null)

    const summary = {
      label,
      timestamp: new Date().toISOString(),
      scrollTop: getScrollContainer()?.scrollTop ?? null,
      measuredItems: shifts.length,
      maxTopShift: Math.max(0, ...shifts.map((entry) => Math.abs(entry.deltaTop))),
      maxHeightShift: Math.max(0, ...shifts.map((entry) => Math.abs(entry.deltaHeight)))
    }

    state.captures.push(summary)
    return summary
  }

  function autoCapture(delay = 250, label = 'auto-capture') {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(capture(label)), delay)
    })
  }

  function exportCSV() {
    if (state.captures.length === 0) {
      console.warn('[paginationPerf] No captures recorded.')
      return ''
    }

    const headers = Object.keys(state.captures[0])
    const rows = state.captures.map((entry) =>
      headers.map((header) => JSON.stringify(entry[header as keyof PaginationCapture] ?? '')).join(',')
    )
    return [headers.join(','), ...rows].join('\n')
  }

  return {
    arm,
    capture,
    autoCapture,
    exportCSV,
    summary() {
      return {
        armed: state.armed,
        captureCount: state.captures.length,
        lastCapture: state.captures[state.captures.length - 1] ?? null
      }
    }
  }
}

export function attachPerfTools() {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.__chatPerf) {
    window.__chatPerf = createChatPerfApi()
  }

  if (!window.__paginationPerf) {
    window.__paginationPerf = createPaginationPerfApi()
  }
}
