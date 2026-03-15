import { useEffect, useRef } from 'react'
import type { DemoAuthor, DemoMessage } from '../types/message'
import { mulberry32, pickOne, randomInt } from '../mock/seededRandom'

const AUTHORS: Record<DemoAuthor, string[]> = {
  me: ['Alex', 'Jordan', 'Riley'],
  other: ['Taylor', 'Morgan', 'Casey', 'Avery']
}

const LIVE_TEXT = [
  'A new measurement sample just came in from the performance trace.',
  'The latest page prepend kept the viewport stable on this run.',
  'Reply rows are now part of the scroll profile for this dataset.',
  'The chat sender is pushing another optimistic update through the list.',
  'Long tasks stayed below the previous baseline during this pass.'
]

let liveMessageCounter = 0

function buildLiveMessage(random: () => number): DemoMessage {
  const author: DemoAuthor = random() > 0.65 ? 'me' : 'other'
  const id = `live-${Date.now()}-${liveMessageCounter}`
  const kind = random() < 0.2 ? 'reply' : 'text'
  liveMessageCounter += 1

  return {
    id,
    author,
    authorName: pickOne(random, AUTHORS[author]),
    kind,
    text: pickOne(random, LIVE_TEXT),
    replyTo:
      kind === 'reply'
        ? {
            authorName: pickOne(random, AUTHORS.other),
            text: pickOne(random, LIVE_TEXT).slice(0, 80)
          }
        : undefined,
    timestamp: Date.now(),
    status: 'sending'
  }
}

export function useLiveMessages(enabled: boolean, onAppend: (message: DemoMessage) => void) {
  const onAppendRef = useRef(onAppend)

  useEffect(() => {
    onAppendRef.current = onAppend
  }, [onAppend])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const random = mulberry32(Date.now())
    let scheduleTimer: number | undefined
    const confirmTimers = new Set<number>()

    const scheduleNext = () => {
      scheduleTimer = window.setTimeout(() => {
        const message = buildLiveMessage(random)
        onAppendRef.current(message)
        const confirmTimer = window.setTimeout(() => {
          onAppendRef.current({ ...message, status: 'sent' })
          confirmTimers.delete(confirmTimer)
        }, 800)
        confirmTimers.add(confirmTimer)
        scheduleNext()
      }, 2000 + randomInt(random, 0, 2000))
    }

    scheduleNext()

    return () => {
      if (scheduleTimer) {
        window.clearTimeout(scheduleTimer)
      }
      confirmTimers.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [enabled])
}
