import { Point, PresetShape } from './types'

/**
 * Generate the outline of a preset shape as points in viewport pixel
 * coordinates. The shape is inscribed in the `width` x `height` box with a
 * small inset so the outline is never flush against the frame edge.
 */
export function presetPoints(
  shape: PresetShape,
  width: number,
  height: number,
  inset = 0.02
): Point[] {
  const padX = width * inset
  const padY = height * inset
  const w = width - padX * 2
  const h = height - padY * 2
  const cx = width / 2
  const cy = height / 2
  const rx = w / 2
  const ry = h / 2

  const ellipse = (steps: number): Point[] => {
    const pts: Point[] = []
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2 - Math.PI / 2
      pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
    }
    return pts
  }

  const polygon = (sides: number, rotation: number): Point[] => {
    const pts: Point[] = []
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 + rotation
      pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
    }
    return pts
  }

  switch (shape) {
    case 'circle':
    case 'ellipse':
      return ellipse(64)
    case 'triangle':
      return polygon(3, -Math.PI / 2)
    case 'diamond':
      return polygon(4, -Math.PI / 2)
    case 'pentagon':
      return polygon(5, -Math.PI / 2)
    case 'hexagon':
      return polygon(6, -Math.PI / 2)
    case 'star':
      return star(cx, cy, rx, ry, 5)
    case 'heart':
      return heart(cx, cy, rx, ry)
    default:
      return ellipse(64)
  }
}

function star(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  spikes: number
): Point[] {
  const pts: Point[] = []
  const inner = 0.5
  const total = spikes * 2
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? 1 : inner
    const a = (i / total) * Math.PI * 2 - Math.PI / 2
    pts.push({ x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r })
  }
  return pts
}

function heart(cx: number, cy: number, rx: number, ry: number): Point[] {
  const pts: Point[] = []
  const steps = 72
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    // Classic heart parametric curve, normalised to roughly [-1, 1].
    const x = 16 * Math.pow(Math.sin(t), 3) / 17
    const y =
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)) /
      17
    // SVG/canvas y grows downward, so subtract to point the tip down.
    pts.push({ x: cx + x * rx, y: cy - y * ry })
  }
  return pts
}
