#!/usr/bin/env node
// pnpm images:check — compare le manifeste d'images avec ce qui est réellement dans public/.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const manifest = JSON.parse(readFileSync(join(root, 'content/images.manifest.json'), 'utf8'))
const EXT = ['jpg', 'jpeg', 'webp', 'png', 'avif', 'svg']
const present = (path) => {
  const base = path.replace(/\.[a-z0-9]+$/i, '')
  return [path, ...EXT.map((e) => `${base}.${e}`)].some((p) => existsSync(join(root, 'public', p)))
}

let missingRequired = 0
const rows = manifest.images.map((i) => ({ ok: present(i.path), ...i }))
for (const r of rows) {
  const mark = r.ok ? '✅' : r.required ? '❌' : '⬜'
  console.log(
    `${mark} ${r.path.padEnd(46)} ${String(r.ratio).padEnd(9)} ≥ ${r.minWidth}×${r.minHeight || '—'}  ${r.required ? '(requis)' : '(optionnel)'}`,
  )
  if (!r.ok && r.required) missingRequired++
}
const have = rows.filter((r) => r.ok).length
console.log(
  `\n${have}/${rows.length} images présentes — ${missingRequired} requise(s) manquante(s). Les manquantes s'affichent en placeholder.`,
)
