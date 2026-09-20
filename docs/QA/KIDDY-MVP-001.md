# KIDDY-MVP-001 — First Playable Race QA Matrix

Product ID: `kiddy-clash`

Environment scope: Development / Test only.

Production: protected.

## Functional acceptance

| Criterion | Expected result | Current implementation |
| --- | --- | --- |
| Launch | Game opens from React/Vite shell | Implemented |
| PT/EN | Player can switch Portuguese and English | Implemented |
| Leo | Leo is the playable hero | Implemented |
| VS Computer | Player can start a race against computer racers | Implemented |
| Movement | Keyboard and touch movement work | Implemented |
| Jump | Keyboard and touch jump work | Implemented |
| Hero ability | Leo Super Jump works with cooldown | Implemented |
| Stars | Stars can be collected and counted | Implemented |
| AI racers | Bibi, Max and Foxy progress through the course | Implemented |
| Position | HUD reports position out of 4 racers | Implemented |
| Timer | Race timer updates during play | Implemented |
| Progress | HUD reports percentage to finish | Implemented |
| Checkpoints | Three checkpoints update recovery position | Implemented |
| Fall recovery | Falling returns player to latest checkpoint | Implemented |
| Obstacles | Crates cause a safe knock-back | Implemented |
| Trampolines | Trampolines launch the player | Implemented |
| Slow zones | Mud zones reduce movement speed | Implemented |
| Finish | Finish line completes the race | Implemented |
| Results | Placement, stars, checkpoint count and XP display | Implemented |
| Replay | Result screen restarts into a clean playable state | Implemented |
| Shared core | Gameplay remains shared across platform wrappers | Implemented |
| iOS readiness | Capacitor configuration remains present | Scaffolded |
| Android readiness | Capacitor configuration remains present | Scaffolded |
| Windows readiness | Electron shell remains present | Scaffolded |

## Automated checks

CI must pass:

1. Install
2. First-level configuration validation
3. TypeScript typecheck
4. Production build

## Manual test passes still required before closing KIDDY-MVP-001

- Keyboard playthrough on Windows/Web
- Touch playthrough in mobile viewport
- Checkpoint recovery at all three checkpoints
- Each pit crossed by human player and AI racers
- Crate collision does not trap the player
- Trampoline cannot infinitely retrigger
- Super Jump cooldown cannot be bypassed
- Finish/replay does not duplicate Phaser instances
- Responsive HUD remains readable at small landscape widths

## Out of scope for this workflow

- Realtime multiplayer
- Persistent login/profile
- Supabase progression persistence
- App Store / Google Play production publication
- Production deployment
