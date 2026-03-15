import type { DemoListItem } from '../types/message'
import { DateDivider } from './DateDivider'
import { MessageBubble } from './MessageBubble'
import { UnreadDivider } from './UnreadDivider'

type PlainMessageListProps = {
  items: DemoListItem[]
}

export function PlainMessageList({ items }: PlainMessageListProps) {
  return (
    <div className="message-list message-list--plain">
      {items.map((item) =>
        item.kind === 'date-divider' ? (
          <DateDivider key={item.id} label={item.label} />
        ) : item.kind === 'unread-divider' ? (
          <UnreadDivider key={item.id} />
        ) : (
          <MessageBubble key={item.id} message={item} />
        )
      )}
    </div>
  )
}
