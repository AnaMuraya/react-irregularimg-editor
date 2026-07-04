'use client'

import React, { forwardRef, useImperativeHandle } from 'react'
import { makeParts } from '../theme'
import { IrregularImageEditorHandle } from '../types'
import { useEditor } from '../core/useEditor'
import { BaseEditorProps, EditorShell, toHandle } from '../core/EditorShell'
import {
  ActionControls,
  AdjustControls,
  MoveImageToggle,
  ToolButton,
} from '../core/controls'

export interface FreehandEditorProps extends BaseEditorProps {}

/** Freeform-only editor: press and drag to draw an outline, then export. */
export const FreehandEditor = forwardRef<
  IrregularImageEditorHandle,
  FreehandEditorProps
>(function FreehandEditor(props, ref) {
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
    initialMode: 'freehand',
    initialShape: 'circle',
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
      hint="Press and drag inside the frame to draw a freeform outline."
      className={className}
      style={style}
      styleProps={{ theme, classNames, styles, cssVars, injectDefaultStyles }}
      toolbar={
        <>
          <div {...part('group')}>
            <MoveImageToggle engine={engine} part={part} />
            <ToolButton onClick={engine.clearPoints} part={part}>
              Clear
            </ToolButton>
          </div>
          <AdjustControls engine={engine} part={part} />
          <ActionControls engine={engine} part={part} downloadName={downloadName} />
        </>
      }
    />
  )
})
