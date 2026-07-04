import React from 'react'

/** Every visually distinct part of an editor that can be re-styled. */
export type PartKey =
  | 'root'
  | 'toolbar'
  | 'group'
  | 'spacer'
  | 'button'
  | 'buttonActive'
  | 'primaryButton'
  | 'select'
  | 'sliderLabel'
  | 'slider'
  | 'frame'
  | 'canvas'
  | 'overlay'
  | 'outline'
  | 'handle'
  | 'hint'

/** Per-part class names appended to the defaults. */
export type EditorClassNames = Partial<Record<PartKey, string>>

/** Per-part inline styles, applied with the highest priority. */
export type EditorStyles = Partial<Record<PartKey, React.CSSProperties>>

/** Built-in colour themes. */
export type EditorTheme = 'light' | 'dark'

export interface StyleProps {
  /** Colour theme for the default stylesheet. Default "light". */
  theme?: EditorTheme
  /** Extra class names merged per part. */
  classNames?: EditorClassNames
  /** Inline styles merged per part (highest priority). */
  styles?: EditorStyles
  /** CSS custom properties set on the root, e.g. `{ '--irr-accent': '#e11d48' }`. */
  cssVars?: React.CSSProperties
  /** Inject the built-in stylesheet. Set false to supply your own. Default true. */
  injectDefaultStyles?: boolean
}

const BASE_CLASS: Record<PartKey, string> = {
  root: 'irr',
  toolbar: 'irr-toolbar',
  group: 'irr-group',
  spacer: 'irr-spacer',
  button: 'irr-btn',
  buttonActive: 'irr-btn--active',
  primaryButton: 'irr-btn--primary',
  select: 'irr-select',
  sliderLabel: 'irr-slider-label',
  slider: 'irr-slider',
  frame: 'irr-frame',
  canvas: 'irr-canvas',
  overlay: 'irr-overlay',
  outline: 'irr-outline',
  handle: 'irr-handle',
  hint: 'irr-hint',
}

/**
 * Resolve the className + inline style for a given part, merging the built-in
 * base class with any user overrides. `extra` lets a caller add modifier
 * classes (e.g. an active button).
 */
export function makeParts(classNames?: EditorClassNames, styles?: EditorStyles) {
  return function part(
    key: PartKey,
    extra?: Array<PartKey | false | undefined>
  ): { className: string; style?: React.CSSProperties } {
    const classes = [BASE_CLASS[key]]
    if (classNames && classNames[key]) classes.push(classNames[key] as string)
    if (extra) {
      for (const e of extra) {
        if (!e) continue
        classes.push(BASE_CLASS[e])
        if (classNames && classNames[e]) classes.push(classNames[e] as string)
      }
    }
    const style = styles ? styles[key] : undefined
    return { className: classes.join(' '), style }
  }
}

export const STYLE_ELEMENT_ID = 'react-irregularimg-editor-styles'

/** The default stylesheet. Themed entirely through CSS custom properties. */
export const DEFAULT_STYLESHEET = `
.irr {
  --irr-accent: #6366f1;
  --irr-accent-fg: #ffffff;
  --irr-surface: #ffffff;
  --irr-surface-2: #f4f4f6;
  --irr-fg: #1f2430;
  --irr-muted: #6b7280;
  --irr-border: #e3e3e8;
  --irr-radius: 12px;
  --irr-radius-sm: 8px;
  --irr-shadow: 0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1);
  --irr-danger: #ef4444;
  --irr-success: #10b981;
  --irr-outline-color: var(--irr-accent);
  --irr-handle-fill: #ffffff;
  --irr-handle-stroke: var(--irr-accent);
  --irr-checker-a: #ececee;
  --irr-checker-b: #ffffff;
  --irr-font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  display: inline-block;
  color: var(--irr-fg);
  font-family: var(--irr-font);
  box-sizing: border-box;
}
.irr *, .irr *::before, .irr *::after { box-sizing: border-box; }
.irr[data-irr-theme="dark"] {
  --irr-surface: #1c1d22;
  --irr-surface-2: #26272e;
  --irr-fg: #e7e7ea;
  --irr-muted: #9aa0ac;
  --irr-border: #34353d;
  --irr-shadow: 0 1px 3px rgba(0,0,0,.45);
  --irr-checker-a: #303036;
  --irr-checker-b: #26262b;
}
.irr-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--irr-border);
  border-radius: var(--irr-radius);
  background: var(--irr-surface-2);
  box-shadow: var(--irr-shadow);
  font-size: 13px;
}
.irr-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.irr-spacer { margin-left: auto; }
.irr-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border: 1px solid var(--irr-border);
  border-radius: var(--irr-radius-sm);
  background: var(--irr-surface);
  color: var(--irr-fg);
  font: inherit;
  font-size: 13px;
  line-height: 1.2;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease;
}
.irr-btn:hover { border-color: var(--irr-accent); }
.irr-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--irr-accent) 35%, transparent); }
.irr-btn--active {
  background: var(--irr-accent);
  border-color: var(--irr-accent);
  color: var(--irr-accent-fg);
}
.irr-btn--active:hover { filter: brightness(1.05); }
.irr-btn--primary {
  margin-left: auto;
  background: var(--irr-accent);
  border-color: var(--irr-accent);
  color: var(--irr-accent-fg);
  font-weight: 600;
}
.irr-btn--primary:hover { filter: brightness(1.05); border-color: var(--irr-accent); }
.irr-select {
  padding: 6px 10px;
  border: 1px solid var(--irr-border);
  border-radius: var(--irr-radius-sm);
  background: var(--irr-surface);
  color: var(--irr-fg);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.irr-slider-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--irr-muted);
}
.irr-slider { accent-color: var(--irr-accent); cursor: pointer; }
.irr-frame {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--irr-border);
  border-radius: var(--irr-radius);
  background-image:
    linear-gradient(45deg, var(--irr-checker-a) 25%, transparent 25%),
    linear-gradient(-45deg, var(--irr-checker-a) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--irr-checker-a) 75%),
    linear-gradient(-45deg, transparent 75%, var(--irr-checker-a) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-color: var(--irr-checker-b);
}
.irr-canvas { display: block; }
.irr-overlay { position: absolute; inset: 0; touch-action: none; }
.irr-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  pointer-events: none;
  color: var(--irr-fg);
  background: color-mix(in srgb, var(--irr-surface) 60%, transparent);
  font-size: 13px;
  line-height: 1.5;
}
`

let injected = false

/** Inject the default stylesheet once per document. SSR-safe (no-op on server). */
export function injectStyles(): void {
  if (injected) return
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    injected = true
    return
  }
  const el = document.createElement('style')
  el.id = STYLE_ELEMENT_ID
  el.textContent = DEFAULT_STYLESHEET
  document.head.appendChild(el)
  injected = true
}
