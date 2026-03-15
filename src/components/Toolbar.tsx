import type { PerfParams, RenderMode } from '../types/message'

type ToolbarProps = {
  params: PerfParams
  onModeChange: (mode: RenderMode) => void
  onItemsChange: (items: number) => void
  onImageRatioChange: (ratio: number) => void
  onReset: () => void
}

export function Toolbar({
  params,
  onModeChange,
  onItemsChange,
  onImageRatioChange,
  onReset
}: ToolbarProps) {
  return (
    <section className="toolbar" aria-label="Performance controls">
      <div className="toolbar-controls">
        <label className="toolbar-field">
          <span>Render mode</span>
          <select
            value={params.mode}
            onChange={(event) => onModeChange(event.target.value as RenderMode)}
          >
            <option value="virtualized">Virtualized</option>
            <option value="plain">Plain</option>
          </select>
        </label>

        <label className="toolbar-field">
          <span>Messages</span>
          <input
            max={10000}
            min={10}
            step={10}
            type="number"
            value={params.items}
            onChange={(event) => onItemsChange(Number(event.target.value))}
          />
        </label>

        <label className="toolbar-field">
          <span>Image ratio</span>
          <input
            max={1}
            min={0}
            step={0.05}
            type="number"
            value={params.imageRatio}
            onChange={(event) => onImageRatioChange(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="toolbar-summary">
        <p>
          Mode: <strong>{params.mode}</strong>
        </p>
        <p>
          Messages: <strong>{params.items.toLocaleString()}</strong>
        </p>
        <p>
          Image ratio: <strong>{Math.round(params.imageRatio * 100)}%</strong>
        </p>
      </div>

      <button className="toolbar-reset" type="button" onClick={onReset}>
        Reset defaults
      </button>
    </section>
  )
}
