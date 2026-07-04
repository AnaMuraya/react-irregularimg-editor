import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  IrregularImageEditor,
  IrregularImageEditorHandle,
  EditorTheme,
  ExportResult,
} from '../src'

function makeTestImage(): string {
  const c = document.createElement('canvas')
  c.width = 600
  c.height = 600
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 600, 600)
  g.addColorStop(0, '#ff6b6b')
  g.addColorStop(0.5, '#feca57')
  g.addColorStop(1, '#48dbfb')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 600, 600)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.font = 'bold 90px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('TEST', 300, 330)
  return c.toDataURL('image/png')
}

function App() {
  const [src, setSrc] = useState('')
  const [theme, setTheme] = useState<EditorTheme>('light')
  const objectUrl = useRef<string | null>(null)
  const editor = useRef<IrregularImageEditorHandle>(null)
  const [exported, setExported] = useState<ExportResult | null>(null)

  useEffect(() => setSrc(makeTestImage()), [])

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    const url = URL.createObjectURL(file)
    objectUrl.current = url
    setExported(null) // clear any previous export when a new image loads
    setSrc(url)
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: 'system-ui',
        background: theme === 'dark' ? '#111318' : '#fafafa',
        color: theme === 'dark' ? '#e7e7ea' : '#111',
        minHeight: '100vh',
      }}
    >
      <h2>react-irregularimg-editor demo</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <label>
          <strong>Your image: </strong>
          <input id="file-input" type="file" accept="image/*" onChange={onFile} />
        </label>
        <button onClick={() => setSrc(makeTestImage())}>Use test image</button>
        <label>
          <strong>Theme: </strong>
          <select value={theme} onChange={(e) => setTheme(e.target.value as EditorTheme)}>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
      </div>

      {src && (
        <IrregularImageEditor
          ref={editor}
          src={src}
          width={500}
          height={400}
          initialShape="star"
          theme={theme}
          cssVars={{ ['--irr-accent' as any]: '#e11d48' }}
        />
      )}

      <div style={{ marginTop: 16 }}>
        <button
          id="verify-export"
          onClick={async () => {
            const r = await editor.current!.export()
            setExported(r)
          }}
        >
          Export &amp; preview
        </button>
        {exported && (
          <span id="status" style={{ marginLeft: 12 }}>
            EXPORT_OK {exported.width}x{exported.height} blob={exported.blob.size}{' '}
            svg={exported.svg.length}
          </span>
        )}
      </div>

      {/* Only render the preview once there is something to show. */}
      {exported && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
            Exported crop (transparent PNG):
          </div>
          <img
            id="preview"
            src={exported.dataUrl}
            alt="Exported crop"
            style={{
              maxWidth: 500,
              backgroundImage:
                'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
            }}
          />
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
