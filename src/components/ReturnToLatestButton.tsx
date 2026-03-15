type ReturnToLatestButtonProps = {
  visible: boolean
  onClick: () => void
}

export function ReturnToLatestButton({
  visible,
  onClick
}: ReturnToLatestButtonProps) {
  return (
    <button
      className={`return-to-latest ${visible ? 'return-to-latest--visible' : ''}`}
      type="button"
      onClick={onClick}
    >
      최신 메시지로
    </button>
  )
}
