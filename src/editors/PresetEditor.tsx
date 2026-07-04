'use client'

import React, { forwardRef, useImperativeHandle } from 'react'
import { makeParts } from '../theme'
import { IrregularImageEditorHandle, PresetShape } from '../types'
import { useEditor } from '../core/useEditor'
import { BaseEditorProps, EditorShell, toHandle } from '../core/EditorShell'
import {
  ActionControls,
  AdjustControls,
  ALL_PRESET_SHAPES,
  MoveImageToggle,
  ShapeSelect,
} from '../core/controls'

export interface PresetEditorProps extends BaseEditorProps {
  /** Which preset shapes to offer. Default: all of them. */
  shapes?: PresetShape[]
  /** Initial shape. Defaults to the first entry of `shapes`. */
  initialShape?: PresetShape
}

/** Preset-shape-only editor: pick from a shape list and mask to it. */
export const PresetEditor = forwardRef<
  IrregularImageEditorHandle,
  PresetEditorProps
>(function PresetEditor(props, ref) {
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
    shapes = ALL_PRESET_SHAPES,
    initialShape,
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
    initialMode: 'preset',
    initialShape: initialShape ?? shapes[0] ?? 'circle',
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
      hint="Pick a shape from the toolbar."
      className={className}
      style={style}
      styleProps={{ theme, classNames, styles, cssVars, injectDefaultStyles }}
      toolbar={
        <>
          <div {...part('group')}>
            <ShapeSelect engine={engine} part={part} shapes={shapes} />
            <MoveImageToggle engine={engine} part={part} />
          </div>
          <AdjustControls engine={engine} part={part} />
          <ActionControls engine={engine} part={part} downloadName={downloadName} />
        </>
      }
    />
  )
})
