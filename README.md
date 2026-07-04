# react-irregularimg-editor

A React + TypeScript component for cropping and masking images into **irregular
shapes**. Draw a freeform outline, click a polygon, or pick a preset shape;
rotate/zoom/reposition the image inside the mask; then export a transparent PNG
or a standalone SVG.

- 🎯 **Freeform & polygon cropping** — click to place polygon points (drag to
  move, double-click to remove) or press-and-drag to draw a freehand outline.
- ⭐ **Preset shape masks** — circle, ellipse, triangle, diamond, pentagon,
  hexagon, star, heart.
- 🔧 **Adjustments** — rotate, zoom, and reposition the image *within* the mask.
- 💾 **Export** — PNG with transparency outside the mask, plus a self-contained
  SVG string. WYSIWYG: the export is pixel-identical to the preview.
- 🧩 **Pick only what you need** — import the full editor, or a single-feature
  editor (`/freehand`, `/polygon`, `/preset`) so unused features tree-shake away.
- 🎨 **Beautiful & fully themeable** — polished light/dark styles out of the box,
  overridable via CSS variables, class names, or inline styles.
- ✅ Zero runtime dependencies (React is a peer dependency). Ships with types.

## Installation

```bash
npm install react-irregularimg-editor
```

React 17+ and `react-dom` are peer dependencies.

## Quick start

```tsx
import { IrregularImageEditor } from 'react-irregularimg-editor'

export default function App() {
  return (
    <IrregularImageEditor
      src="/photo.jpg"
      width={500}
      height={400}
      initialShape="star"
      onExport={(result) => {
        console.log(result.blob)    // PNG Blob (transparent outside the mask)
        console.log(result.dataUrl) // PNG data URL
        console.log(result.svg)     // standalone SVG string
      }}
    />
  )
}
```

The built-in toolbar lets the user switch mode (Shape / Polygon / Freehand),
pick a preset, toggle **Move image**, adjust **Rotate** / **Zoom**, and
**Reset / Export / Download PNG**.

### Loading the user's own image

`src` is just an image source, so a file `<input>` works directly — create an
object URL and pass it in (remember to revoke the previous one):

```tsx
function Uploader() {
  const [src, setSrc] = useState('')
  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setSrc(URL.createObjectURL(file))
        }}
      />
      {src && <IrregularImageEditor src={src} />}
    </>
  )
}
```

## Choose only the features you need

Every mode is available as a standalone editor with its own subpath import, so a
freehand-only app never pulls in polygon or preset code:

```tsx
import { FreehandEditor } from 'react-irregularimg-editor/freehand'
import { PolygonEditor }  from 'react-irregularimg-editor/polygon'
import { PresetEditor }   from 'react-irregularimg-editor/preset'

// freehand only
<FreehandEditor src="/photo.jpg" />

// polygon only
<PolygonEditor src="/photo.jpg" />

// preset masks, restricted to a subset of shapes
<PresetEditor src="/photo.jpg" shapes={['circle', 'star', 'heart']} />
```

They are also re-exported from the package root if you prefer a single import
path:

```tsx
import { FreehandEditor, PolygonEditor, PresetEditor } from 'react-irregularimg-editor'
```

You can also narrow the **full** editor without switching components:

```tsx
// only expose freehand + polygon, hide preset entirely
<IrregularImageEditor src="/photo.jpg" modes={['freehand', 'polygon']} />

// preset mode, but only offer three shapes
<IrregularImageEditor src="/photo.jpg" shapes={['circle', 'hexagon', 'heart']} />
```

| Import | Component | Features |
| --- | --- | --- |
| `react-irregularimg-editor` | `IrregularImageEditor` | All modes + switcher |
| `react-irregularimg-editor/freehand` | `FreehandEditor` | Freeform draw only |
| `react-irregularimg-editor/polygon` | `PolygonEditor` | Polygon only |
| `react-irregularimg-editor/preset` | `PresetEditor` | Preset shapes only |
| `react-irregularimg-editor/core` | hooks & primitives | Build your own UI |

## Controlling it in code (imperative handle)

Attach a `ref` to any editor to export, download, reset, or read state without
using the toolbar (set `showToolbar={false}` for a headless UI):

```tsx
import { useRef } from 'react'
import {
  IrregularImageEditor,
  IrregularImageEditorHandle,
} from 'react-irregularimg-editor'

function Editor() {
  const ref = useRef<IrregularImageEditorHandle>(null)
  return (
    <>
      <IrregularImageEditor ref={ref} src="/photo.jpg" showToolbar={false} />
      <button onClick={async () => {
        const { blob, dataUrl, svg } = await ref.current!.export()
        // …upload `blob`, preview `dataUrl`, or store `svg`
      }}>Export</button>
      <button onClick={() => ref.current!.download('cropped.png')}>Download</button>
      <button onClick={() => ref.current!.reset()}>Reset</button>
    </>
  )
}
```

## Styling & theming

The editor ships with a polished stylesheet (injected once into `<head>`) that
is themed entirely through CSS custom properties. There are four ways to
customise it, from simplest to most granular.

### 1. Light / dark theme

```tsx
<IrregularImageEditor src="/photo.jpg" theme="dark" />
```

### 2. CSS variables (recolour everything)

Pass `cssVars`, or set the variables in your own CSS on the `.irr` root:

```tsx
<IrregularImageEditor
  src="/photo.jpg"
  cssVars={{ '--irr-accent': '#e11d48', '--irr-radius': '16px' }}
/>
```

| Variable | Purpose |
| --- | --- |
| `--irr-accent` / `--irr-accent-fg` | Accent colour + its text colour |
| `--irr-surface` / `--irr-surface-2` | Toolbar & control backgrounds |
| `--irr-fg` / `--irr-muted` | Text colours |
| `--irr-border` | Border colour |
| `--irr-radius` / `--irr-radius-sm` | Corner radii |
| `--irr-shadow` | Toolbar shadow |
| `--irr-outline-color` | Mask outline stroke |
| `--irr-handle-fill` / `--irr-handle-stroke` | Polygon vertex handles |
| `--irr-checker-a` / `--irr-checker-b` | Transparency checkerboard |
| `--irr-font` | Font family |

### 3. Custom class names / inline styles per part

Every part has a stable base class (e.g. `.irr-toolbar`, `.irr-btn`,
`.irr-btn--active`, `.irr-frame`, `.irr-outline`, `.irr-handle`, `.irr-hint`).
Target them in your CSS, or pass overrides per part:

```tsx
<IrregularImageEditor
  src="/photo.jpg"
  classNames={{ toolbar: 'my-toolbar', primaryButton: 'my-cta' }}
  styles={{ frame: { boxShadow: '0 10px 30px rgba(0,0,0,.2)' } }}
/>
```

Part keys: `root`, `toolbar`, `group`, `button`, `buttonActive`,
`primaryButton`, `select`, `sliderLabel`, `slider`, `frame`, `canvas`,
`overlay`, `outline`, `handle`, `hint`.

### 4. Bring your own stylesheet

Disable the built-in CSS entirely and style the `.irr-*` classes yourself:

```tsx
<IrregularImageEditor src="/photo.jpg" injectDefaultStyles={false} />
```

## Props

All editors share these props (`BaseEditorProps`):

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | — | **Required.** Image URL, blob URL, or data URL. |
| `width` | `number` | `500` | Viewport width in CSS pixels. |
| `height` | `number` | `400` | Viewport height in CSS pixels. |
| `exportScale` | `number` | `2` | Resolution multiplier for exported PNG/SVG. |
| `crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | — | Set for images from another origin (server must send CORS headers). |
| `backgroundColor` | `string` | — | Solid color painted inside the mask behind the image. Omit for transparency. |
| `showToolbar` | `boolean` | `true` | Render the built-in toolbar. |
| `downloadName` | `string` | `'irregular-image.png'` | Filename for the Download button. |
| `onExport` | `(result: ExportResult) => void` | — | Called after an export/download. |
| `onChange` | `(state: EditorState) => void` | — | Called whenever the mask or adjustments change. |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in colour theme. |
| `classNames` | `EditorClassNames` | — | Per-part class name overrides. |
| `styles` | `EditorStyles` | — | Per-part inline style overrides. |
| `cssVars` | `CSSProperties` | — | CSS custom properties set on the root. |
| `injectDefaultStyles` | `boolean` | `true` | Inject the built-in stylesheet. |
| `className` / `style` | — | — | Applied to the outer wrapper. |

Additional props:

- **`IrregularImageEditor`**: `initialMode` (`'preset' \| 'polygon' \| 'freehand'`, default `'preset'`), `initialShape` (default `'circle'`), `shapes` (preset list), `modes` (which modes to expose).
- **`PresetEditor`**: `shapes` (list to offer, default all), `initialShape`.

### `PresetShape`

`'circle' | 'ellipse' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'heart'`

### `ExportResult`

```ts
interface ExportResult {
  blob: Blob        // PNG, transparent outside the mask
  dataUrl: string   // PNG data URL
  svg: string       // standalone SVG with embedded image + clip-path
  width: number     // output pixel width  (= width  * exportScale)
  height: number    // output pixel height (= height * exportScale)
}
```

### Imperative handle (`IrregularImageEditorHandle`)

```ts
interface IrregularImageEditorHandle {
  export: () => Promise<ExportResult>
  download: (filename?: string) => Promise<void>
  reset: () => void
  getState: () => EditorState   // { mode, shape, points, transform }
}
```

## Building a custom UI (`/core`)

The `/core` entry exposes the engine hook and primitives if you want to replace
the toolbar entirely:

```tsx
import { useEditor, EditorFrame, makeParts } from 'react-irregularimg-editor/core'
```

`useEditor()` owns the mask, transform, canvas rendering, pointer interactions
and export; `EditorFrame` renders the canvas + interactive overlay. Also
exported: `drawScene`, `exportScene`, `buildSvg`, `presetPoints`, `pointsToPath`.

## Notes on cross-origin images

Exporting reads pixels back from a canvas. If the image comes from a different
origin, set `crossOrigin="anonymous"` **and** make sure the host serves
`Access-Control-Allow-Origin`. Otherwise the canvas is "tainted" and export
throws. Same-origin, blob, and data URLs always work.

## Development

```bash
npm install      # install dev dependencies
npm run build    # compile TypeScript to dist/
npm test         # run the vitest suite
```

There is a runnable example under [`demo/`](./demo) with image upload and a
theme switch. Bundle and serve it with:

```bash
npx esbuild demo/main.tsx --bundle --outfile=demo/bundle.js --jsx=automatic
python3 -m http.server 8752 --directory demo   # then open http://localhost:8752
```

## License

ISC
