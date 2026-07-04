import { describe, it, expect } from 'vitest'
import {
  makeParts,
  injectStyles,
  STYLE_ELEMENT_ID,
  DEFAULT_STYLESHEET,
} from '../src/theme'

describe('makeParts', () => {
  it('returns the base class for a part', () => {
    const part = makeParts()
    expect(part('button').className).toBe('irr-btn')
  })

  it('appends a user class name', () => {
    const part = makeParts({ button: 'my-btn' })
    expect(part('button').className).toBe('irr-btn my-btn')
  })

  it('merges modifier classes and their user overrides', () => {
    const part = makeParts({ buttonActive: 'on' })
    expect(part('button', ['buttonActive']).className).toBe(
      'irr-btn irr-btn--active on'
    )
  })

  it('ignores falsy modifiers', () => {
    const part = makeParts()
    expect(part('button', [false, undefined]).className).toBe('irr-btn')
  })

  it('returns the per-part inline style', () => {
    const part = makeParts(undefined, { button: { color: 'red' } })
    expect(part('button').style).toEqual({ color: 'red' })
  })
})

describe('injectStyles', () => {
  it('adds a single style element containing the default stylesheet', () => {
    injectStyles()
    injectStyles() // idempotent
    const els = document.querySelectorAll(`#${STYLE_ELEMENT_ID}`)
    expect(els).toHaveLength(1)
    expect(els[0].textContent).toBe(DEFAULT_STYLESHEET)
  })
})
