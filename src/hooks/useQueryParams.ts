import { useEffect, useMemo, useState } from 'react'
import type { PerfParams, RenderMode } from '../types/message'

const DEFAULT_PARAMS: PerfParams = {
  mode: 'virtualized',
  items: 100,
  imageRatio: 0.3
}

function parseMode(value: string | null): RenderMode {
  return value === 'plain' ? 'plain' : 'virtualized'
}

function parseItems(value: string | null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PARAMS.items
  }

  return Math.max(10, Math.min(10_000, Math.round(parsed)))
}

function parseImageRatio(value: string | null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PARAMS.imageRatio
  }

  return Math.max(0, Math.min(1, Number(parsed.toFixed(2))))
}

function readParams(): PerfParams {
  const search = new URLSearchParams(window.location.search)

  return {
    mode: parseMode(search.get('mode')),
    items: parseItems(search.get('items')),
    imageRatio: parseImageRatio(search.get('imageRatio'))
  }
}

function writeParams(params: PerfParams) {
  const search = new URLSearchParams()
  search.set('mode', params.mode)
  search.set('items', String(params.items))
  search.set('imageRatio', params.imageRatio.toFixed(2))
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
      setMode: (mode: RenderMode) => {
        setParams((current) => ({ ...current, mode }))
      },
      setItems: (items: number) => {
        setParams((current) => ({ ...current, items: parseItems(String(items)) }))
      },
      setImageRatio: (imageRatio: number) => {
        setParams((current) => ({
          ...current,
          imageRatio: parseImageRatio(String(imageRatio))
        }))
      },
      reset: () => {
        setParams(DEFAULT_PARAMS)
      }
    }),
    [params]
  )
}
