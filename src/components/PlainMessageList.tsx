import type { DemoMessage } from '../types/message'
import { MessageBubble } from './MessageBubble'

type PlainMessageListProps = {
  messages: DemoMessage[]
}

export function PlainMessageList({ messages }: PlainMessageListProps) {
  return (
    <div className="message-list message-list--plain">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}
