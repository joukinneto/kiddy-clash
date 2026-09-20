export const LEVEL_WIDTH = 3600
export const START_X = 390
export const FINISH_X = 3420

export const CHECKPOINTS = [
  { id: 'cp-1', x: 1050, respawnX: 980, respawnY: 470 },
  { id: 'cp-2', x: 2250, respawnX: 2200, respawnY: 470 },
  { id: 'cp-3', x: 3060, respawnX: 3000, respawnY: 470 },
] as const

export const PIT_ZONES = [
  { from: 1920, to: 2240 },
  { from: 2560, to: 2880 },
] as const

export const BUMPER_CRATES = [
  { x: 690, y: 574 },
  { x: 1535, y: 574 },
  { x: 2550, y: 574 },
] as const

export const TRAMPOLINES = [
  { x: 1210, y: 585 },
  { x: 2390, y: 585 },
] as const

export const MUD_ZONES = [
  { from: 500, to: 610 },
  { from: 3160, to: 3300 },
] as const

export const BOT_JUMP_ZONES = [
  [620, 760],
  [1140, 1260],
  [1470, 1610],
  [1780, 2260],
  [2320, 2470],
  [2470, 2940],
] as const
