# AGENTS.md — Kiddy Clash

## Authority

This repository is the canonical product-code repository for `product_id: kiddy-clash` under JKDD Continuous governance.

## Mandatory rules

1. Preserve the approved Kiddy Clash product identity, characters and abilities.
2. Target Web/PWA, iOS, Android and Windows from a shared core whenever technically reasonable.
3. Development and Test automation are authorized.
4. Production is protected. No production deployment without explicit human authorization.
5. Never commit secrets, API keys, tokens, passwords or private credentials.
6. All agent work must be attributable to `product_id: kiddy-clash` and a task/workflow ID.
7. Prefer pull requests for structural changes.
8. PT-BR and EN-US are required product languages.
9. Child safety is mandatory. No unrestricted child chat, gambling-like mechanics or pay-to-win.
10. Premium visual work must follow `docs/ART_DIRECTION.md` and `docs/ART_ASSET_PIPELINE.md`.
11. Concept/key art defines the quality/identity target; runtime art must be optimized, animated and gameplay-readable.
12. Do not introduce copyrighted third-party game characters, maps or copied franchise assets.

## Approved stack

- TypeScript
- Phaser 3.x
- React
- Vite
- Capacitor for iOS/Android
- Electron for Windows
- Supabase/PostgreSQL for persistence
- WebSockets / authoritative game server for realtime multiplayer

## Active workflows

### KIDDY-MVP-002 — Account, Profile & Saved Progression

Backend/profile/progression foundation. Runs in Development/Test.

### KIDDY-ART-001 — Premium Visual Direction & Vertical Slice

Art & Polish Cell workflow. Runs in parallel with MVP 2.

Owners include:

- KC-ART-DIRECTOR
- KC-CHARACTERS
- KC-UIUX
- KC-TECH-ART
- KC-ANIMATION
- KC-VFX
- KC-AUDIO
- KC-LEVEL
- KC-PERFORMANCE
- KC-QA

## Completed workflow

`KIDDY-MVP-001 — First Playable Race`

The tested first playable remains the gameplay regression baseline.

## Production

🔒 Protected / not authorized.
