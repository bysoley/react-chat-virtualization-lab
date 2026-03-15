import { useEffect, useRef, useState } from 'react'
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso'
import type { DemoListItem } from '../types/message'
import { DateDivider } from './DateDivider'
import { MessageBubble } from './MessageBubble'
import { ReturnToLatestButton } from './ReturnToLatestButton'
import { UnreadDivider } from './UnreadDivider'

type VirtualizedMessageListProps = {
  items: DemoListItem[]
  firstItemIndex: number
  hasMore: boolean
  onLoadMore: () => void
  scrollParent: HTMLElement | null
}

export function VirtualizedMessageList({
  items,
  firstItemIndex,
  hasMore,
  onLoadMore,
  scrollParent
}: VirtualizedMessageListProps) {
  const [ready, setReady] = useState(false)
  const [atBottom, setAtBottom] = useState(true)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    if (scrollParent) {
      setReady(true)
    }
  }, [scrollParent])

  if (!ready || !scrollParent) {
    return <div className="message-list message-list--loading">목록 준비 중…</div>
  }

  return (
    <>
      <Virtuoso
        ref={virtuosoRef}
        alignToBottom
        atBottomStateChange={setAtBottom}
        atBottomThreshold={24}
        className="message-list message-list--virtualized"
        computeItemKey={(_, item) => item.id}
        customScrollParent={scrollParent}
        data={items}
        firstItemIndex={firstItemIndex}
        followOutput={(isAtBottom) => (isAtBottom ? 'smooth' : false)}
        initialTopMostItemIndex={Math.max(firstItemIndex + items.length - 1, 0)}
        itemContent={(_, item) => {
          if (item.kind === 'date-divider') {
            return <DateDivider label={item.label} />
          }

          if (item.kind === 'unread-divider') {
            return <UnreadDivider />
          }

          return <MessageBubble message={item} />
        }}
        overscan={80}
        startReached={() => {
          if (hasMore) {
            onLoadMore()
          }
        }}
      />
      <ReturnToLatestButton
        visible={!atBottom}
        onClick={() =>
          virtuosoRef.current?.scrollToIndex({
            index: 'LAST',
            align: 'end',
            behavior: 'smooth'
          })
        }
      />
    </>
  )
}
