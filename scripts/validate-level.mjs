import assert from 'node:assert/strict'
import {
  BOT_JUMP_ZONES,
  BUMPER_CRATES,
  CHECKPOINTS,
  FINISH_X,
  LEVEL_WIDTH,
  MUD_ZONES,
  PIT_ZONES,
  TRAMPOLINES,
} from '../src/game/domain/levelConfig.js'

assert.ok(FINISH_X < LEVEL_WIDTH, 'finish must be inside the level')
assert.ok(CHECKPOINTS.length >= 3, 'first race should have at least three checkpoints')

let previousCheckpoint = 0
for (const checkpoint of CHECKPOINTS) {
  assert.ok(checkpoint.x > previousCheckpoint, 'checkpoints must be strictly ordered')
  assert.ok(checkpoint.x < FINISH_X, 'checkpoint must be before finish')
  assert.ok(checkpoint.respawnX <= checkpoint.x, 'respawn should not be beyond checkpoint')
  previousCheckpoint = checkpoint.x
}

for (const zone of [...PIT_ZONES, ...MUD_ZONES]) {
  assert.ok(zone.from < zone.to, 'zone start must be before zone end')
  assert.ok(zone.from >= 0 && zone.to <= LEVEL_WIDTH, 'zone must stay inside level')
}

for (const obstacle of [...BUMPER_CRATES, ...TRAMPOLINES]) {
  assert.ok(obstacle.x > 0 && obstacle.x < FINISH_X, 'obstacle must be on the race course')
}

for (const [from, to] of BOT_JUMP_ZONES) {
  assert.ok(from < to, 'bot jump zones must be ordered')
}

console.log('Kiddy Clash level configuration validated.')
