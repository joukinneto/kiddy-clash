# Kiddy Clash — Architecture

Active workflows: `KIDDY-MVP-002` + `KIDDY-ART-001`

Completed gameplay baseline: `KIDDY-MVP-001`

## Runtime layers

### React shell

Owns:
- menus
- language selection
- character selection
- profile/progression UI
- settings

### Phaser 3 gameplay

Owns:
- race scenes
- movement
- physics
- camera
- collectibles
- AI opponents
- HUD elements tightly coupled to gameplay

### Platform packaging

- Web/PWA: Vite output
- iOS: Capacitor
- Android: Capacitor
- Windows: Electron

### Online phase

After the offline/AI first playable is stable:
- Supabase Auth/PostgreSQL for persistence
- WebSockets / authoritative game server for realtime matches

## Shared-core rule

Gameplay and domain logic must remain platform-agnostic. Platform adapters cannot become separate product implementations.

## Visual production phase

The first playable validated gameplay with lightweight/provisional runtime art.

`KIDDY-ART-001` now upgrades that runtime toward the approved premium Kiddy Clash identity using:

- production-target character sprites/atlases
- layered 2D/2.5D environment art
- premium React/Phaser UI treatment
- animation
- particles/VFX
- audio cues
- visual regression evidence

The visual target is defined in `docs/ART_DIRECTION.md`.

The runtime asset contract is defined in `docs/ART_ASSET_PIPELINE.md`.

The first vertical slice does **not** require a realtime 3D engine. Any move to true realtime 3D requires a separate architecture decision.

## Engine version policy

The approved product handoff specifies Phaser 3. The bootstrap therefore uses the maintained 3.x line. A Phaser 4 migration requires an explicit architecture decision because it is a major-version change.

## Environments

Development: authorized.

Test: authorized.

Production: protected.
