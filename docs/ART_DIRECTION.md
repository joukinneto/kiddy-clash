# Kiddy Clash — Official Art Direction

Workflow: `KIDDY-ART-001 — Premium Visual Direction & Vertical Slice`

Owner: `KC-ART-DIRECTOR`

Status: Development/Test visual target.

Production remains protected.

## 1. Quality target

The approved concept references establish the visual quality bar for Kiddy Clash:

- bright premium family-friendly 3D-cartoon-inspired rendering
- original expressive animal/robot heroes
- large readable silhouettes
- oversized eyes and friendly facial expressions
- saturated but controlled color
- soft daylight with warm rim/highlight
- floating fantasy islands, waterfalls, castles, rope bridges, air balloons and clouds
- glossy tactile UI with large rounded buttons
- clear foreground / midground / background depth
- celebratory stars, trails, dust and spark effects
- premium key-art energy without sacrificing gameplay readability

The current runtime is a functional prototype. It is **not** the final visual benchmark.

## 2. Runtime strategy

Kiddy Clash does not need full realtime 3D to match the approved identity.

The preferred first production path is **premium 2D/2.5D**:

1. high-quality character artwork is converted into gameplay-ready sprite/atlas assets;
2. layered environment art creates parallax depth;
3. lighting, shadows, particles, glows and scale cues create a 3D-like presentation;
4. Phaser remains responsible for gameplay/physics;
5. React remains responsible for shell/menu/profile interfaces.

True realtime 3D is not required for KIDDY-ART-001 and must not be introduced without an explicit architecture decision.

## 3. Character style

### General proportions

- head should read as approximately 35–45% of the visible character height
- hands/paws and shoes may be intentionally oversized
- limbs are short, rounded and readable
- silhouettes must remain identifiable at small mobile sizes
- faces use large eyes, clean brows and clear mouth shapes
- no realistic violence, frightening anatomy or aggressive weapons

### Canonical identity

The following base identities cannot drift:

- **Leo** — golden lion, large brown mane, red/blue hero outfit, crown motif, Super Jump
- **Pandy** — panda, green protective outfit, blue paw shield, Shield
- **Bibi** — white bunny, pink athletic identity, Turbo Run
- **Foxy** — orange fox, goggles/blue adventure identity, Quick Dash
- **Max** — brown/white puppy explorer, hat/backpack/compass, Treasure Finder
- **Mimi** — white kitten, pink bow/outfit, blue eyes, Double Jump
- **Dino** — green baby dinosaur, orange spikes/backpack, Power Boost
- **B-01** — white/blue friendly robot, digital face, magnet hands, Star Magnet

Alternative cosmetics can change clothing/effects but cannot erase the base silhouette or species identity.

## 4. Vertical-slice hero target

KIDDY-ART-001 prioritizes production-target gameplay representation for:

1. Leo
2. Bibi
3. Foxy
4. Max

The remaining heroes stay visually governed and are expanded after the first vertical slice passes.

## 5. Character motion language

Every production hero must support these canonical states:

- idle
- run
- jump
- fall
- ability
- finish
- win/celebration

Leo additionally requires a visually distinct **Super Jump** with:

- anticipation/squash
- strong launch pose
- upward trail/glow
- apex readability
- landing squash/dust

Movement should feel springy and joyful, never rigid.

## 6. Environment language

The first premium race uses **Mundo Arco-Íris / Rainbow World**.

Required environment motifs:

- floating grassy islands
- waterfalls dropping into clouds
- fantasy castle destination
- rope/wood bridges
- balloons or airships
- rainbows
- rounded trees and bushes
- wooden directional signs
- colorful flowers
- soft clouds and distant floating silhouettes

### Depth stack

The runtime scene should be divided into at least:

- far sky/cloud layer
- far floating-island silhouettes
- midground castle/islands/waterfalls
- gameplay route
- foreground foliage/props
- VFX/UI overlay

Parallax strength must preserve gameplay targeting and never obscure the route.

## 7. Gameplay readability

Premium art must not reduce playability.

Rules:

- traversable surfaces use a consistent green/earth language
- hazards/obstacles must be readable before collision
- stars use warm yellow/gold with strong glow contrast
- checkpoints use blue/cyan signal language
- finish uses black/white flag language plus celebration VFX
- interactive elements must remain readable on mobile landscape
- competitors must remain distinguishable even when overlapping

## 8. UI visual language

The target UI is tactile, colorful and toy-like.

### Shapes

- large rounded rectangles
- thick outlines
- subtle bevel/highlight
- soft drop shadows
- generous touch targets
- pill/badge treatments for compact status information

### Color roles

- green: primary Play / positive action
- red/coral: VS Computer / energetic challenge
- blue: Online / information
- purple: Friend / social
- yellow/orange: Characters / rewards
- cool gray/blue: Settings
- gold/yellow: stars, XP milestones and celebration

### Localization

Do **not** bake normal UI labels into raster art.

PT-BR and EN-US text must remain live/localizable except in explicitly approved non-interactive decorative key art.

## 9. HUD requirements

The premium race HUD must preserve:

- objective/progress
- race progress
- timer
- stars
- current position
- pause
- hero ability/cooldown
- checkpoint state when useful
- mobile movement/jump/ability controls

The HUD should occupy the edges of the frame and preserve the center for gameplay.

## 10. VFX language

Required vertical-slice effects:

- star pickup sparkle/burst
- Super Jump launch trail
- landing dust/puff
- checkpoint activation
- trampoline launch
- finish celebration
- subtle UI press/transition feedback

VFX are additive feedback, not visual clutter.

## 11. Audio direction

The audio target is playful, bright and readable:

- cheerful adventure music
- tactile button clicks
- bright star chime
- spring/trampoline effect
- Leo Super Jump cue
- checkpoint confirmation
- finish fanfare
- short optional PT/EN character voice snippets

No loud, frightening or violent sound design.

## 12. Key art vs runtime art

Approved promotional/concept images can be richer than gameplay.

The runtime must reproduce their **identity, palette, character appeal and atmosphere**, not necessarily every lighting/rendering detail.

This distinction is mandatory:

- **Key art:** maximum polish for marketing, menus and character presentation.
- **Runtime art:** optimized, animated, readable and performant representation of the same identity.

## 13. Technical art principles

- prefer sprite atlases for gameplay animation
- avoid hundreds of independent draw-call-heavy files
- use WebP/PNG according to alpha/quality needs
- use SVG primarily for shell/UI/vector-friendly artwork, not as the default animated gameplay format
- provide 1x and 2x tiers where useful
- cap individual gameplay atlas dimensions according to device testing
- preload only race-critical assets
- lazy-load menus/character galleries when possible
- maintain fallback assets for Development/Test

## 14. Performance target

Initial target:

- 60 FPS where feasible
- 30 FPS minimum fallback
- no visual effect may make the race unplayable on mid-range devices
- quality tiers may reduce particles, parallax layers, shadow complexity and texture resolution

Performance wins over decorative excess.

## 15. Do / Do not

### Do

- make characters expressive
- keep original identities recognizable
- use layered depth
- emphasize readable routes
- use soft, premium lighting
- build tactile child-friendly controls
- capture visual regression evidence

### Do not

- copy characters/maps from existing game franchises
- use inconsistent character proportions from screen to screen
- bake required localized UI text into image assets
- ship concept-only images as gameplay sprites without optimization
- add effects that obscure obstacles or player position
- sacrifice performance to chase screenshot-only quality

## 16. Vertical-slice acceptance

The Art Director may mark KIDDY-ART-001 visually accepted only when:

- menu, first race and result screen belong to the same visual system
- Leo/Bibi/Foxy/Max are recognizable and consistent
- environment depth is materially above prototype quality
- animation/VFX make movement feel alive
- PT/EN HUD remains readable
- desktop/mobile screenshots pass visual QA
- Web/PWA, Android, iOS and Windows validation stays green
