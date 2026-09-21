import Phaser from 'phaser'
import type { GameLanguage } from './domain/heroes'
import { RaceScene } from './scenes/RaceScene'

export function createKiddyGame(parent: string, language: GameLanguage) {
  return new Phaser.Game({
    // Canvas is intentional for the first playable: it renders our SVG hero
    // textures consistently in browsers, Capacitor and Electron. Revisit
    // WebGL only after the production asset pipeline/performance benchmark.
    type: Phaser.CANVAS,
    parent,
    backgroundColor: '#72c9ff',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1050 },
        debug: false,
      },
    },
    scene: [new RaceScene(language)],
  })
}
