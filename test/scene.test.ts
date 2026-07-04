import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildSvg, drawScene, exportScene, SceneOptions } from '../src/scene'
import { Point } from '../src/types'

const triangle: Point[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 50, y: 100 },
]

const fakeImg = { naturalWidth: 100, naturalHeight: 100 } as HTMLImageElement

function mockCtx() {
  return {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    fillRect: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D
}

function opts(over: Partial<SceneOptions> = {}): SceneOptions {
  return {
    img: fakeImg,
    points: triangle,
    transform: { rotation: 0, scale: 1, offsetX: 0, offsetY: 0 },
    vw: 200,
    vh: 200,
    ...over,
  }
}

describe('drawScene', () => {
  it('clears but does not clip when there are fewer than 3 points', () => {
    const ctx = mockCtx()
    drawScene(ctx, opts({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }), 1)
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.clip).not.toHaveBeenCalled()
  })

  it('clips and draws the image for a valid mask', () => {
    const ctx = mockCtx()
    drawScene(ctx, opts(), 2)
    expect(ctx.clip).toHaveBeenCalledOnce()
    expect(ctx.drawImage).toHaveBeenCalledOnce()
  })

  it('paints the background color when provided', () => {
    const ctx = mockCtx()
    drawScene(ctx, opts({ backgroundColor: '#f00' }), 1)
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('skips drawing the image when none is loaded', () => {
    const ctx = mockCtx()
    drawScene(ctx, opts({ img: null }), 1)
    expect(ctx.drawImage).not.toHaveBeenCalled()
  })
})

describe('buildSvg', () => {
  it('emits a clipped svg with an embedded image', () => {
    const svg = buildSvg(opts(), 'data:image/png;base64,AAA', 1)
    expect(svg).toMatch(/^<svg/)
    expect(svg).toContain('clipPath')
    expect(svg).toContain('<path d="M0 0 L100 0 L50 100 Z"')
    expect(svg).toContain('<image href="data:image/png;base64,AAA"')
    expect(svg).toContain('width="200" height="200"')
  })

  it('omits the image element when there is no image', () => {
    const svg = buildSvg(opts({ img: null }), '', 1)
    expect(svg).not.toContain('<image')
  })

  it('includes a background rect when a color is set', () => {
    const svg = buildSvg(opts({ backgroundColor: '#00ff00' }), 'x', 1)
    expect(svg).toContain('<rect')
    expect(svg).toContain('#00ff00')
  })

  it('scales the viewport dimensions', () => {
    const svg = buildSvg(opts(), 'x', 2)
    expect(svg).toContain('width="400" height="400"')
  })
})

describe('exportScene', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders to an offscreen canvas and returns png + svg', async () => {
    const blob = new Blob(['png'], { type: 'image/png' })
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => mockCtx(),
      toDataURL: () => 'data:image/png;base64,ZZZ',
      toBlob: (cb: (b: Blob | null) => void) => cb(blob),
    }
    vi.spyOn(document, 'createElement').mockImplementation(
      () => canvas as unknown as HTMLElement
    )

    const result = await exportScene(opts(), 2)
    expect(result.width).toBe(400)
    expect(result.height).toBe(400)
    expect(result.blob).toBe(blob)
    expect(result.dataUrl).toBe('data:image/png;base64,ZZZ')
    expect(result.svg).toContain('<svg')
  })

  it('rejects when the canvas produces no blob', async () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => mockCtx(),
      toDataURL: () => 'data:,',
      toBlob: (cb: (b: Blob | null) => void) => cb(null),
    }
    vi.spyOn(document, 'createElement').mockImplementation(
      () => canvas as unknown as HTMLElement
    )
    await expect(exportScene(opts(), 1)).rejects.toThrow()
  })
})
