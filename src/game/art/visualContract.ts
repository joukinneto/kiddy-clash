export const ART_DIRECTION_VERSION = '1.0.0' as const

export const PREMIUM_VERTICAL_SLICE_HEROES = [
  'leo',
  'bibi',
  'foxy',
  'max',
] as const

export const REQUIRED_HERO_MOTION_STATES = [
  'idle',
  'run',
  'jump',
  'fall',
  'ability',
  'finish',
  'celebrate',
] as const

export const REQUIRED_SCENE_LAYERS = [
  'far-sky',
  'far-islands',
  'midground',
  'gameplay',
  'foreground',
  'vfx-ui',
] as const

export const REQUIRED_VERTICAL_SLICE_VFX = [
  'star-pickup',
  'super-jump',
  'landing',
  'checkpoint',
  'trampoline',
  'finish',
  'ui-press',
] as const

export const ART_PALETTE = {
  skyBlue: '#67C4FF',
  deepBlue: '#267EE6',
  heroGold: '#FFD43B',
  actionGreen: '#48C75B',
  challengeCoral: '#F05A4F',
  socialPurple: '#8B4DE8',
  warmOrange: '#FF9C2F',
  grassGreen: '#63C85D',
  earthBrown: '#8B5D34',
  ink: '#17324D',
  cloudWhite: '#FFFFFF',
} as const

export const ART_PERFORMANCE_BUDGET = {
  targetFps: 60,
  minimumFps: 30,
  maxActiveParallaxLayers: 6,
  preferredGameplayAtlasMaxDimension: 2048,
  qualityTiers: ['high', 'balanced', 'low'],
} as const

export type ArtQualityTier =
  (typeof ART_PERFORMANCE_BUDGET.qualityTiers)[number]
