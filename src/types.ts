export interface Point {
  x: number
  y: number
}

/** How the user defines the mask outline. */
export type EditMode = 'preset' | 'polygon' | 'freehand'

/** Built-in irregular shapes available in "preset" mode. */
export type PresetShape =
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'heart'

/** Position / rotation / zoom of the image inside the mask. */
export interface ImageTransform {
  /** Rotation in degrees. */
  rotation: number
  /** Uniform scale multiplier (1 = cover the frame). */
  scale: number
  /** Horizontal pan in viewport pixels. */
  offsetX: number
  /** Vertical pan in viewport pixels. */
  offsetY: number
}

export interface ExportResult {
  /** PNG blob with transparency outside the mask. */
  blob: Blob
  /** PNG data URL (same pixels as `blob`). */
  dataUrl: string
  /** Standalone SVG string with an embedded image and clip-path. */
  svg: string
  /** Output pixel width. */
  width: number
  /** Output pixel height. */
  height: number
}

/** Full editor state, exposed via the imperative handle. */
export interface EditorState {
  mode: EditMode
  shape: PresetShape
  /** Mask outline points in viewport pixel coordinates. */
  points: Point[]
  transform: ImageTransform
}

export interface IrregularImageEditorHandle {
  /** Render the current crop and return PNG + SVG output. */
  export: () => Promise<ExportResult>
  /** Trigger a browser download of the PNG. */
  download: (filename?: string) => Promise<void>
  /** Reset mask and adjustments to their initial values. */
  reset: () => void
  /** Read the current editor state. */
  getState: () => EditorState
}
