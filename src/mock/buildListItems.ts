import type { DemoListItem, DemoMessage } from '../types/message'

type BuildListItemsOptions = {
  previousTimestamp?: number
  unreadFromIndex?: number
}

export type BuildListItemsResult = {
  items: DemoListItem[]
  messageItemIndices: number[]
}

function toDayKey(timestamp: number) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(timestamp)
}

function formatDateLabel(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(timestamp)
}

export function buildListItems(
  messages: DemoMessage[],
  options: BuildListItemsOptions = {}
): BuildListItemsResult {
  const items: DemoListItem[] = []
  const messageItemIndices: number[] = []
  const { previousTimestamp, unreadFromIndex } = options
  let previousDayKey = previousTimestamp ? toDayKey(previousTimestamp) : null
  let unreadInserted = false

  messages.forEach((message, index) => {
    const dayKey = toDayKey(message.timestamp)

    if (dayKey !== previousDayKey) {
      items.push({
        kind: 'date-divider',
        id: `date-divider-${dayKey}-${message.id}`,
        label: formatDateLabel(message.timestamp)
      })
      previousDayKey = dayKey
    }

    if (!unreadInserted && unreadFromIndex === index) {
      items.push({ kind: 'unread-divider', id: 'unread-divider' })
      unreadInserted = true
    }

    messageItemIndices.push(items.length)
    items.push(message)
  })

  if (!unreadInserted && unreadFromIndex === messages.length && messages.length > 0) {
    items.push({ kind: 'unread-divider', id: 'unread-divider' })
  }

  return { items, messageItemIndices }
}
