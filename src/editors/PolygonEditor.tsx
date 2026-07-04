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

export interface PolygonEditorProps extends BaseEditorProps {}

/** Polygon-only editor: click to place vertices, drag to move, export. */
export const PolygonEditor = forwardRef<
  IrregularImageEditorHandle,
  PolygonEditorProps
>(function PolygonEditor(props, ref) {
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
    initialMode: 'polygon',
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
      hint="Click to place points (at least 3). Drag to move, double-click to remove."
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
