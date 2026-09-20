# Kiddy Clash — Architecture

Workflow: `KIDDY-MVP-001`

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

## Current prototype

The initial prototype intentionally uses generated geometric textures instead of final character art so gameplay can be validated before the production asset pipeline is introduced.

## Engine version policy

The approved product handoff specifies Phaser 3. The bootstrap therefore uses the maintained 3.x line. A Phaser 4 migration requires an explicit architecture decision because it is a major-version change.

## Environments

Development: authorized.

Test: authorized.

Production: protected.
