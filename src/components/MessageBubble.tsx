import type { DemoMessage } from '../types/message'

type MessageBubbleProps = {
  message: DemoMessage
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(timestamp)
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOwnMessage = message.author === 'me'

  return (
    <article
      className={`message-item ${isOwnMessage ? 'message-item--me' : 'message-item--other'}`}
      data-message-id={message.id}
    >
      <div className="message-meta">
        <span className="message-author">{message.authorName}</span>
        <span className="message-time">{formatTimestamp(message.timestamp)}</span>
      </div>
      <div className={`message-bubble ${isOwnMessage ? 'message-bubble--me' : 'message-bubble--other'}`}>
        {message.kind === 'image' && message.imageUrl ? (
          <img
            alt={`Placeholder ${message.id}`}
            className="message-image"
            loading="lazy"
            src={message.imageUrl}
          />
        ) : (
          <div className="message-text">{message.text}</div>
        )}
      </div>
    </article>
  )
}
