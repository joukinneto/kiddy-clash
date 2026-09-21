import {
  createDefaultProgress,
  PROGRESSION_SCHEMA_VERSION,
  sanitizeDisplayName,
  type PlayerProgress,
  type ProgressionRepository,
  type RaceReward,
} from '../domain/progression'
import type { GameLanguage, HeroId } from '../domain/heroes'

export const LOCAL_PROGRESS_KEY = 'kiddy-clash:player-progress:v1'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeProgress(value: unknown): PlayerProgress | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<PlayerProgress>
  if (candidate.schemaVersion !== PROGRESSION_SCHEMA_VERSION) return null
  if (!candidate.profile || typeof candidate.profile.localId !== 'string') return null

  const base = createDefaultProgress(candidate.settings?.language ?? 'pt-BR')

  return {
    ...base,
    ...candidate,
    profile: {
      ...base.profile,
      ...candidate.profile,
      displayName: sanitizeDisplayName(candidate.profile.displayName ?? base.profile.displayName),
    },
    settings: {
      ...base.settings,
      ...candidate.settings,
    },
    stats: {
      ...base.stats,
      ...candidate.stats,
    },
    xp: Math.max(0, Number(candidate.xp ?? 0)),
    stars: Math.max(0, Number(candidate.stars ?? 0)),
    coins: Math.max(0, Number(candidate.coins ?? 0)),
    updatedAt: candidate.updatedAt ?? base.updatedAt,
  }
}

export class LocalProgressionRepository implements ProgressionRepository {
  private memory: PlayerProgress | null = null

  async load() {
    if (this.memory) return this.memory

    if (canUseStorage()) {
      try {
        const raw = window.localStorage.getItem(LOCAL_PROGRESS_KEY)
        if (raw) {
          const parsed = normalizeProgress(JSON.parse(raw))
          if (parsed) {
            this.memory = parsed
            return parsed
          }
        }
      } catch {
        // Corrupt or unavailable storage falls back to a clean guest profile.
      }
    }

    const fresh = createDefaultProgress()
    return this.save(fresh)
  }

  async save(progress: PlayerProgress) {
    const normalized = normalizeProgress({
      ...progress,
      updatedAt: new Date().toISOString(),
    }) ?? createDefaultProgress(progress.settings.language)

    this.memory = normalized

    if (canUseStorage()) {
      try {
        window.localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(normalized))
      } catch {
        // In-memory state remains usable when persistent storage is unavailable.
      }
    }

    return normalized
  }

  async applyRaceReward(reward: RaceReward) {
    const current = await this.load()
    const elapsed = reward.elapsedMs
    const nextBest =
      typeof elapsed === 'number' && elapsed > 0
        ? current.stats.bestTimeMs === null
          ? elapsed
          : Math.min(current.stats.bestTimeMs, elapsed)
        : current.stats.bestTimeMs

    return this.save({
      ...current,
      xp: current.xp + Math.max(0, reward.xpEarned),
      stars: current.stars + Math.max(0, reward.starsCollected),
      coins: current.coins + Math.max(0, reward.coinsEarned),
      stats: {
        racesCompleted: current.stats.racesCompleted + 1,
        wins: current.stats.wins + (reward.placement === 1 ? 1 : 0),
        bestTimeMs: nextBest,
      },
    })
  }

  async updateLanguage(language: GameLanguage) {
    const current = await this.load()
    return this.save({
      ...current,
      settings: { ...current.settings, language },
    })
  }

  async updateDisplayName(displayName: string) {
    const current = await this.load()
    return this.save({
      ...current,
      profile: {
        ...current.profile,
        displayName: sanitizeDisplayName(displayName),
      },
    })
  }

  async updateSelectedHero(heroId: HeroId) {
    const current = await this.load()
    return this.save({ ...current, selectedHero: heroId })
  }
}

export const localProgressionRepository = new LocalProgressionRepository()
