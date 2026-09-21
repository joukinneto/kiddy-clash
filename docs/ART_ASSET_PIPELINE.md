# Kiddy Clash — Art Asset Pipeline

Workflow: `KIDDY-ART-001`

Owners: `KC-TECH-ART`, `KC-PERFORMANCE`, `KC-QA`

## Asset classes

### Presentation art

Used by:
- main menu
- character gallery
- promotional panels
- loading/splash screens

Allowed formats:
- WebP
- PNG
- SVG when vector behavior is genuinely useful

### Gameplay characters

Preferred:
- texture atlases
- sprite sheets
- optimized transparent PNG/WebP frames

A hero atlas should group related animation states whenever practical.

### Environment

Preferred:
- tileable/section-based art
- layered WebP/PNG
- separate parallax layers
- dedicated collision geometry independent from artwork

### UI

Preferred:
- CSS/React for basic layout and live text
- SVG/PNG/WebP for decorative frames/icons
- no rasterized mandatory PT/EN labels

### VFX

Preferred:
- small atlases
- procedural Phaser particles
- reusable glow/flare textures

## Directory contract

```
public/assets/
  art/
    characters/
      leo/
      bibi/
      foxy/
      max/
      ...
    environments/
      rainbow-world/
        far/
        mid/
        gameplay/
        foreground/
    ui/
      frames/
      icons/
      badges/
    vfx/
    audio/
```

## Naming

Use lowercase kebab-case.

Examples:

- `leo-run-atlas.webp`
- `leo-super-jump-atlas.webp`
- `rainbow-world-far-islands.webp`
- `vfx-star-pickup.webp`

## Resolution tiers

Each asset manifest entry declares:

- logical purpose
- source type
- runtime type
- 1x dimensions
- optional 2x dimensions
- alpha requirement
- preload/lazy strategy
- owner agent

## Gameplay/runtime rule

Collision and gameplay logic must not depend on decorative pixels.

Changing artwork must not move the physical checkpoint, platform, pit or finish line unless the Level Designer explicitly changes gameplay geometry.

## Budget rule

No asset is accepted only because it looks good.

It must also pass:

- file-size review
- memory review
- runtime rendering review
- mobile readability review
- visual regression
- copyright/originality review
