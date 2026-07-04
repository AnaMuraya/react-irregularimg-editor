'use client'

import React, { useEffect } from 'react'
import {
  injectStyles,
  makeParts,
  StyleProps,
} from '../theme'
import { EditorState, ExportResult } from '../types'
import { EditorEngine } from './useEditor'
import { EditorFrame } from './EditorFrame'

/** Props common to every editor component. */
export interface BaseEditorProps extends StyleProps {
  /** Image source: a URL, blob URL, or data URL. */
  src: string
  /** Viewport width in CSS pixels. Default 500. */
  width?: number
  /** Viewport height in CSS pixels. Default 400. */
  height?: number
  /** Resolution multiplier for the exported PNG/SVG. Default 2. */
  exportScale?: number
  /** Set for cross-origin images (server must allow CORS) so export isn't blocked. */
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  /** Solid color painted inside the mask behind the image. Default transparent. */
  backgroundColor?: string
  /** Render the built-in toolbar. Default true. */
  showToolbar?: boolean
  /** Filename used by the toolbar's Download button. */
  downloadName?: string
  /** Called after a toolbar/imperative export. */
  onExport?: (result: ExportResult) => void
  /** Called whenever the mask or adjustments change. */
  onChange?: (state: EditorState) => void
  className?: string
  style?: React.CSSProperties
}

export interface EditorShellProps {
  engine: EditorEngine
  width: number
  height: number
  hint?: string
  showToolbar: boolean
  toolbar: React.ReactNode
  style?: React.CSSProperties
  className?: string
  styleProps: StyleProps
}

/** Assembles the root wrapper, optional toolbar, and image frame. */
export function EditorShell({
  engine,
  width,
  height,
  hint,
  showToolbar,
  toolbar,
  style,
  className,
  styleProps,
}: EditorShellProps) {
  const {
    theme = 'light',
    classNames,
    styles,
    cssVars,
    injectDefaultStyles = true,
  } = styleProps

  useEffect(() => {
    if (injectDefaultStyles) injectStyles()
  }, [injectDefaultStyles])

  const part = makeParts(classNames, styles)
  const root = part('root')

  return (
    <div
      className={[root.className, className].filter(Boolean).join(' ')}
      data-irr-theme={theme}
      style={{ ...cssVars, ...root.style, ...style }}
    >
      {showToolbar && <div {...part('toolbar')}>{toolbar}</div>}
      <EditorFrame engine={engine} width={width} height={height} hint={hint} part={part} />
    </div>
  )
}

/** Build the standard imperative handle from an engine. */
export function toHandle(engine: EditorEngine) {
  return {
    export: engine.runExport,
    download: engine.download,
    reset: engine.reset,
    getState: engine.getState,
  }
}
