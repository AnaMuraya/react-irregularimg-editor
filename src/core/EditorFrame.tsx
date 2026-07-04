import React from 'react'
import { makeParts } from '../theme'
import { EditorEngine } from './useEditor'

export interface EditorFrameProps {
  engine: EditorEngine
  width: number
  height: number
  hint?: string
  part: ReturnType<typeof makeParts>
}

/** The image surface: live canvas + interactive SVG overlay + empty-state hint. */
export function EditorFrame({
  engine,
  width,
  height,
  hint,
  part,
}: EditorFrameProps) {
  const e = engine
  const frame = part('frame')
  return (
    <div
      className={frame.className}
      style={{ width, height, ...frame.style }}
    >
      <canvas ref={e.canvasRef} {...part('canvas')} />

      <svg
        ref={e.overlayRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onPointerDown={e.onOverlayPointerDown}
        onPointerMove={e.onOverlayPointerMove}
        onPointerUp={e.endDrag}
        onPointerCancel={e.endDrag}
        {...withCursor(part('overlay'), e)}
      >
        {e.points.length >= 2 && (
          <path
            d={e.outline}
            fill="none"
            stroke="var(--irr-outline-color, #6366f1)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
            {...part('outline')}
          />
        )}
        {e.showHandles &&
          e.points.map((p, i) => {
            const h = part('handle')
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={6}
                fill="var(--irr-handle-fill, #fff)"
                stroke="var(--irr-handle-stroke, #6366f1)"
                strokeWidth={2}
                className={h.className}
                style={{ cursor: 'grab', ...h.style }}
                onPointerDown={(ev) => e.onVertexPointerDown(ev, i)}
                onDoubleClick={(ev) => {
                  ev.stopPropagation()
                  e.removeVertex(i)
                }}
              />
            )
          })}
      </svg>

      {e.points.length < 3 && hint && (
        <div {...part('hint')}>{hint}</div>
      )}
    </div>
  )
}

function withCursor(
  base: { className: string; style?: React.CSSProperties },
  e: EditorEngine
) {
  const cursor = e.moveImage
    ? 'move'
    : e.mode === 'preset'
    ? 'default'
    : 'crosshair'
  return { className: base.className, style: { cursor, ...base.style } }
}
