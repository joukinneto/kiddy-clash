export type GameLanguage = 'pt-BR' | 'en-US'

export type HeroId =
  | 'leo'
  | 'pandy'
  | 'bibi'
  | 'foxy'
  | 'max'
  | 'mimi'
  | 'dino'
  | 'b01'

export type HeroDefinition = {
  id: HeroId
  name: string
  asset: string
  ability: {
    pt: string
    en: string
    cooldownMs: number
  }
}

export const HEROES: readonly HeroDefinition[] = [
  {
    id: 'leo',
    name: 'Leo',
    asset: './assets/characters/leo.svg',
    ability: { pt: 'Super Salto', en: 'Super Jump', cooldownMs: 5000 },
  },
  {
    id: 'pandy',
    name: 'Pandy',
    asset: './assets/characters/pandy.svg',
    ability: { pt: 'Escudo', en: 'Shield', cooldownMs: 7000 },
  },
  {
    id: 'bibi',
    name: 'Bibi',
    asset: './assets/characters/bibi.svg',
    ability: { pt: 'Corrida Turbo', en: 'Turbo Run', cooldownMs: 6000 },
  },
  {
    id: 'foxy',
    name: 'Foxy',
    asset: './assets/characters/foxy.svg',
    ability: { pt: 'Dash Rápido', en: 'Quick Dash', cooldownMs: 5000 },
  },
  {
    id: 'max',
    name: 'Max',
    asset: './assets/characters/max.svg',
    ability: { pt: 'Detector de Tesouros', en: 'Treasure Finder', cooldownMs: 8000 },
  },
  {
    id: 'mimi',
    name: 'Mimi',
    asset: './assets/characters/mimi.svg',
    ability: { pt: 'Pulo Duplo', en: 'Double Jump', cooldownMs: 4500 },
  },
  {
    id: 'dino',
    name: 'Dino',
    asset: './assets/characters/dino.svg',
    ability: { pt: 'Super Impulso', en: 'Power Boost', cooldownMs: 6500 },
  },
  {
    id: 'b01',
    name: 'B-01',
    asset: './assets/characters/b01.svg',
    ability: { pt: 'Ímã Estelar', en: 'Star Magnet', cooldownMs: 7000 },
  },
] as const

export const HERO_BY_ID = Object.fromEntries(
  HEROES.map((hero) => [hero.id, hero]),
) as Record<HeroId, HeroDefinition>

export function abilityLabel(hero: HeroDefinition, language: GameLanguage) {
  return language === 'pt-BR' ? hero.ability.pt : hero.ability.en
}
