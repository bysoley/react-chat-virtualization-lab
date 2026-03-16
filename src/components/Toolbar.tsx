import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_PARAMS } from '../hooks/useQueryParams'
import type { PerfParams, RenderMode } from '../types/message'

type ToolbarProps = {
  params: PerfParams
  isPending: boolean
  onApply: (params: PerfParams) => void
}

function areParamsEqual(left: PerfParams, right: PerfParams) {
  return (
    left.mode === right.mode &&
    left.items === right.items &&
    left.imageRatio === right.imageRatio &&
    left.replyRatio === right.replyRatio &&
    left.pageSize === right.pageSize &&
    left.liveMessages === right.liveMessages
  )
}

function getModeLabel(mode: RenderMode) {
  if (mode === 'virtualized') {
    return '가상화'
  }

  if (mode === 'plain-full') {
    return '일반 전체'
  }

  return '일반 페이지'
}

export function Toolbar({ params, isPending, onApply }: ToolbarProps) {
  const [draft, setDraft] = useState<PerfParams>(params)

  useEffect(() => {
    setDraft(params)
  }, [params])

  const hasChanges = useMemo(() => !areParamsEqual(draft, params), [draft, params])

  return (
    <section className="toolbar" aria-busy={isPending} aria-label="성능 테스트 컨트롤">
      <div className="toolbar-controls">
        <label className="toolbar-field">
          <span>렌더 방식</span>
          <select
            value={draft.mode}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                mode: event.target.value as RenderMode
              }))
            }
          >
            <option value="virtualized">가상화</option>
            <option value="plain">일반 페이지</option>
            <option value="plain-full">일반 전체</option>
          </select>
        </label>

        <label className="toolbar-field">
          <span>메시지 수</span>
          <input
            max={10000}
            min={10}
            step={10}
            type="number"
            value={draft.items}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                items: Number(event.target.value)
              }))
            }
          />
        </label>

        <label className="toolbar-field">
          <span>이미지 비율</span>
          <input
            max={1}
            min={0}
            step={0.05}
            type="number"
            value={draft.imageRatio}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                imageRatio: Number(event.target.value)
              }))
            }
          />
        </label>

        <label className="toolbar-field">
          <span>답장 비율</span>
          <input
            max={0.5}
            min={0}
            step={0.05}
            type="number"
            value={draft.replyRatio}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                replyRatio: Number(event.target.value)
              }))
            }
          />
        </label>

        <label className="toolbar-field">
          <span>페이지 크기</span>
          <select
            value={draft.pageSize}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                pageSize: Number(event.target.value)
              }))
            }
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
            <option value={300}>300</option>
          </select>
        </label>

        <label className="toolbar-field toolbar-field--checkbox">
          <span>실시간 메시지</span>
          <input
            checked={draft.liveMessages}
            type="checkbox"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                liveMessages: event.target.checked
              }))
            }
          />
        </label>
      </div>

      <div className="toolbar-summary">
        <p>
          렌더: <strong>{getModeLabel(params.mode)}</strong>
        </p>
        <p>
          메시지: <strong>{params.items.toLocaleString('ko-KR')}개</strong>
        </p>
        <p>
          이미지: <strong>{Math.round(params.imageRatio * 100)}%</strong>
        </p>
        <p>
          답장: <strong>{Math.round(params.replyRatio * 100)}%</strong>
        </p>
        <p>
          페이지: <strong>{params.pageSize}</strong>
        </p>
        {hasChanges ? <p className="toolbar-pending">미적용 변경 있음</p> : null}
      </div>

      <div className="toolbar-actions">
        <button
          className="toolbar-reset"
          type="button"
          onClick={() => setDraft(DEFAULT_PARAMS)}
        >
          기본값
        </button>
        <button
          className="toolbar-apply"
          disabled={!hasChanges || isPending}
          type="button"
          onClick={() => onApply(draft)}
        >
          적용
        </button>
      </div>
    </section>
  )
}
