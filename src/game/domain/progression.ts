import type { GameLanguage, HeroId } from './heroes'

export const PROGRESSION_SCHEMA_VERSION = 1 as const

export type PlayerKind = 'guest' | 'account'

export type PlayerProfile = {
  localId: string
  displayName: string
  kind: PlayerKind
}

export type PlayerSettings = {
  language: GameLanguage
  musicVolume: number
  effectsVolume: number
}

export type PlayerStats = {
  racesCompleted: number
  wins: number
  bestTimeMs: number | null
}

export type PlayerProgress = {
  schemaVersion: typeof PROGRESSION_SCHEMA_VERSION
  profile: PlayerProfile
  xp: number
  stars: number
  coins: number
  selectedHero: HeroId
  settings: PlayerSettings
  stats: PlayerStats
  updatedAt: string
}

export type RaceReward = {
  placement: number
  starsCollected: number
  xpEarned: number
  coinsEarned: number
  elapsedMs?: number
}

export interface ProgressionRepository {
  load(): Promise<PlayerProgress>
  save(progress: PlayerProgress): Promise<PlayerProgress>
  applyRaceReward(reward: RaceReward): Promise<PlayerProgress>
  updateLanguage(language: GameLanguage): Promise<PlayerProgress>
  updateDisplayName(displayName: string): Promise<PlayerProgress>
  updateSelectedHero(heroId: HeroId): Promise<PlayerProgress>
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createDefaultProgress(language: GameLanguage = 'pt-BR'): PlayerProgress {
  return {
    schemaVersion: PROGRESSION_SCHEMA_VERSION,
    profile: {
      localId: createLocalId(),
      displayName: language === 'pt-BR' ? 'Pequeno Herói' : 'Little Hero',
      kind: 'guest',
    },
    xp: 0,
    stars: 0,
    coins: 0,
    selectedHero: 'leo',
    settings: {
      language,
      musicVolume: 0.8,
      effectsVolume: 0.9,
    },
    stats: {
      racesCompleted: 0,
      wins: 0,
      bestTimeMs: null,
    },
    updatedAt: new Date().toISOString(),
  }
}

export function sanitizeDisplayName(value: string) {
  const normalized = value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24)

  return normalized || 'Little Hero'
}

export function playerLevel(xp: number) {
  return Math.max(1, Math.floor(Math.max(0, xp) / 500) + 1)
}
