'use client'

import React from 'react'
import { makeParts } from '../theme'
import { EditorEngine } from './useEditor'
import { PresetShape } from '../types'

type Part = ReturnType<typeof makeParts>

export function ToolButton(props: {
  active?: boolean
  primary?: boolean
  title?: string
  onClick: () => void
  part: Part
  children: React.ReactNode
}) {
  const { active, primary, title, onClick, part, children } = props
  const p = part('button', [
    active ? 'buttonActive' : undefined,
    primary ? 'primaryButton' : undefined,
  ])
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active === undefined ? undefined : active}
      {...p}
    >
      {children}
    </button>
  )
}

export function Slider(props: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  part: Part
}) {
  const { label, min, max, step, value, onChange, part } = props
  return (
    <label {...part('sliderLabel')}>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        {...part('slider')}
      />
    </label>
  )
}

/** Rotate + Zoom sliders — shared by every editor. */
export function AdjustControls({ engine, part }: { engine: EditorEngine; part: Part }) {
  return (
    <div {...part('group')}>
      <Slider
        label="Rotate"
        min={-180}
        max={180}
        step={1}
        value={engine.transform.rotation}
        onChange={(v) => engine.setTransform({ ...engine.transform, rotation: v })}
        part={part}
      />
      <Slider
        label="Zoom"
        min={0.2}
        max={4}
        step={0.01}
        value={engine.transform.scale}
        onChange={(v) => engine.setTransform({ ...engine.transform, scale: v })}
        part={part}
      />
    </div>
  )
}

/** Reset / Export / Download — shared by every editor. */
export function ActionControls({
  engine,
  part,
  downloadName,
}: {
  engine: EditorEngine
  part: Part
  downloadName?: string
}) {
  return (
    <div {...part('group')}>
      <ToolButton onClick={engine.reset} part={part}>
        Reset
      </ToolButton>
      <ToolButton onClick={() => void engine.runExport()} part={part}>
        Export
      </ToolButton>
      <ToolButton
        primary
        onClick={() => void engine.download(downloadName)}
        part={part}
      >
        Download PNG
      </ToolButton>
    </div>
  )
}

export function MoveImageToggle({ engine, part }: { engine: EditorEngine; part: Part }) {
  return (
    <ToolButton
      active={engine.moveImage}
      title="Drag inside the frame to reposition the image"
      onClick={() => engine.setMoveImage(!engine.moveImage)}
      part={part}
    >
      Move image
    </ToolButton>
  )
}

export const ALL_PRESET_SHAPES: PresetShape[] = [
  'circle',
  'ellipse',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'star',
  'heart',
]

export function ShapeSelect({
  engine,
  part,
  shapes = ALL_PRESET_SHAPES,
}: {
  engine: EditorEngine
  part: Part
  shapes?: PresetShape[]
}) {
  return (
    <select
      value={engine.shape}
      onChange={(e) => engine.setShape(e.target.value as PresetShape)}
      {...part('select')}
    >
      {shapes.map((s) => (
        <option key={s} value={s}>
          {s[0].toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  )
}
