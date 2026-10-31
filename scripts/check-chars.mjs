#!/usr/bin/env node
// pnpm check:chars - convention du projet : le code, les commentaires et les contenus n'utilisent que de l'ASCII
// et les lettres accentuees francaises. Pas de fleches, tirets longs, guillemets typographiques, points medians,
// traits de dessin... Dans les commentaires on ecrit avec des caracteres simples (- _ < > ...), dans l'interface
// on utilise des icones (voir app/components/ui/UiIcon.vue).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SKIP_DIRS = new Set([
  'node_modules',
  '.nuxt',
  '.output',
  '.data',
  '.git',
  'test-results',
  'playwright-report',
  'coverage',
])
const SKIP_FILES = new Set(['pnpm-lock.yaml'])
const BINARY = new Set(['.woff2', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.ico', '.zip', '.gitkeep'])
const ALLOWED = new Set([...'àâäæçéèêëîïôöœùûüÿÀÂÄÆÇÉÈÊËÎÏÔÖŒÙÛÜŸ'])

const bad = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full)
      continue
    }
    if (SKIP_FILES.has(name) || BINARY.has(extname(name))) continue
    readFileSync(full, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        for (const ch of line) {
          if (ch.charCodeAt(0) > 127 && !ALLOWED.has(ch))
            bad.push(
              `${relative(ROOT, full)}:${i + 1}  U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}  ${line.trim().slice(0, 80)}`,
            )
        }
      })
  }
}
walk(ROOT)

if (bad.length) {
  console.error(`${bad.length} caractere(s) interdit(s) :\n  ${bad.slice(0, 40).join('\n  ')}`)
  process.exit(1)
}
console.log('check:chars OK (ASCII + lettres accentuees francaises uniquement)')
