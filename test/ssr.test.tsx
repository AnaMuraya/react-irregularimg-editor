// @vitest-environment node
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { IrregularImageEditor } from '../src/IrregularImageEditor'
import { FreehandEditor } from '../src/editors/FreehandEditor'
import { PresetEditor } from '../src/editors/PresetEditor'

describe('server-side rendering (no DOM)', () => {
  it('confirms there is genuinely no document in this environment', () => {
    expect(typeof document).toBe('undefined')
    expect(typeof window).toBe('undefined')
  })

  it('renders every editor to static markup without touching the DOM', () => {
    for (const El of [IrregularImageEditor, FreehandEditor, PresetEditor]) {
      const html = renderToStaticMarkup(<El src="/photo.png" />)
      expect(html).toContain('<svg')
      expect(html).toContain('<canvas')
    }
  })
})
