// Full editor (all features)
export { IrregularImageEditor } from './IrregularImageEditor'
export type { IrregularImageEditorProps } from './IrregularImageEditor'

// Single-feature editors (also importable from their own subpaths)
export { FreehandEditor } from './editors/FreehandEditor'
export type { FreehandEditorProps } from './editors/FreehandEditor'
export { PolygonEditor } from './editors/PolygonEditor'
export type { PolygonEditorProps } from './editors/PolygonEditor'
export { PresetEditor } from './editors/PresetEditor'
export type { PresetEditorProps } from './editors/PresetEditor'

// Theming / style overrides
export {
  makeParts,
  injectStyles,
  DEFAULT_STYLESHEET,
  STYLE_ELEMENT_ID,
} from './theme'
export type {
  PartKey,
  EditorClassNames,
  EditorStyles,
  EditorTheme,
  StyleProps,
} from './theme'
export type { BaseEditorProps } from './core/EditorShell'

// Utilities
export { presetPoints } from './shapes'
export { drawScene, exportScene, buildSvg } from './scene'
export { pointsToPath, simplify } from './geometry'

// Types
export type {
  Point,
  EditMode,
  PresetShape,
  ImageTransform,
  ExportResult,
  EditorState,
  IrregularImageEditorHandle,
} from './types'
