import { defineConfig } from 'tsup'
import { readFile, writeFile } from 'node:fs/promises'

const ENTRIES = ['index', 'freehand', 'polygon', 'preset', 'core']

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    freehand: 'src/freehand.ts',
    polygon: 'src/polygon.ts',
    preset: 'src/preset.ts',
    core: 'src/core.ts',
  },
  format: ['esm', 'cjs'],
  target: 'es2019',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Keep each entry self-contained so chunks aren't hoisted apart.
  splitting: false,
  external: ['react', 'react-dom'],
  // Every entry renders React components / uses hooks, so each bundle is a
  // client module for the Next.js App Router. esbuild strips module-level
  // directives when bundling, so re-assert "use client" at the top afterwards.
  async onSuccess() {
    for (const name of ENTRIES) {
      for (const ext of ['js', 'mjs']) {
        const file = `dist/${name}.${ext}`
        const code = await readFile(file, 'utf8')
        if (!code.startsWith('"use client"')) {
          await writeFile(file, `"use client";\n${code}`)
        }
      }
    }
  },
})
