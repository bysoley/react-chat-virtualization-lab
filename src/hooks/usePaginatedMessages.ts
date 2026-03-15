import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildListItems } from '../mock/buildListItems'
import { generateMessages } from '../mock/generateMessages'
import type { DemoMessage, PerfParams } from '../types/message'

const FIXED_SEED = 1337

function getInitialWindowStart(totalItems: number, pageSize: number) {
  return Math.max(0, totalItems - pageSize)
}

function getInitialUnreadIndex(windowSize: number) {
  return windowSize > 0 ? Math.floor(windowSize * 0.85) : undefined
}

export function usePaginatedMessages(params: PerfParams) {
  const allMessages = useMemo(
    () =>
      generateMessages({
        count: params.items,
        imageRatio: params.imageRatio,
        replyRatio: params.replyRatio,
        seed: FIXED_SEED
      }),
    [params.imageRatio, params.items, params.replyRatio]
  )

  const initialWindowStart = useMemo(
    () => getInitialWindowStart(allMessages.length, params.pageSize),
    [allMessages.length, params.pageSize]
  )
  const initialUnreadIndex = useMemo(
    () => getInitialUnreadIndex(allMessages.length - initialWindowStart),
    [allMessages.length, initialWindowStart]
  )

  const [windowStart, setWindowStart] = useState(initialWindowStart)
  const [liveMessages, setLiveMessages] = useState<DemoMessage[]>([])
  const [firstItemIndex, setFirstItemIndex] = useState(0)

  useEffect(() => {
    setWindowStart(initialWindowStart)
    setLiveMessages([])
  }, [initialWindowStart, allMessages])

  const fullHistory = useMemo(() => buildListItems(allMessages), [allMessages])

  const historicalMessages = useMemo(
    () => allMessages.slice(windowStart),
    [allMessages, windowStart]
  )

  const unreadFromIndex = useMemo(() => {
    if (initialUnreadIndex === undefined) {
      return undefined
    }

    if (windowStart > initialWindowStart) {
      return undefined
    }

    return windowStart === initialWindowStart
      ? initialUnreadIndex
      : initialUnreadIndex + (initialWindowStart - windowStart)
  }, [initialUnreadIndex, initialWindowStart, windowStart])

  const historicalItems = useMemo(
    () =>
      buildListItems(historicalMessages, {
        previousTimestamp: allMessages[windowStart - 1]?.timestamp,
        unreadFromIndex
      }),
    [allMessages, historicalMessages, unreadFromIndex, windowStart]
  )

  useEffect(() => {
    if (historicalMessages.length === 0) {
      setFirstItemIndex(0)
      return
    }

    const startMessageIndex = windowStart
    const startItemIndex = fullHistory.messageItemIndices[startMessageIndex] ?? 0
    const includesLeadingDateDivider =
      historicalItems.items[0]?.kind === 'date-divider' &&
      historicalItems.items[1]?.kind !== 'date-divider'

    setFirstItemIndex(includesLeadingDateDivider ? Math.max(0, startItemIndex - 1) : startItemIndex)
  }, [fullHistory.messageItemIndices, historicalItems.items, historicalMessages.length, windowStart])

  const items = useMemo(() => {
    if (liveMessages.length === 0) {
      return historicalItems.items
    }

    const liveItems = buildListItems(liveMessages, {
      previousTimestamp:
        historicalMessages[historicalMessages.length - 1]?.timestamp ??
        allMessages[windowStart - 1]?.timestamp
    })

    return [...historicalItems.items, ...liveItems.items]
  }, [allMessages, historicalItems.items, historicalMessages, liveMessages, windowStart])

  const loadMore = useCallback(() => {
    if (windowStart <= 0) {
      return
    }

    const nextWindowStart = Math.max(0, windowStart - params.pageSize)
    const nextHistoricalMessages = allMessages.slice(nextWindowStart)
    const nextUnreadFromIndex =
      initialUnreadIndex === undefined
        ? undefined
        : initialUnreadIndex + (initialWindowStart - nextWindowStart)
    const nextHistoricalItems = buildListItems(nextHistoricalMessages, {
      previousTimestamp: allMessages[nextWindowStart - 1]?.timestamp,
      unreadFromIndex: nextUnreadFromIndex
    })

    setFirstItemIndex((current) => current - (nextHistoricalItems.items.length - historicalItems.items.length))
    setWindowStart(nextWindowStart)
  }, [
    allMessages,
    historicalItems.items.length,
    initialUnreadIndex,
    initialWindowStart,
    params.pageSize,
    windowStart
  ])

  const appendMessage = useCallback((message: DemoMessage) => {
    setLiveMessages((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === message.id)
      if (existingIndex >= 0) {
        const next = [...current]
        next[existingIndex] = message
        return next
      }

      return [...current, message]
    })
  }, [])

  return {
    allMessages,
    items,
    firstItemIndex,
    hasMore: windowStart > 0,
    loadMore,
    appendMessage
  }
}
