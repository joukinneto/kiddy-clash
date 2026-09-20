import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import { createKiddyGame } from './game/createGame'
import { HEROES, abilityLabel, type GameLanguage } from './game/domain/heroes'

const copy = {
  'pt-BR': {
    subtitle: 'Aventura dos Pequenos Heróis',
    versus: 'Contra o Computador',
    start: 'Jogar agora',
    language: 'Idioma',
    tip: 'Corra, pule, use o Super Salto e chegue antes da IA.',
    back: 'Voltar ao menu',
    crew: 'Conheça a galera',
  },
  'en-US': {
    subtitle: 'Little Heroes Adventure',
    versus: 'VS Computer',
    start: 'Play now',
    language: 'Language',
    tip: 'Run, jump, use Super Jump and finish ahead of the AI.',
    back: 'Back to menu',
    crew: 'Meet the crew',
  },
} satisfies Record<GameLanguage, Record<string, string>>

export default function App() {
  const [language, setLanguage] = useState<GameLanguage>('pt-BR')
  const [playing, setPlaying] = useState(false)
  const gameRef = useRef<Phaser.Game | null>(null)
  const t = copy[language]

  useEffect(() => {
    if (!playing) return

    gameRef.current = createKiddyGame('game-root', language)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [playing, language])

  if (playing) {
    return (
      <main className="game-shell">
        <div id="game-root" className="game-root" />
        <button className="back-button" onClick={() => setPlaying(false)}>
          ← {t.back}
        </button>
      </main>
    )
  }

  return (
    <main className="home">
      <section className="hero-card">
        <img className="game-logo" src="./assets/ui/kiddy-clash-logo.svg" alt="Kiddy Clash" />
        <p className="subtitle">{t.subtitle}</p>

        <div className="hero-row">
          <img className="lead-hero" src="./assets/characters/leo.svg" alt="Leo" />
          <div>
            <span className="mode-pill">🤖 {t.versus}</span>
            <h2>{t.versus}</h2>
            <p>{t.tip}</p>
          </div>
        </div>

        <button className="play-button" onClick={() => setPlaying(true)}>
          ▶ {t.start}
        </button>

        <div className="crew-section">
          <h3>{t.crew}</h3>
          <div className="hero-grid">
            {HEROES.map((hero) => (
              <div className="hero-chip" key={hero.id}>
                <img src={hero.asset} alt={hero.name} />
                <span>{hero.name}</span>
                <small>{abilityLabel(hero, language)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="language-row" aria-label={t.language}>
          <button
            className={language === 'pt-BR' ? 'active' : ''}
            onClick={() => setLanguage('pt-BR')}
          >
            🇧🇷 PT
          </button>
          <button
            className={language === 'en-US' ? 'active' : ''}
            onClick={() => setLanguage('en-US')}
          >
            🇺🇸 EN
          </button>
        </div>

        <small>Web/PWA • iOS • Android • Windows</small>
      </section>
    </main>
  )
}
