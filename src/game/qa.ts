export type KiddyQaState = {
  sceneReady: boolean
  playerX: number
  playerY: number
  velocityX: number
  velocityY: number
  grounded: boolean
  stars: number
  checkpoint: number
  position: number
  progress: number
  abilityReadyAt: number
  finished: boolean
  spaceDown: boolean
  shiftDown: boolean
  jumpCount: number
  abilityCount: number
  lastEvent: string
}

declare global {
  interface Window {
    __KIDDY_QA__?: KiddyQaState
  }
}

export function isQaEnabled() {
  return typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('qa')
}

export function initializeQaState() {
  if (!isQaEnabled()) return

  window.__KIDDY_QA__ = {
    sceneReady: false,
    playerX: 0,
    playerY: 0,
    velocityX: 0,
    velocityY: 0,
    grounded: false,
    stars: 0,
    checkpoint: 0,
    position: 4,
    progress: 0,
    abilityReadyAt: 0,
    finished: false,
    spaceDown: false,
    shiftDown: false,
    jumpCount: 0,
    abilityCount: 0,
    lastEvent: 'boot',
  }
}

export function updateQaState(patch: Partial<KiddyQaState>) {
  if (!window.__KIDDY_QA__) return
  Object.assign(window.__KIDDY_QA__, patch)
}
