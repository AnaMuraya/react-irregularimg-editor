import React, { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IrregularImageEditor } from '../src/IrregularImageEditor'
import { FreehandEditor } from '../src/editors/FreehandEditor'
import { PolygonEditor } from '../src/editors/PolygonEditor'
import { PresetEditor } from '../src/editors/PresetEditor'
import { IrregularImageEditorHandle } from '../src/types'

const SRC = 'data:image/png;base64,iVBORw0KGgo='

describe('FreehandEditor', () => {
  it('renders freehand-only controls, no mode switcher or shape select', () => {
    const { container } = render(<FreehandEditor src={SRC} />)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Polygon' })).toBeNull()
    expect(container.querySelector('select')).toBeNull()
  })

  it('shows the freeform hint', () => {
    render(<FreehandEditor src={SRC} />)
    expect(screen.getByText(/draw a freeform outline/i)).toBeInTheDocument()
  })

  it('exposes mode via the imperative handle', () => {
    const ref = createRef<IrregularImageEditorHandle>()
    render(<FreehandEditor ref={ref} src={SRC} />)
    expect(ref.current!.getState().mode).toBe('freehand')
  })

  it('hides the toolbar when showToolbar is false', () => {
    render(<FreehandEditor src={SRC} showToolbar={false} />)
    expect(screen.queryByRole('button', { name: 'Download PNG' })).toBeNull()
  })
})

describe('PolygonEditor', () => {
  it('adds a vertex handle for each click on the overlay', () => {
    const { container } = render(<PolygonEditor src={SRC} />)
    const overlay = container.querySelector('svg.irr-overlay') as SVGSVGElement
    expect(overlay).toBeTruthy()
    for (const [x, y] of [[10, 10], [90, 10], [50, 90]]) {
      fireEvent.pointerDown(overlay, { clientX: x, clientY: y, pointerId: 1 })
    }
    expect(container.querySelectorAll('circle')).toHaveLength(3)
    expect(container.querySelector('path.irr-outline')).toBeTruthy()
  })

  it('reports polygon mode', () => {
    const ref = createRef<IrregularImageEditorHandle>()
    render(<PolygonEditor ref={ref} src={SRC} />)
    expect(ref.current!.getState().mode).toBe('polygon')
  })
})

describe('PresetEditor', () => {
  it('renders only the requested shapes', () => {
    const { container } = render(
      <PresetEditor src={SRC} shapes={['circle', 'heart']} />
    )
    const select = container.querySelector('select') as HTMLSelectElement
    const values = Array.from(select.options).map((o) => o.value)
    expect(values).toEqual(['circle', 'heart'])
  })

  it('defaults to the first shape in the list', () => {
    const ref = createRef<IrregularImageEditorHandle>()
    render(<PresetEditor ref={ref} src={SRC} shapes={['hexagon', 'star']} />)
    expect(ref.current!.getState().shape).toBe('hexagon')
  })

  it('switches shape on select change', () => {
    const ref = createRef<IrregularImageEditorHandle>()
    const { container } = render(<PresetEditor ref={ref} src={SRC} />)
    const select = container.querySelector('select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'star' } })
    expect(ref.current!.getState().shape).toBe('star')
  })
})

describe('IrregularImageEditor (full)', () => {
  it('shows the mode switcher', () => {
    render(<IrregularImageEditor src={SRC} />)
    expect(screen.getByRole('button', { name: 'Shape' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Polygon' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Freehand' })).toBeInTheDocument()
  })

  it('shows the shape select only in preset mode', () => {
    const { container } = render(<IrregularImageEditor src={SRC} />)
    expect(container.querySelector('select')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Polygon' }))
    expect(container.querySelector('select')).toBeNull()
    expect(screen.getByText(/Click to place points/i)).toBeInTheDocument()
  })

  it('honours a restricted mode list', () => {
    render(<IrregularImageEditor src={SRC} modes={['freehand']} />)
    expect(screen.getByRole('button', { name: 'Freehand' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Polygon' })).toBeNull()
  })

  it('applies theme and custom class names', () => {
    const { container } = render(
      <IrregularImageEditor
        src={SRC}
        theme="dark"
        classNames={{ root: 'my-root' }}
      />
    )
    const root = container.querySelector('.irr') as HTMLElement
    expect(root).toHaveClass('my-root')
    expect(root.getAttribute('data-irr-theme')).toBe('dark')
  })
})
