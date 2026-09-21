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
    crew: 'Escolha seu herói',
    adventure: 'Corrida das Ilhas',
    level: 'Nível 1',
    ready: 'Aventura pronta!',
  },
  'en-US': {
    subtitle: 'Little Heroes Adventure',
    versus: 'VS Computer',
    start: 'Play now',
    language: 'Language',
    tip: 'Run, jump, use Super Jump and finish ahead of the AI.',
    back: 'Back to menu',
    crew: 'Choose your hero',
    adventure: 'Island Race',
    level: 'Level 1',
    ready: 'Adventure ready!',
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
        <button
          className="back-button"
          aria-label={t.back}
          title={t.back}
          onClick={() => setPlaying(false)}
        >
          <span aria-hidden="true">←</span>
        </button>
      </main>
    )
  }

  return (
    <main className="home">
      <div className="sky-scene" aria-hidden="true">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <span className="cloud cloud-three" />
        <span className="floating-island island-one" />
        <span className="floating-island island-two" />
        <span className="rainbow-arc" />
        <span className="airship">🎈</span>
      </div>

      <section className="game-home" aria-label="Kiddy Clash">
        <header className="player-bar">
          <div className="player-profile">
            <div className="avatar-ring">
              <img src="./assets/characters/leo.svg" alt="" aria-hidden="true" />
            </div>
            <div className="profile-copy">
              <strong>Leo</strong>
              <span>{t.level}</span>
              <div className="xp-track" aria-label="XP">
                <span className="xp-fill" />
              </div>
            </div>
          </div>

          <div className="currency-cluster" aria-label="Game status">
            <span className="currency-pill star-pill">⭐ <strong>120</strong></span>
            <span className="currency-pill coin-pill">🪙 <strong>350</strong></span>
          </div>
        </header>

        <section className="hero-stage">
          <img className="game-logo" src="./assets/ui/kiddy-clash-logo.svg" alt="Kiddy Clash" />
          <p className="subtitle">{t.subtitle}</p>

          <div className="character-stage" aria-hidden="true">
            <img className="stage-character stage-bibi" src="./assets/characters/bibi.svg" alt="" />
            <img className="stage-character stage-foxy" src="./assets/characters/foxy.svg" alt="" />
            <img className="stage-character stage-leo" src="./assets/characters/leo.svg" alt="" />
            <img className="stage-character stage-pandy" src="./assets/characters/pandy.svg" alt="" />
            <img className="stage-character stage-dino" src="./assets/characters/dino.svg" alt="" />
          </div>

          <div className="adventure-card">
            <div className="mode-badge">🏝️ {t.adventure}</div>
            <div className="mode-copy">
              <span className="mode-pill">🤖 {t.versus}</span>
              <h2>{t.versus}</h2>
              <p>{t.tip}</p>
            </div>
            <div className="mode-preview" aria-hidden="true">
              <span>⭐</span>
              <span>🏰</span>
              <span>🌈</span>
            </div>
          </div>

          <button className="play-button" onClick={() => setPlaying(true)}>
            <span className="play-icon" aria-hidden="true">▶</span>
            <span>
              <strong>{t.start}</strong>
              <small>{t.ready}</small>
            </span>
          </button>
        </section>

        <section className="crew-section">
          <div className="section-title">
            <h3>{t.crew}</h3>
            <span>8</span>
          </div>
          <div className="hero-grid">
            {HEROES.map((hero, index) => (
              <div className={`hero-chip ${index === 0 ? 'selected' : ''}`} key={hero.id}>
                <div className="hero-portrait">
                  <img src={hero.asset} alt={hero.name} />
                  {index === 0 && <span className="selected-mark">✓</span>}
                </div>
                <span>{hero.name}</span>
                <small>{abilityLabel(hero, language)}</small>
              </div>
            ))}
          </div>
        </section>

        <footer className="home-footer">
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
        </footer>
      </section>
    </main>
  )
}
