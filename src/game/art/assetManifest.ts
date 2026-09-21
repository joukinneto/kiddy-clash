import {
  PREMIUM_VERTICAL_SLICE_HEROES,
  REQUIRED_HERO_MOTION_STATES,
  REQUIRED_SCENE_LAYERS,
  REQUIRED_VERTICAL_SLICE_VFX,
} from './visualContract'

export type ArtAssetStatus =
  | 'placeholder'
  | 'concept-approved'
  | 'production-target'
  | 'optimized'
  | 'qa-passed'

export type ArtAssetEntry = {
  id: string
  category: 'character' | 'environment' | 'ui' | 'vfx' | 'audio'
  owner: string
  status: ArtAssetStatus
  requiredForVerticalSlice: boolean
}

export const ART_ASSET_MANIFEST: readonly ArtAssetEntry[] = [
  ...PREMIUM_VERTICAL_SLICE_HEROES.map((hero) => ({
    id: `character:${hero}`,
    category: 'character' as const,
    owner: 'KC-CHARACTERS',
    status: 'concept-approved' as const,
    requiredForVerticalSlice: true,
  })),
  ...REQUIRED_SCENE_LAYERS.map((layer) => ({
    id: `environment:rainbow-world:${layer}`,
    category: 'environment' as const,
    owner: 'KC-TECH-ART',
    status: 'placeholder' as const,
    requiredForVerticalSlice: true,
  })),
  {
    id: 'ui:premium-main-menu',
    category: 'ui',
    owner: 'KC-UIUX',
    status: 'concept-approved',
    requiredForVerticalSlice: true,
  },
  {
    id: 'ui:premium-race-hud',
    category: 'ui',
    owner: 'KC-UIUX',
    status: 'concept-approved',
    requiredForVerticalSlice: true,
  },
  ...REQUIRED_VERTICAL_SLICE_VFX.map((effect) => ({
    id: `vfx:${effect}`,
    category: 'vfx' as const,
    owner: 'KC-VFX',
    status: 'placeholder' as const,
    requiredForVerticalSlice: true,
  })),
  {
    id: 'audio:vertical-slice-core',
    category: 'audio',
    owner: 'KC-AUDIO',
    status: 'placeholder',
    requiredForVerticalSlice: true,
  },
] as const

export const HERO_ANIMATION_REQUIREMENTS = Object.fromEntries(
  PREMIUM_VERTICAL_SLICE_HEROES.map((hero) => [
    hero,
    [...REQUIRED_HERO_MOTION_STATES],
  ]),
)
