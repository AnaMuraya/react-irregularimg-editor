# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Dual **ESM + CJS** builds with a conditional `exports` map (`import`/`require`/
  `types`) and generated `.d.ts` / `.d.mts` declarations.
- **`"use client"`** directive on every published entry — safe to import from
  the Next.js App Router (React Server Components).
- **Keyboard-accessible** mask vertices: focusable handles with arrow-key nudge
  (Shift = larger step) and Delete/Backspace to remove, plus ARIA labelling and
  `aria-pressed` on toolbar toggles.
- `sideEffects: false` for tree-shaking; `react`/`react-dom` moved to
  `peerDependencies` (`>=18`, React 19 compatible).
- ESLint + GitHub Actions CI (typecheck, lint, test, build) and a `LICENSE`.

## [0.2.0]

### Added

- `IrregularImageEditor` — full editor with freeform, polygon and preset-shape
  masking, a mode switcher, and a built-in toolbar.
- Single-feature editors with their own subpath exports: `FreehandEditor`
  (`/freehand`), `PolygonEditor` (`/polygon`), `PresetEditor` (`/preset`).
- Image adjustments: rotate, zoom, and reposition the image within the mask.
- Export to transparent **PNG** (`Blob` + data URL) and standalone **SVG**;
  imperative handle (`export`, `download`, `reset`, `getState`).
- Theming system: light/dark themes, CSS-variable theming, and per-part
  `classNames` / `styles` overrides. `/core` entry exposes the engine hook and
  primitives for a custom UI.
- Vitest test suite (unit + component) and a runnable demo.

### Changed

- Renamed the package from the `create-react-app` scaffold to
  `react-irregularimg-editor` and replaced the tutorial README with real docs.

## [0.1.1] — prior art

- Initial (unrelated) Create React App scaffold published under this name.

[Unreleased]: https://github.com/AnaMuraya/custom-demo/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/AnaMuraya/custom-demo/releases/tag/v0.2.0
