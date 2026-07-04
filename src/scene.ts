import { pointsToPath, tracePath } from './geometry'
import { ExportResult, ImageTransform, Point } from './types'

export interface SceneOptions {
  img: HTMLImageElement | null
  points: Point[]
  transform: ImageTransform
  /** Viewport width in CSS pixels. */
  vw: number
  /** Viewport height in CSS pixels. */
  vh: number
  /** Optional solid backdrop painted inside the mask before the image. */
  backgroundColor?: string
}

/**
 * The single source of truth for what a crop looks like. Used both for the
 * live on-screen canvas and for the high-resolution export canvas.
 *
 * When `preview` is true (the on-screen editor), the whole image is drawn dimmed
 * behind the mask so the user can see what they are cropping — even before the
 * outline is complete. The export path passes `preview = false`, so the exported
 * PNG contains only the masked region and is pixel-identical to the bright part
 * of the preview.
 */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  opts: SceneOptions,
  scale: number,
  preview = false
): void {
  const { img, points, transform, vw, vh, backgroundColor } = opts
  const hasImage = !!img && img.naturalWidth > 0
  ctx.clearRect(0, 0, vw * scale, vh * scale)

  // Dimmed backdrop so the source image is visible while masking (preview only).
  if (preview && hasImage) {
    ctx.save()
    ctx.globalAlpha = 0.35
    drawImageTransformed(ctx, img!, transform, vw, vh, scale)
    ctx.restore()
  }

  if (points.length < 3) return

  ctx.save()
  ctx.beginPath()
  tracePath(ctx, points, scale)
  ctx.clip()

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, vw * scale, vh * scale)
  }

  if (hasImage) {
    drawImageTransformed(ctx, img!, transform, vw, vh, scale)
  }
  ctx.restore()
}

/** Draw the image "cover"-fit into the viewport, then apply user transforms. */
function drawImageTransformed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  t: ImageTransform,
  vw: number,
  vh: number,
  scale: number
): void {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const cover = Math.max(vw / iw, vh / ih)
  const baseW = iw * cover * scale
  const baseH = ih * cover * scale

  ctx.save()
  ctx.translate(
    (vw / 2 + t.offsetX) * scale,
    (vh / 2 + t.offsetY) * scale
  )
  ctx.rotate((t.rotation * Math.PI) / 180)
  ctx.scale(t.scale, t.scale)
  ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH)
  ctx.restore()
}

/**
 * Produce a self-contained SVG string: an embedded raster image, transformed
 * the same way as the canvas, clipped to the mask path.
 */
export function buildSvg(
  opts: SceneOptions,
  imageDataUrl: string,
  scale: number
): string {
  const { img, points, transform: t, vw, vh, backgroundColor } = opts
  const w = vw * scale
  const h = vh * scale
  const path = pointsToPath(points, scale)

  let inner = ''
  if (backgroundColor) {
    inner += `<rect width="${w}" height="${h}" fill="${backgroundColor}"/>`
  }
  if (img && img.naturalWidth > 0) {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const cover = Math.max(vw / iw, vh / ih)
    const baseW = iw * cover * scale
    const baseH = ih * cover * scale
    const cx = (vw / 2 + t.offsetX) * scale
    const cy = (vh / 2 + t.offsetY) * scale
    const transform =
      `translate(${round(cx)} ${round(cy)}) ` +
      `rotate(${round(t.rotation)}) ` +
      `scale(${round(t.scale)}) ` +
      `translate(${round(-baseW / 2)} ${round(-baseH / 2)})`
    inner +=
      `<image href="${imageDataUrl}" x="0" y="0" ` +
      `width="${round(baseW)}" height="${round(baseH)}" ` +
      `transform="${transform}" preserveAspectRatio="none"/>`
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><clipPath id="mask"><path d="${path}"/></clipPath></defs>` +
    `<g clip-path="url(#mask)">${inner}</g>` +
    `</svg>`
  )
}

/** Full source image as a PNG data URL (used to embed inside the SVG). */
export function imageToDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(img, 0, 0)
  return canvas.toDataURL('image/png')
}

/** Render the scene to an offscreen canvas and collect PNG + SVG output. */
export function exportScene(
  opts: SceneOptions,
  exportScale: number
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    const width = Math.round(opts.vw * exportScale)
    const height = Math.round(opts.vh * exportScale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not acquire a 2D canvas context'))
      return
    }

    try {
      drawScene(ctx, opts, exportScale)
      const dataUrl = canvas.toDataURL('image/png')
      const svg = buildSvg(
        opts,
        opts.img ? imageToDataUrl(opts.img) : '',
        exportScale
      )
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed (image may be cross-origin)'))
          return
        }
        resolve({ blob, dataUrl, svg, width, height })
      }, 'image/png')
    } catch (err) {
      reject(err as Error)
    }
  })
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}
