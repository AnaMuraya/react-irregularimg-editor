'use client'

import React, { forwardRef, useImperativeHandle } from 'react'
import { makeParts } from './theme'
import { EditMode, IrregularImageEditorHandle, PresetShape } from './types'
import { useEditor } from './core/useEditor'
import { BaseEditorProps, EditorShell, toHandle } from './core/EditorShell'
import {
  ActionControls,
  AdjustControls,
  ALL_PRESET_SHAPES,
  MoveImageToggle,
  ShapeSelect,
  ToolButton,
} from './core/controls'

export interface IrregularImageEditorProps extends BaseEditorProps {
  /** Initial mask mode. Default "preset". */
  initialMode?: EditMode
  /** Initial preset shape. Default "circle". */
  initialShape?: PresetShape
  /** Which preset shapes to offer in the dropdown. Default: all. */
  shapes?: PresetShape[]
  /** Which modes to expose in the mode switcher. Default: all three. */
  modes?: EditMode[]
}

const MODE_LABEL: Record<EditMode, string> = {
  preset: 'Shape',
  polygon: 'Polygon',
  freehand: 'Freehand',
}

const HINT: Record<EditMode, string> = {
  preset: 'Pick a shape from the toolbar.',
  polygon:
    'Click to place points (at least 3). Drag to move, double-click to remove.',
  freehand: 'Press and drag inside the frame to draw a freeform outline.',
}

/** The full editor: freeform + polygon + preset masks with a mode switcher. */
export const IrregularImageEditor = forwardRef<
  IrregularImageEditorHandle,
  IrregularImageEditorProps
>(function IrregularImageEditor(props, ref) {
  const {
    width = 500,
    height = 400,
    exportScale = 2,
    showToolbar = true,
    downloadName,
    src,
    crossOrigin,
    backgroundColor,
    onChange,
    onExport,
    className,
    style,
    theme,
    classNames,
    styles,
    cssVars,
    injectDefaultStyles,
    initialMode = 'preset',
    initialShape = 'circle',
    shapes = ALL_PRESET_SHAPES,
    modes = ['preset', 'polygon', 'freehand'],
  } = props

  const engine = useEditor({
    src,
    width,
    height,
    exportScale,
    crossOrigin,
    backgroundColor,
    onChange,
    onExport,
    initialMode,
    initialShape,
  })

  useImperativeHandle(ref, () => toHandle(engine), [
    engine.runExport,
    engine.download,
    engine.reset,
    engine.getState,
  ])

  const part = makeParts(classNames, styles)

  return (
    <EditorShell
      engine={engine}
      width={width}
      height={height}
      showToolbar={showToolbar}
      hint={HINT[engine.mode]}
      className={className}
      style={style}
      styleProps={{ theme, classNames, styles, cssVars, injectDefaultStyles }}
      toolbar={
        <>
          <div {...part('group')}>
            {modes.map((m) => (
              <ToolButton
                key={m}
                active={engine.mode === m && !engine.moveImage}
                onClick={() => engine.setMode(m)}
                part={part}
              >
                {MODE_LABEL[m]}
              </ToolButton>
            ))}
            <MoveImageToggle engine={engine} part={part} />
          </div>

          {engine.mode === 'preset' && (
            <div {...part('group')}>
              <ShapeSelect engine={engine} part={part} shapes={shapes} />
            </div>
          )}

          <AdjustControls engine={engine} part={part} />
          <ActionControls engine={engine} part={part} downloadName={downloadName} />
        </>
      }
    />
  )
})
