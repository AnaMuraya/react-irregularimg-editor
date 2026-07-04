import { describe, it, expect, vi } from 'vitest'
import { pointsToPath, tracePath, distSq, simplify } from '../src/geometry'
import { Point } from '../src/types'

const square: Point[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
]

describe('pointsToPath', () => {
  it('returns an empty string for no points', () => {
    expect(pointsToPath([])).toBe('')
  })

  it('builds a closed M/L path', () => {
    expect(pointsToPath(square)).toBe('M0 0 L10 0 L10 10 L0 10 Z')
  })

  it('applies a scale factor', () => {
    expect(pointsToPath([{ x: 1, y: 2 }, { x: 3, y: 4 }], 2)).toBe(
      'M2 4 L6 8 Z'
    )
  })

  it('rounds to 2 decimal places', () => {
    expect(pointsToPath([{ x: 1.23456, y: 0 }, { x: 0, y: 0 }])).toContain(
      'M1.23 0'
    )
  })
})

describe('tracePath', () => {
  it('moves to the first point then lines to the rest and closes', () => {
    const ctx = {
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D
    tracePath(ctx, square, 2)
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
    expect(ctx.lineTo).toHaveBeenCalledTimes(3)
    expect(ctx.lineTo).toHaveBeenCalledWith(20, 0)
    expect(ctx.closePath).toHaveBeenCalledOnce()
  })
})

describe('distSq', () => {
  it('computes squared distance', () => {
    expect(distSq({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25)
  })
})

describe('simplify', () => {
  it('keeps points that are far enough apart', () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }]
    expect(simplify(pts, 4)).toHaveLength(3)
  })

  it('drops points closer than minDist to the previous kept point', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 0 }, // dropped (too close)
      { x: 2, y: 0 }, // dropped
      { x: 50, y: 0 }, // kept
    ]
    const out = simplify(pts, 4)
    expect(out).toEqual([{ x: 0, y: 0 }, { x: 50, y: 0 }])
  })

  it('returns input unchanged for 2 or fewer points', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 0 }]
    expect(simplify(pts, 100)).toBe(pts)
  })
})
