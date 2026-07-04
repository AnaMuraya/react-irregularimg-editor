'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pointsToPath, simplify } from '../geometry'
import { presetPoints } from '../shapes'
import { drawScene, exportScene, SceneOptions } from '../scene'
import {
  EditMode,
  EditorState,
  ExportResult,
  ImageTransform,
  Point,
  PresetShape,
} from '../types'

export const IDENTITY: ImageTransform = {
  rotation: 0,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

type DragKind = 'none' | 'vertex' | 'pan' | 'draw'

interface DragState {
  kind: DragKind
  index: number
  startX: number
  startY: number
  startOffsetX: number
  startOffsetY: number
}

const NO_DRAG: DragState = {
  kind: 'none',
  index: -1,
  startX: 0,
  startY: 0,
  startOffsetX: 0,
  startOffsetY: 0,
}

export interface UseEditorOptions {
  src: string
  width: number
  height: number
  initialMode: EditMode
  initialShape: PresetShape
  exportScale: number
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  backgroundColor?: string
  onChange?: (state: EditorState) => void
  onExport?: (result: ExportResult) => void
}

/**
 * The shared editor engine: owns the mask points, image transform, canvas
 * rendering, pointer interactions and export. Every editor component (full or
 * single-feature) is a thin UI wrapper around this hook.
 */
export function useEditor(opts: UseEditorOptions) {
  const {
    src,
    width,
    height,
    initialMode,
    initialShape,
    exportScale,
    crossOrigin,
    backgroundColor,
    onChange,
    onExport,
  } = opts

  const [mode, setModeState] = useState<EditMode>(initialMode)
  const [shape, setShapeState] = useState<PresetShape>(initialShape)
  const [points, setPoints] = useState<Point[]>(() =>
    initialMode === 'preset' ? presetPoints(initialShape, width, height) : []
  )
  const [transform, setTransform] = useState<ImageTransform>(IDENTITY)
  const [moveImage, setMoveImage] = useState(false)
  const [img, setImg] = useState<HTMLImageElement | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<SVGSVGElement | null>(null)
  const drag = useRef<DragState>(NO_DRAG)

  const sceneOpts = useMemo<SceneOptions>(
    () => ({ img, points, transform, vw: width, vh: height, backgroundColor }),
    [img, points, transform, width, height, backgroundColor]
  )

  // Load the image.
  useEffect(() => {
    let cancelled = false
    const image = new Image()
    if (crossOrigin !== undefined) image.crossOrigin = crossOrigin
    image.onload = () => {
      if (!cancelled) setImg(image)
    }
    image.onerror = () => {
      if (!cancelled) setImg(null)
    }
    image.src = src
    return () => {
      cancelled = true
    }
  }, [src, crossOrigin])

  // Keep the live canvas in sync.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    const ctx = canvas.getContext('2d')
    if (ctx) drawScene(ctx, sceneOpts, dpr)
  }, [sceneOpts, width, height])

  // Notify listeners of state changes.
  useEffect(() => {
    if (onChange) onChange({ mode, shape, points, transform })
  }, [mode, shape, points, transform, onChange])

  // --- Pointer plumbing -----------------------------------------------------
  const toLocal = useCallback(
    (e: React.PointerEvent): Point => {
      const rect = overlayRef.current!.getBoundingClientRect()
      const sx = rect.width ? width / rect.width : 1
      const sy = rect.height ? height / rect.height : 1
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy }
    },
    [width, height]
  )

  const capturePointer = (e: React.PointerEvent) => {
    try {
      overlayRef.current!.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic / inactive pointers can't be captured */
    }
  }

  const onOverlayPointerDown = useCallback(
    (e: React.PointerEvent) => {
      capturePointer(e)
      const p = toLocal(e)
      if (moveImage) {
        drag.current = {
          kind: 'pan',
          index: -1,
          startX: p.x,
          startY: p.y,
          startOffsetX: transform.offsetX,
          startOffsetY: transform.offsetY,
        }
        return
      }
      if (mode === 'polygon') {
        drag.current = NO_DRAG
        setPoints((prev) => [...prev, p])
      } else if (mode === 'freehand') {
        drag.current = { ...NO_DRAG, kind: 'draw' }
        setPoints([p])
      }
    },
    [moveImage, mode, transform.offsetX, transform.offsetY, toLocal]
  )

  const onOverlayPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current
      if (d.kind === 'none') return
      const p = toLocal(e)
      if (d.kind === 'pan') {
        setTransform((t) => ({
          ...t,
          offsetX: d.startOffsetX + (p.x - d.startX),
          offsetY: d.startOffsetY + (p.y - d.startY),
        }))
      } else if (d.kind === 'vertex') {
        setPoints((prev) => {
          const next = prev.slice()
          next[d.index] = p
          return next
        })
      } else if (d.kind === 'draw') {
        setPoints((prev) => [...prev, p])
      }
    },
    [toLocal]
  )

  const endDrag = useCallback((e: React.PointerEvent) => {
    try {
      if (overlayRef.current!.hasPointerCapture(e.pointerId)) {
        overlayRef.current!.releasePointerCapture(e.pointerId)
      }
    } catch {
      /* ignore */
    }
    if (drag.current.kind === 'draw') setPoints((prev) => simplify(prev, 4))
    drag.current = NO_DRAG
  }, [])

  const onVertexPointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.stopPropagation()
      capturePointer(e)
      drag.current = { ...NO_DRAG, kind: 'vertex', index }
    },
    []
  )

  const removeVertex = useCallback((index: number) => {
    setPoints((prev) =>
      prev.length > 3 ? prev.filter((_, i) => i !== index) : prev
    )
  }, [])

  /** Nudge a vertex by (dx, dy) pixels, clamped to the frame. Keyboard editing. */
  const movePoint = useCallback(
    (index: number, dx: number, dy: number) => {
      setPoints((prev) => {
        const p = prev[index]
        if (!p) return prev
        const next = prev.slice()
        next[index] = {
          x: clamp(p.x + dx, 0, width),
          y: clamp(p.y + dy, 0, height),
        }
        return next
      })
    },
    [width, height]
  )

  // --- Actions --------------------------------------------------------------
  const setMode = useCallback(
    (next: EditMode) => {
      setModeState(next)
      setMoveImage(false)
      if (next === 'preset') setPoints(presetPoints(shape, width, height))
      else setPoints([])
    },
    [shape, width, height]
  )

  const setShape = useCallback(
    (next: PresetShape) => {
      setShapeState(next)
      setModeState('preset')
      setPoints(presetPoints(next, width, height))
    },
    [width, height]
  )

  const clearPoints = useCallback(() => setPoints([]), [])

  const reset = useCallback(() => {
    setTransform(IDENTITY)
    setMoveImage(false)
    setModeState(initialMode)
    setShapeState(initialShape)
    setPoints(
      initialMode === 'preset' ? presetPoints(initialShape, width, height) : []
    )
  }, [initialMode, initialShape, width, height])

  const runExport = useCallback(() => exportScene(sceneOpts, exportScale), [
    sceneOpts,
    exportScale,
  ])

  const download = useCallback(
    async (filename = 'irregular-image.png') => {
      const result = await runExport()
      const a = document.createElement('a')
      a.href = result.dataUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      if (onExport) onExport(result)
    },
    [runExport, onExport]
  )

  const exportWithCallback = useCallback(async () => {
    const result = await runExport()
    if (onExport) onExport(result)
    return result
  }, [runExport, onExport])

  const getState = useCallback(
    (): EditorState => ({ mode, shape, points, transform }),
    [mode, shape, points, transform]
  )

  return {
    // state
    mode,
    shape,
    points,
    transform,
    moveImage,
    img,
    // derived
    outline: pointsToPath(points),
    showHandles: mode === 'polygon' && !moveImage,
    // refs
    canvasRef,
    overlayRef,
    // pointer handlers
    onOverlayPointerDown,
    onOverlayPointerMove,
    endDrag,
    onVertexPointerDown,
    removeVertex,
    movePoint,
    // actions
    setMode,
    setShape,
    setMoveImage,
    setTransform,
    clearPoints,
    reset,
    // export
    runExport: exportWithCallback,
    download,
    getState,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export type EditorEngine = ReturnType<typeof useEditor>
