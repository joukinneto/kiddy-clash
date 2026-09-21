# KIDDY-MVP-001 — Visual Gap Review

Workflow: `KIDDY-MVP-001 — First Playable Race`

Product: `kiddy-clash`

Environment: Development/Test

## Approved visual direction

Kiddy Clash should read as a premium children's game rather than a generic website or technical demo.

Binding direction:

- premium child-friendly cartoon presentation
- rounded shapes and large expressive characters
- bright fantasy environments
- floating islands
- waterfalls
- castles
- bridges / adventure landmarks
- balloons or airships
- rainbow / colorful nature
- saturated blue, green, yellow, orange, pink, purple and white
- large rounded controls
- simple icons
- playful typography
- high contrast
- little text during gameplay
- canonical character identity must remain recognizable

## Gap found in the previous build

The previous home screen was structurally functional but visually read as a web card:

- large white centered card
- weak game-world framing
- limited fantasy depth
- character roster presented as a utility grid
- no player-status HUD
- minimal sense of progression
- gameplay environment composed mostly from flat primitives without enough depth

The gameplay loop itself already existed and should not be restarted.

## Development increment implemented

### Home / lobby

- fantasy-sky world background
- floating islands and rainbow decorations
- player avatar + level + XP presentation
- stars / coins status chips
- larger hero staging
- canonical characters around the logo
- dedicated Island Race mode card
- stronger Play CTA
- hero selection strip with Leo selected
- PT/EN controls preserved
- existing Playwright accessible names preserved

### Race environment

- layered sky
- sun / cloud depth
- distant mountain silhouettes
- richer floating islands
- waterfalls
- trees and foliage
- castle landmark
- balloon / airship silhouettes
- richer rainbow treatment
- improved pits and mud visual treatment
- gameplay geometry and physics intentionally unchanged

## Not solved yet

This increment improves composition and visual hierarchy but is not the final art pass.

Still required:

- replace simple generated gameplay racers with production-quality character sprites/animation
- higher-quality world art assets
- more polished obstacle art
- improved VFX / particles
- animation pass
- sound/music pass
- visual comparison using fresh Playwright screenshots
- iterative QA against the approved reference direction

## QA gate

The existing CI must continue to validate:

- level contract
- PWA contract
- TypeScript
- Web build
- Playwright gameplay
- visual screenshots
- Android debug build
- iOS simulator build
- Windows package

Production remains protected.
