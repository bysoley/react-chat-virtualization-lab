import { useState } from 'react'

type MessageSenderProps = {
  onSend: (text: string) => void
}

export function MessageSender({ onSend }: MessageSenderProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const nextValue = value.trim()
    if (!nextValue) {
      return
    }

    onSend(nextValue)
    setValue('')
  }

  return (
    <form
      className="message-sender"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <textarea
        className="message-sender__input"
        placeholder="메시지를 입력하세요…"
        rows={2}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
      />
      <button className="message-sender__button" type="submit">
        전송
      </button>
    </form>
  )
}
