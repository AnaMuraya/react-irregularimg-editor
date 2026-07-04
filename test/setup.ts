import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)

// jsdom lacks a PointerEvent constructor; provide a minimal one so pointer
// interactions can be simulated in component tests.
if (typeof (globalThis as any).PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params)
      this.pointerId = params.pointerId ?? 1
    }
  }
  ;(globalThis as any).PointerEvent = PointerEventPolyfill as any
}

// jsdom has no 2D canvas backend; return null so the live-canvas effect skips
// drawing (component tests assert structure, not pixels).
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => null) as any
}

// jsdom does not implement pointer capture; stub it as a no-op.
for (const proto of [Element.prototype, (globalThis as any).SVGElement?.prototype].filter(Boolean)) {
  if (!(proto as any).setPointerCapture) (proto as any).setPointerCapture = () => {}
  if (!(proto as any).releasePointerCapture) (proto as any).releasePointerCapture = () => {}
  if (!(proto as any).hasPointerCapture) (proto as any).hasPointerCapture = () => false
}
