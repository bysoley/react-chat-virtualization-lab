import type { DemoMessage } from '../types/message'
import { ReplyPreview } from './ReplyPreview'

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
        {isOwnMessage && message.status ? (
          <span className={`message-status message-status--${message.status}`}>
            {message.status === 'sending' ? (
              <span className="message-status__dots" aria-label="Sending">
                <span />
                <span />
                <span />
              </span>
            ) : (
              <span className="message-status__sent" aria-label="Sent">
                <svg
                  aria-hidden="true"
                  className="message-status__icon"
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M2 6.5 4.5 9 10 3"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
            )}
          </span>
        ) : null}
      </div>
      <div className={`message-bubble ${isOwnMessage ? 'message-bubble--me' : 'message-bubble--other'}`}>
        {message.replyTo ? <ReplyPreview preview={message.replyTo} ownMessage={isOwnMessage} /> : null}
        {message.kind === 'image' && message.imageUrl ? (
          <div
            className="message-image-frame"
            style={{
              aspectRatio:
                message.imageWidth && message.imageHeight
                  ? `${message.imageWidth} / ${message.imageHeight}`
                  : undefined
            }}
          >
            <img
              alt={`Placeholder ${message.id}`}
              className="message-image"
              height={message.imageHeight}
              loading="lazy"
              src={message.imageUrl}
              width={message.imageWidth}
            />
          </div>
        ) : (
          <div className="message-text">{message.text}</div>
        )}
      </div>
    </article>
  )
}
