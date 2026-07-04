'use client'

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

  const onHandleKeyDown = (ev: React.KeyboardEvent, i: number) => {
    const step = ev.shiftKey ? 10 : 2
    switch (ev.key) {
      case 'ArrowUp':
        e.movePoint(i, 0, -step)
        break
      case 'ArrowDown':
        e.movePoint(i, 0, step)
        break
      case 'ArrowLeft':
        e.movePoint(i, -step, 0)
        break
      case 'ArrowRight':
        e.movePoint(i, step, 0)
        break
      case 'Delete':
      case 'Backspace':
        e.removeVertex(i)
        break
      default:
        return
    }
    ev.preventDefault()
    ev.stopPropagation()
  }

  return (
    <div
      className={frame.className}
      style={{ width, height, ...frame.style }}
      role="group"
      aria-label="Image crop editor"
    >
      <canvas ref={e.canvasRef} aria-hidden="true" {...part('canvas')} />

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
            aria-hidden="true"
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
                tabIndex={0}
                role="button"
                aria-label={`Mask point ${i + 1} of ${e.points.length}. Arrow keys move it, Delete removes it.`}
                onPointerDown={(ev) => e.onVertexPointerDown(ev, i)}
                onKeyDown={(ev) => onHandleKeyDown(ev, i)}
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
