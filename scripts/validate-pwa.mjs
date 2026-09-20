import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(
  readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'),
)
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const mainTsx = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')

assert.equal(manifest.display, 'standalone')
assert.equal(manifest.orientation, 'landscape')
assert.equal(manifest.start_url, './')
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0)
assert.ok(serviceWorker.includes("addEventListener('fetch'"))
assert.ok(indexHtml.includes('manifest.webmanifest'))
assert.ok(mainTsx.includes('serviceWorker.register'))

console.log('Kiddy Clash PWA contract validated.')
