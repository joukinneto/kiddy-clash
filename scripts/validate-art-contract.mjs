import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const direction = readFileSync(new URL('../docs/ART_DIRECTION.md', import.meta.url), 'utf8')
const pipeline = readFileSync(new URL('../docs/ART_ASSET_PIPELINE.md', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../src/game/art/visualContract.ts', import.meta.url), 'utf8')
const manifest = readFileSync(new URL('../src/game/art/assetManifest.ts', import.meta.url), 'utf8')

for (const hero of ['Leo', 'Bibi', 'Foxy', 'Max']) {
  assert.ok(direction.includes(hero), `visual bible must define ${hero}`)
}

for (const state of ['idle', 'run', 'jump', 'fall', 'ability', 'finish']) {
  assert.ok(contract.includes(`'${state}'`), `motion state missing: ${state}`)
}

for (const layer of ['far-sky', 'far-islands', 'midground', 'gameplay', 'foreground', 'vfx-ui']) {
  assert.ok(contract.includes(`'${layer}'`), `scene layer missing: ${layer}`)
}

assert.ok(direction.includes('Key art vs runtime art'), 'key/runtime art distinction is required')
assert.ok(direction.includes('PT-BR and EN-US'), 'localization rule is required')
assert.ok(pipeline.includes('Collision and gameplay logic must not depend on decorative pixels'), 'art/gameplay separation rule is required')
assert.ok(manifest.includes('requiredForVerticalSlice: true'), 'vertical-slice manifest entries are required')
assert.ok(direction.includes('copy characters/maps from existing game franchises'), 'originality prohibition is required')

console.log('Kiddy Clash premium art contract validated.')
