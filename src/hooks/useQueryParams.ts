import { useEffect, useMemo, useState } from 'react'
import type { PerfParams, RenderMode } from '../types/message'

export const DEFAULT_PARAMS: PerfParams = {
  mode: 'virtualized',
  items: 500,
  imageRatio: 0.3,
  replyRatio: 0.1,
  liveMessages: false,
  pageSize: 150
}

function parseMode(value: string | null): RenderMode {
  if (value === 'plain' || value === 'plain-full') {
    return value
  }

  return 'virtualized'
}

function parseItems(value: string | null) {
  if (value === null) return DEFAULT_PARAMS.items
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PARAMS.items
  return Math.max(10, Math.min(10_000, Math.round(parsed)))
}

function parseImageRatio(value: string | null) {
  if (value === null) return DEFAULT_PARAMS.imageRatio
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_PARAMS.imageRatio
  return Math.max(0, Math.min(1, Number(parsed.toFixed(2))))
}

function parseReplyRatio(value: string | null) {
  if (value === null) return DEFAULT_PARAMS.replyRatio
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_PARAMS.replyRatio
  return Math.max(0, Math.min(0.5, Number(parsed.toFixed(2))))
}

function parsePageSize(value: string | null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PARAMS.pageSize
  }

  const allowedValues = [50, 100, 150, 300]
  return allowedValues.includes(parsed) ? parsed : DEFAULT_PARAMS.pageSize
}

function parseLiveMessages(value: string | null) {
  return value === '1' || value === 'true'
}

function sanitizeParams(params: PerfParams): PerfParams {
  return {
    mode: parseMode(params.mode),
    items: parseItems(String(params.items)),
    imageRatio: parseImageRatio(String(params.imageRatio)),
    replyRatio: parseReplyRatio(String(params.replyRatio)),
    liveMessages: Boolean(params.liveMessages),
    pageSize: parsePageSize(String(params.pageSize))
  }
}

function readParams(): PerfParams {
  const search = new URLSearchParams(window.location.search)

  return {
    mode: parseMode(search.get('mode')),
    items: parseItems(search.get('items')),
    imageRatio: parseImageRatio(search.get('imageRatio')),
    replyRatio: parseReplyRatio(search.get('replyRatio')),
    liveMessages: parseLiveMessages(search.get('liveMessages')),
    pageSize: parsePageSize(search.get('pageSize'))
  }
}

function writeParams(params: PerfParams) {
  const search = new URLSearchParams()
  search.set('mode', params.mode)
  search.set('items', String(params.items))
  search.set('imageRatio', params.imageRatio.toFixed(2))
  search.set('replyRatio', params.replyRatio.toFixed(2))
  search.set('liveMessages', params.liveMessages ? '1' : '0')
  search.set('pageSize', String(params.pageSize))
  const nextUrl = `${window.location.pathname}?${search.toString()}`
  window.history.replaceState(null, '', nextUrl)
}

export function useQueryParams() {
  const [params, setParams] = useState<PerfParams>(() => readParams())

  useEffect(() => {
    writeParams(params)
  }, [params])

  useEffect(() => {
    const handlePopState = () => {
      setParams(readParams())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return useMemo(
    () => ({
      params,
      applyParams: (nextParams: PerfParams) => {
        setParams(sanitizeParams(nextParams))
      },
      reset: () => {
        setParams(DEFAULT_PARAMS)
      }
    }),
    [params]
  )
}
