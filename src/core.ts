// Low-level building blocks for composing a custom editor UI.
export { useEditor } from './core/useEditor'
export type { UseEditorOptions, EditorEngine } from './core/useEditor'
export { EditorFrame } from './core/EditorFrame'
export { EditorShell, toHandle } from './core/EditorShell'
export type { BaseEditorProps, EditorShellProps } from './core/EditorShell'
export {
  ToolButton,
  Slider,
  AdjustControls,
  ActionControls,
  MoveImageToggle,
  ShapeSelect,
  ALL_PRESET_SHAPES,
} from './core/controls'
export { drawScene, exportScene, buildSvg, imageToDataUrl } from './scene'
export { pointsToPath, tracePath, simplify, distSq } from './geometry'
export { presetPoints } from './shapes'
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
export type * from './types'
