import type { DemoReplyPreview } from '../types/message'

type ReplyPreviewProps = {
  preview: DemoReplyPreview
  ownMessage: boolean
}

export function ReplyPreview({ preview, ownMessage }: ReplyPreviewProps) {
  return (
    <div className={`reply-preview ${ownMessage ? 'reply-preview--me' : 'reply-preview--other'}`}>
      <span className="reply-preview__author">{preview.authorName}</span>
      <span className="reply-preview__text">{preview.text}</span>
    </div>
  )
}
