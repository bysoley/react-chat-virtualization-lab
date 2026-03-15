import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useQueryParams } from '../hooks/useQueryParams'
import { useLiveMessages } from '../hooks/useLiveMessages'
import { usePaginatedMessages } from '../hooks/usePaginatedMessages'
import type { DemoMessage, PerfParams } from '../types/message'
import { MessageSender } from './MessageSender'
import { PlainMessageList } from './PlainMessageList'
import { Toolbar } from './Toolbar'
import { VirtualizedMessageList } from './VirtualizedMessageList'

export function ChatShell() {
  const { params, applyParams } = useQueryParams()
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
  const pendingTimeouts = useRef<number[]>([])
  const [isPending, startTransition] = useTransition()

  const handleApply = useCallback(
    (nextParams: PerfParams) => {
      startTransition(() => applyParams(nextParams))
    },
    [applyParams]
  )

  const { items, firstItemIndex, hasMore, loadMore, appendMessage } =
    usePaginatedMessages(params)

  useLiveMessages(params.liveMessages, appendMessage)

  useEffect(() => {
    if (params.mode === 'plain' && scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [params.mode, items, scrollContainer])

  useEffect(() => {
    return () => {
      pendingTimeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  const handleSend = useCallback(
    (text: string) => {
      const message: DemoMessage = {
        id: `sender-${Date.now()}`,
        author: 'me',
        authorName: 'Alex',
        kind: 'text',
        text,
        timestamp: Date.now(),
        status: 'sending'
      }

      appendMessage(message)

      const timeoutId = window.setTimeout(() => {
        appendMessage({ ...message, status: 'sent' })
        pendingTimeouts.current = pendingTimeouts.current.filter((entry) => entry !== timeoutId)
      }, 600)

      pendingTimeouts.current.push(timeoutId)
    },
    [appendMessage]
  )

  return (
    <main className="app-shell">
      <div className="main-layout">
        <aside className="controls-panel">
          <header className="app-header">
            <p className="eyebrow">React 18 + react-virtuoso 4.17</p>
            <h1>채팅 가상화 테스트</h1>
          </header>

          <Toolbar
            isPending={isPending}
            onApply={handleApply}
            params={params}
          />

        </aside>

        <div className="chat-panel__content" aria-busy={isPending}>
          {isPending && (
            <div className="chat-loading-overlay">
              <div className="chat-spinner" />
            </div>
          )}
          <div
            ref={(node) => {
              setScrollContainer(node)
            }}
            className="chat-container"
          >
            {params.mode === 'plain' ? (
              <PlainMessageList items={items} />
            ) : (
              <VirtualizedMessageList
                key={`${params.items}-${params.imageRatio}-${params.replyRatio}-${params.pageSize}`}
                firstItemIndex={firstItemIndex}
                hasMore={hasMore}
                items={items}
                onLoadMore={loadMore}
                scrollParent={scrollContainer}
              />
            )}
          </div>
          <MessageSender onSend={handleSend} />
        </div>
      </div>
    </main>
  )
}
