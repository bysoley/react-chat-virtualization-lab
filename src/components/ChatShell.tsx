import { useMemo, useState } from 'react'
import { generateMessages } from '../mock/generateMessages'
import { useQueryParams } from '../hooks/useQueryParams'
import { PlainMessageList } from './PlainMessageList'
import { Toolbar } from './Toolbar'
import { VirtualizedMessageList } from './VirtualizedMessageList'

const FIXED_SEED = 1337

export function ChatShell() {
  const { params, setMode, setItems, setImageRatio, reset } = useQueryParams()
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)

  const messages = useMemo(
    () =>
      generateMessages({
        count: params.items,
        imageRatio: params.imageRatio,
        seed: FIXED_SEED
      }),
    [params.imageRatio, params.items]
  )

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">React 18 + react-virtuoso 4.17</p>
          <h1>Chat Virtualization Lab</h1>
        </div>
        <p className="header-copy">
          A standalone demo for comparing plain rendering with virtualized chat
          message lists under a deterministic dataset.
        </p>
      </header>

      <Toolbar
        params={params}
        onImageRatioChange={setImageRatio}
        onItemsChange={setItems}
        onModeChange={setMode}
        onReset={reset}
      />

      <section className="chat-panel">
        <div className="chat-panel__sidebar">
          <h2>Scenario</h2>
          <ul>
            <li>Seed: {FIXED_SEED}</li>
            <li>Dataset: deterministic mock conversation</li>
            <li>Media source: picsum.photos placeholder images</li>
          </ul>
          <p>
            Use the toolbar or edit the URL query string to share a specific test
            setup.
          </p>
        </div>

        <div className="chat-panel__content">
          <div
            ref={(node) => {
              setScrollContainer(node)
            }}
            className="chat-container"
          >
            {params.mode === 'plain' ? (
              <PlainMessageList messages={messages} />
            ) : (
              <VirtualizedMessageList
                messages={messages}
                scrollParent={scrollContainer}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
