import { Point } from './types'

/** Build an SVG path string ("M .. L .. Z") from a list of points. */
export function pointsToPath(points: Point[], scale = 1): string {
  if (points.length === 0) return ''
  const d = points
    .map((p, i) => {
      const cmd = i === 0 ? 'M' : 'L'
      return `${cmd}${round(p.x * scale)} ${round(p.y * scale)}`
    })
    .join(' ')
  return `${d} Z`
}

/** Trace `points` as a closed path onto a 2D canvas context. */
export function tracePath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  scale = 1
): void {
  points.forEach((p, i) => {
    const x = p.x * scale
    const y = p.y * scale
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
}

/** Squared distance between two points (avoids a sqrt when only comparing). */
export function distSq(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

/**
 * Drop freehand points that are closer than `minDist` to the previous kept
 * point, so the outline stays light without changing its shape.
 */
export function simplify(points: Point[], minDist: number): Point[] {
  if (points.length <= 2) return points
  const min = minDist * minDist
  const out: Point[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    if (distSq(points[i], out[out.length - 1]) >= min) out.push(points[i])
  }
  return out
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
