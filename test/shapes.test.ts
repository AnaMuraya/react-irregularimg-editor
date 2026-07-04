import { describe, it, expect } from 'vitest'
import { presetPoints } from '../src/shapes'
import { PresetShape } from '../src/types'

const ALL: PresetShape[] = [
  'circle',
  'ellipse',
  'triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'star',
  'heart',
]

describe('presetPoints', () => {
  it('returns points for every shape', () => {
    for (const s of ALL) {
      expect(presetPoints(s, 200, 200).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('produces the right vertex count for polygons', () => {
    expect(presetPoints('triangle', 100, 100)).toHaveLength(3)
    expect(presetPoints('diamond', 100, 100)).toHaveLength(4)
    expect(presetPoints('pentagon', 100, 100)).toHaveLength(5)
    expect(presetPoints('hexagon', 100, 100)).toHaveLength(6)
  })

  it('gives a star 10 vertices (5 outer + 5 inner)', () => {
    expect(presetPoints('star', 100, 100)).toHaveLength(10)
  })

  it('keeps every point within the frame', () => {
    for (const s of ALL) {
      for (const p of presetPoints(s, 300, 200)) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThanOrEqual(300)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeLessThanOrEqual(200)
      }
    }
  })

  it('centres shapes on the frame centre', () => {
    const pts = presetPoints('circle', 200, 100)
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length
    expect(cx).toBeCloseTo(100, 0)
    expect(cy).toBeCloseTo(50, 0)
  })

  it('scales a circle to a non-square frame (ellipse bounds)', () => {
    const pts = presetPoints('circle', 400, 100)
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(
      Math.max(...ys) - Math.min(...ys)
    )
  })
})
