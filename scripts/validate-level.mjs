import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/game/domain/levelConfig.ts', import.meta.url), 'utf8')

function numericConstant(name) {
  const match = source.match(new RegExp(`export const ${name} = (\\d+)`))
  assert.ok(match, `missing numeric constant: ${name}`)
  return Number(match[1])
}

const levelWidth = numericConstant('LEVEL_WIDTH')
const startX = numericConstant('START_X')
const finishX = numericConstant('FINISH_X')

assert.ok(startX > 0 && startX < finishX, 'start must be before finish')
assert.ok(finishX > 0 && finishX < levelWidth, 'finish must be inside the level')

const checkpoints = [...source.matchAll(/id: 'cp-(\d+)'/g)].map((match) => Number(match[1]))
assert.ok(checkpoints.length >= 3, 'first race must define at least three checkpoints')
assert.deepEqual(checkpoints, [...checkpoints].sort((a, b) => a - b), 'checkpoint IDs must be ordered')

for (const required of [
  'PIT_ZONES',
  'BUMPER_CRATES',
  'TRAMPOLINES',
  'MUD_ZONES',
  'BOT_JUMP_ZONES',
]) {
  assert.ok(source.includes(`export const ${required}`), `missing level collection: ${required}`)
}

console.log('Kiddy Clash level configuration validated.')
