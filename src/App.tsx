import { useEffect, useRef, useState } from 'react'
import type Phaser from 'phaser'
import { createKiddyGame } from './game/createGame'

type Language = 'pt-BR' | 'en-US'

const copy = {
  'pt-BR': {
    subtitle: 'Aventura dos Pequenos Heróis',
    versus: 'Contra o Computador',
    start: 'Jogar agora',
    language: 'Idioma',
    tip: 'Corra, pule, colete estrelas e chegue antes da IA.',
    back: 'Voltar ao menu',
  },
  'en-US': {
    subtitle: 'Little Heroes Adventure',
    versus: 'VS Computer',
    start: 'Play now',
    language: 'Language',
    tip: 'Run, jump, collect stars and finish ahead of the AI.',
    back: 'Back to menu',
  },
} satisfies Record<Language, Record<string, string>>

export default function App() {
  const [language, setLanguage] = useState<Language>('pt-BR')
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
        <div className="logo-mark">👑</div>
        <h1>KIDDY <span>CLASH</span></h1>
        <p className="subtitle">{t.subtitle}</p>
        <div className="hero-row">
          <div className="mascot">🦁</div>
          <div>
            <h2>{t.versus}</h2>
            <p>{t.tip}</p>
          </div>
        </div>
        <button className="play-button" onClick={() => setPlaying(true)}>
          ▶ {t.start}
        </button>
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
