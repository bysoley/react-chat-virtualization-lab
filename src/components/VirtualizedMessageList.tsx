import { useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { DemoMessage } from '../types/message'
import { MessageBubble } from './MessageBubble'

type VirtualizedMessageListProps = {
  messages: DemoMessage[]
  scrollParent: HTMLElement | null
}

export function VirtualizedMessageList({
  messages,
  scrollParent
}: VirtualizedMessageListProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (scrollParent) {
      setReady(true)
    }
  }, [scrollParent])

  if (!ready || !scrollParent) {
    return <div className="message-list message-list--loading">Preparing list…</div>
  }

  return (
    <Virtuoso
      alignToBottom
      className="message-list message-list--virtualized"
      computeItemKey={(_, message) => message.id}
      customScrollParent={scrollParent}
      data={messages}
      initialTopMostItemIndex={messages.length - 1}
      itemContent={(_, message) => <MessageBubble message={message} />}
    />
  )
}
