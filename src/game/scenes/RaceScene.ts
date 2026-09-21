import Phaser from 'phaser'
import { HERO_BY_ID, abilityLabel, type GameLanguage } from '../domain/heroes'
import { initializeQaState, updateQaState } from '../qa'
import {
  BOT_JUMP_ZONES,
  BUMPER_CRATES,
  CHECKPOINTS,
  FINISH_X,
  LEVEL_WIDTH,
  START_X,
  MUD_ZONES,
  PIT_ZONES,
  TRAMPOLINES,
} from '../domain/levelConfig'

const text = {
  'pt-BR': {
    objective: 'Colete estrelas e chegue primeiro!',
    stars: 'Estrelas',
    position: 'Posição',
    finish: 'CHEGADA',
    win: 'Você chegou!',
    replay: 'Toque para jogar novamente',
    jump: 'PULAR',
    race: 'Corrida das Ilhas',
    ready: 'PRONTO',
    seconds: 's',
    super: 'SUPER',
    checkpoint: 'Checkpoint',
    progress: 'Progresso',
    recovered: 'De volta à corrida!',
  },
  'en-US': {
    objective: 'Collect stars and finish first!',
    stars: 'Stars',
    position: 'Position',
    finish: 'FINISH',
    win: 'You finished!',
    replay: 'Tap to play again',
    jump: 'JUMP',
    race: 'Island Race',
    ready: 'READY',
    seconds: 's',
    super: 'SUPER',
    checkpoint: 'Checkpoint',
    progress: 'Progress',
    recovered: 'Back in the race!',
  },
} as const

const leo = HERO_BY_ID.leo

export class RaceScene extends Phaser.Scene {
  private readonly language: GameLanguage
  private player!: Phaser.Physics.Arcade.Sprite
  private bots: Phaser.Physics.Arcade.Sprite[] = []
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private movementKeys!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }
  private abilityKey!: Phaser.Input.Keyboard.Key
  private stars = 0
  private finished = false
  private startTime = 0
  private abilityReadyAt = 0
  private lastObstacleHitAt = 0
  private lastTrampolineAt = 0
  private activeCheckpoint = 0
  private respawnX = START_X
  private respawnY = 520
  private starsText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private positionText!: Phaser.GameObjects.Text
  private abilityText!: Phaser.GameObjects.Text
  private checkpointText!: Phaser.GameObjects.Text
  private progressText!: Phaser.GameObjects.Text
  private progressFill!: Phaser.GameObjects.Rectangle
  private leftHeld = false
  private rightHeld = false
  private jumpQueued = false
  private abilityQueued = false
  private jumpKeyHeld = false
  private abilityKeyHeld = false
  private jumpCount = 0
  private abilityCount = 0

  constructor(language: GameLanguage) {
    super('race')
    this.language = language
  }

  create() {
    const t = text[this.language]
    this.jumpCount = 0
    this.abilityCount = 0
    initializeQaState()
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 720)
    this.physics.world.setBoundsCollision(true, true, true, false)
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 720)

    this.createTextures()
    this.createWorldArt()

    const ground = this.physics.add.staticGroup()
    for (let x = 0; x < LEVEL_WIDTH; x += 320) {
      const centerX = x + 160
      const insidePit = PIT_ZONES.some(({ from, to }) => centerX >= from && centerX <= to)
      if (!insidePit) {
        ground.create(centerX, 650, 'ground').refreshBody()
      }
    }

    ground.create(880, 515, 'platform').refreshBody()
    ground.create(1420, 465, 'platform').refreshBody()
    ground.create(1995, 505, 'platform').refreshBody()
    ground.create(2460, 515, 'platform').refreshBody()
    ground.create(2830, 430, 'platform').refreshBody()

    this.player = this.createRacer(START_X, 548, 'leo', 86, 98)
    this.player.setBounce(0.02)
    this.player.setMaxVelocity(520, 980)

    this.bots = [
      this.createRacer(START_X - 55, 552, 'bibi', 74, 92),
      this.createRacer(START_X - 110, 550, 'max', 78, 92),
      this.createRacer(START_X - 165, 550, 'foxy', 78, 92),
    ]

    this.physics.add.collider(this.player, ground)
    this.bots.forEach((bot) => this.physics.add.collider(bot, ground))

    this.createObstacles()
    this.createCheckpoints()

    const stars = this.physics.add.staticGroup()
    ;[480, 760, 1020, 1300, 1540, 1820, 2320, 2600, 2920, 3200].forEach((x, index) => {
      const y = index % 3 === 1 ? 370 : 505
      const star = stars.create(x, y, 'star') as Phaser.Physics.Arcade.Image
      star.setScale(index % 2 === 0 ? 1 : 0.9)
      star.refreshBody()
    })

    this.physics.add.overlap(this.player, stars, (_, star) => {
      const collectible = star as Phaser.Physics.Arcade.Sprite
      collectible.disableBody(true, true)
      this.stars += 1
      this.starsText.setText(`⭐ ${t.stars}: ${this.stars}`)
      updateQaState({ stars: this.stars, lastEvent: 'star-collected' })
    })

    const finish = this.physics.add.staticImage(FINISH_X, 505, 'finish')
    finish.setOrigin(0.5, 0.5)
    this.physics.add.overlap(this.player, finish, () => this.completeRace())
    this.bots.forEach((bot) => {
      this.physics.add.overlap(bot, finish, () => bot.setVelocityX(0))
    })

    this.add.text(FINISH_X - 30, 320, `🏁 ${t.finish}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '34px',
      color: '#17324d',
      backgroundColor: '#ffffffdd',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.movementKeys = this.input.keyboard!.addKeys('W,A,D') as {
      W: Phaser.Input.Keyboard.Key
      A: Phaser.Input.Keyboard.Key
      D: Phaser.Input.Keyboard.Key
    }
    this.abilityKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.bindKeyboardActions()

    this.createHud()
    if (this.sys.game.device.input.touch) this.createTouchControls()
    this.startTime = this.time.now

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -180, 35)
    updateQaState({
      sceneReady: true,
      playerX: this.player.x,
      playerY: this.player.y,
      lastEvent: 'scene-ready',
    })
  }

  update(time: number) {
    if (this.finished) return

    if (this.player.y > 735) {
      this.respawnPlayer()
      return
    }

    const { A: a, D: d, W: w } = this.movementKeys
    const space = this.cursors.space

    const left = this.cursors.left.isDown || a?.isDown || this.leftHeld
    const right = this.cursors.right.isDown || d?.isDown || this.rightHeld
    const inMud = MUD_ZONES.some(({ from, to }) => this.player.x >= from && this.player.x <= to)
    const forwardSpeed = inMud ? 255 : 385
    const reverseSpeed = inMud ? -220 : -330

    if (left && !right) {
      this.player.setVelocityX(reverseSpeed)
      this.player.setFlipX(true)
    } else if (right && !left) {
      this.player.setVelocityX(forwardSpeed)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(this.player.body!.velocity.x * (inMud ? 0.72 : 0.82))
    }

    const grounded = this.isPlayerGrounded()
    const jumpKeyDown = this.cursors.up.isDown || space.isDown || w.isDown
    if (jumpKeyDown && !this.jumpKeyHeld) {
      this.jumpQueued = true
    }
    this.jumpKeyHeld = jumpKeyDown

    if (this.jumpQueued && grounded) {
      this.performJump()
    }

    const abilityKeyDown = this.abilityKey.isDown
    if (abilityKeyDown && !this.abilityKeyHeld) {
      this.abilityQueued = true
    }
    this.abilityKeyHeld = abilityKeyDown

    if (this.abilityQueued && grounded) {
      this.useLeoAbility(time)
    }

    this.updateBots(time)
    this.updateHud(time)
    this.updateQaTelemetry()
  }

  private bindKeyboardActions() {
    const onKeyDown = (event: KeyboardEvent) => {
      if (this.finished || event.repeat) return

      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault()
        this.jumpQueued = true
        this.jumpKeyHeld = true
        updateQaState({ lastEvent: 'keyboard-jump-request' })
        return
      }

      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        event.preventDefault()
        this.abilityQueued = true
        this.abilityKeyHeld = true
        updateQaState({ lastEvent: 'keyboard-ability-request' })
      }
    }

    window.addEventListener('keydown', onKeyDown)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', onKeyDown)
    })
  }

  private isPlayerGrounded() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    return body.blocked.down || body.touching.down || body.wasTouching.down
  }

  private performJump() {
    this.player.setVelocityY(-565)
    this.jumpQueued = false
    this.jumpCount += 1
    updateQaState({ jumpCount: this.jumpCount, lastEvent: 'jump' })
  }

  private createObstacles() {
    const crates = this.physics.add.staticGroup()
    BUMPER_CRATES.forEach(({ x, y }) => {
      crates.create(x, y, 'crate').refreshBody()
    })

    this.physics.add.collider(this.player, crates, (playerObject) => {
      if (this.time.now < this.lastObstacleHitAt + 550) return
      this.lastObstacleHitAt = this.time.now

      const racer = playerObject as Phaser.Physics.Arcade.Sprite
      racer.setVelocityX(-250)
      racer.setVelocityY(-260)
      racer.setTint(0xffc46b)
      this.time.delayedCall(220, () => racer.clearTint())
      this.showRaceToast('↩️')
    })

    this.bots.forEach((bot) => this.physics.add.collider(bot, crates))

    const trampolines = this.physics.add.staticGroup()
    TRAMPOLINES.forEach(({ x, y }) => {
      trampolines.create(x, y, 'trampoline').refreshBody()
    })

    this.physics.add.overlap(this.player, trampolines, () => {
      if (this.time.now < this.lastTrampolineAt + 500) return
      this.lastTrampolineAt = this.time.now
      this.player.setVelocityY(-760)
      this.player.setVelocityX(Math.max(this.player.body!.velocity.x, 390))
      this.showRaceToast('🚀')
    })

    this.bots.forEach((bot) => {
      this.physics.add.overlap(bot, trampolines, () => {
        const body = bot.body as Phaser.Physics.Arcade.Body
        if (body.velocity.y >= 0) bot.setVelocityY(-690)
      })
    })
  }

  private createCheckpoints() {
    const checkpoints = this.physics.add.staticGroup()

    CHECKPOINTS.forEach((checkpoint, index) => {
      const gate = checkpoints.create(checkpoint.x, 510, 'checkpoint') as Phaser.Physics.Arcade.Image
      gate.setData('checkpointIndex', index + 1)
      gate.setData('respawnX', checkpoint.respawnX)
      gate.setData('respawnY', checkpoint.respawnY)
      gate.refreshBody()

      this.add.text(checkpoint.x, 400, `★ ${index + 1}`, {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#267ee6bb',
        padding: { x: 8, y: 5 },
      }).setOrigin(0.5)
    })

    this.physics.add.overlap(this.player, checkpoints, (_, checkpointObject) => {
      const checkpoint = checkpointObject as Phaser.Physics.Arcade.Image
      const index = Number(checkpoint.getData('checkpointIndex'))
      if (index <= this.activeCheckpoint) return

      this.activeCheckpoint = index
      updateQaState({ checkpoint: index, lastEvent: 'checkpoint' })
      this.respawnX = Number(checkpoint.getData('respawnX'))
      this.respawnY = Number(checkpoint.getData('respawnY'))
      checkpoint.setTint(0x63d875)
      this.checkpointText.setText(`🚩 ${text[this.language].checkpoint}: ${index}/${CHECKPOINTS.length}`)
      this.showRaceToast(`🚩 ${index}/${CHECKPOINTS.length}`)
    })
  }

  private respawnPlayer() {
    this.player.setPosition(this.respawnX, this.respawnY)
    this.player.setVelocity(0, 0)
    this.player.setAlpha(0.45)
    this.time.delayedCall(180, () => this.player.setAlpha(1))
    updateQaState({ lastEvent: 'respawn' })
    this.showRaceToast(text[this.language].recovered)
  }

  private showRaceToast(message: string) {
    const toast = this.add.text(640, 135, message, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#17324dcc',
      padding: { x: 16, y: 9 },
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(45)

    this.tweens.add({
      targets: toast,
      y: 112,
      alpha: 0,
      duration: 850,
      ease: 'Quad.Out',
      onComplete: () => toast.destroy(),
    })
  }

  private useLeoAbility(time: number) {
    if (time < this.abilityReadyAt) {
      this.abilityQueued = false
      return
    }

    this.player.setVelocityY(-790)
    this.player.setVelocityX(Math.max(this.player.body!.velocity.x, 430))
    this.abilityReadyAt = time + leo.ability.cooldownMs
    this.abilityQueued = false
    this.abilityCount += 1
    updateQaState({
      abilityReadyAt: this.abilityReadyAt,
      abilityCount: this.abilityCount,
      lastEvent: 'leo-super-jump',
    })

    this.player.setTint(0xffd43b)
    this.time.delayedCall(240, () => this.player.clearTint())

    for (let i = 0; i < 6; i += 1) {
      const spark = this.add.image(
        this.player.x + Phaser.Math.Between(-34, 34),
        this.player.y + Phaser.Math.Between(-16, 26),
        'star',
      )
        .setScale(0.24)
        .setDepth(12)

      this.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-45, 45),
        y: spark.y - Phaser.Math.Between(45, 90),
        alpha: 0,
        scale: 0.05,
        duration: 500,
        ease: 'Quad.Out',
        onComplete: () => spark.destroy(),
      })
    }
  }

  private updateHud(time: number) {
    const elapsed = Math.max(0, time - this.startTime)
    const seconds = Math.floor(elapsed / 1000)
    this.timerText.setText(`⏱ ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`)

    const place = 1 + this.bots.filter((bot) => bot.x > this.player.x).length
    this.positionText.setText(`🏆 ${text[this.language].position}: ${place}/4`)

    const progress = Phaser.Math.Clamp((this.player.x - START_X) / (FINISH_X - START_X), 0, 1)
    this.progressFill.setScale(progress, 1)
    this.progressText.setText(`${text[this.language].progress}: ${Math.round(progress * 100)}%`)

    const remaining = Math.max(0, this.abilityReadyAt - time)
    const ability = abilityLabel(leo, this.language)
    const state = remaining <= 0
      ? text[this.language].ready
      : `${(remaining / 1000).toFixed(1)}${text[this.language].seconds}`

    this.abilityText.setText(`👑 ${ability}: ${state}`)
    this.abilityText.setColor(remaining <= 0 ? '#158f38' : '#c16a13')
  }

  private updateQaTelemetry() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const place = 1 + this.bots.filter((bot) => bot.x > this.player.x).length
    updateQaState({
      playerX: this.player.x,
      playerY: this.player.y,
      velocityX: body.velocity.x,
      velocityY: body.velocity.y,
      grounded: this.isPlayerGrounded(),
      stars: this.stars,
      checkpoint: this.activeCheckpoint,
      position: place,
      progress: Phaser.Math.Clamp((this.player.x - START_X) / (FINISH_X - START_X), 0, 1),
      abilityReadyAt: this.abilityReadyAt,
      finished: this.finished,
      spaceDown: this.cursors.space.isDown,
      shiftDown: this.abilityKey.isDown,
      jumpCount: this.jumpCount,
      abilityCount: this.abilityCount,
    })
  }

  private createRacer(x: number, y: number, texture: string, width: number, height: number) {
    const racer = this.physics.add.sprite(x, y, texture)
    racer.setDisplaySize(width, height)
    racer.setCollideWorldBounds(true)
    racer.setDepth(10)
    const body = racer.body as Phaser.Physics.Arcade.Body
    body.setSize(width * 0.55, height * 0.78, true)
    return racer
  }

  private updateBots(time: number) {
    this.bots.forEach((bot, index) => {
      if (bot.y > 735) {
        bot.setPosition(Math.max(80, bot.x - 260), 500)
        bot.setVelocity(0, 0)
      }

      const body = bot.body as Phaser.Physics.Arcade.Body
      const speed = 285 + index * 13 + Math.sin(time / 700 + index) * 12
      bot.setVelocityX(speed)

      const needsJump = BOT_JUMP_ZONES.some(([from, to]) => bot.x > from && bot.x < to)
      if (body.blocked.down && needsJump) {
        const jumpStrength = 520 + index * 14
        bot.setVelocityY(-jumpStrength)
      }
    })
  }

  private createWorldArt() {
    // Layered fantasy world. Gameplay geometry remains separate so the
    // visual pass can evolve without changing physics or QA coordinates.
    this.add.rectangle(1800, 360, LEVEL_WIDTH, 720, 0x66c7ff).setDepth(-30)
    this.add.rectangle(1800, 545, LEVEL_WIDTH, 350, 0xa8e8ff, 0.28).setDepth(-29)

    const sun = this.add.circle(420, 115, 62, 0xffef8b, 0.95).setDepth(-28)
    sun.setStrokeStyle(14, 0xffffff, 0.16)

    for (let i = 0; i < 18; i += 1) {
      const x = 100 + i * 220
      const y = 82 + (i % 5) * 43
      const scale = 0.72 + (i % 3) * 0.16
      this.add.ellipse(x, y, 168 * scale, 54 * scale, 0xffffff, 0.38).setDepth(-27)
      this.add.ellipse(x + 48, y - 4, 104 * scale, 47 * scale, 0xffffff, 0.32).setDepth(-27)
    }

    // Distant mountain / island silhouettes create parallax-like depth.
    const distant = this.add.graphics().setDepth(-25)
    distant.fillStyle(0x62b96c, 0.45)
    distant.fillTriangle(0, 500, 450, 220, 920, 500)
    distant.fillTriangle(680, 500, 1220, 250, 1730, 500)
    distant.fillTriangle(1450, 500, 2140, 210, 2800, 500)
    distant.fillTriangle(2480, 500, 3120, 245, 3600, 500)

    const islandPositions = [
      [620, 285, 190, 78],
      [1180, 235, 250, 92],
      [1750, 310, 205, 78],
      [2320, 238, 270, 96],
      [3080, 280, 245, 88],
    ] as const

    islandPositions.forEach(([x, y, width, height], index) => {
      // shadow under island
      this.add.ellipse(x + 8, y + 18, width * 1.04, height * 0.82, 0x31556a, 0.18).setDepth(-23)
      this.add.ellipse(x, y, width, height, 0x7f5637).setDepth(-22)
      this.add.triangle(
        x,
        y + height * 0.35,
        -width * 0.35,
        0,
        width * 0.35,
        0,
        0,
        height * 1.15,
        0x6a472f,
      ).setDepth(-22)
      this.add.ellipse(x, y - 18, width * 0.94, height * 0.58, 0x66cf63).setDepth(-21)
      this.add.ellipse(x, y - 28, width * 0.68, height * 0.22, 0xa3ef7f, 0.7).setDepth(-20)

      if (index !== 2) {
        const fallHeight = index % 2 === 0 ? 112 : 82
        this.add.rectangle(x + width * 0.2, y + 64, 14, fallHeight, 0xb8f4ff, 0.74).setDepth(-23)
        this.add.rectangle(x + width * 0.2 + 6, y + 64, 5, fallHeight, 0xffffff, 0.44).setDepth(-22)
        this.add.ellipse(x + width * 0.2, y + 64 + fallHeight / 2, 36, 12, 0xd7f9ff, 0.32).setDepth(-21)
      }

      // shrubs and tiny trees
      const treeX = x - width * 0.22
      this.add.rectangle(treeX, y - 54, 9, 31, 0x765032).setDepth(-19)
      this.add.circle(treeX, y - 75, 21, index % 2 === 0 ? 0x4fb65b : 0x5ec767).setDepth(-18)
      this.add.circle(treeX - 13, y - 68, 15, 0x6bd06c).setDepth(-18)
    })

    // Castle landmark.
    this.add.rectangle(3090, 165, 126, 102, 0xf7f1df).setDepth(-18)
    this.add.rectangle(3025, 181, 54, 78, 0xf1e8d5).setDepth(-18)
    this.add.rectangle(3155, 181, 54, 78, 0xf1e8d5).setDepth(-18)
    this.add.triangle(3025, 115, -36, 45, 0, 0, 36, 45, 0x6b72da).setDepth(-17)
    this.add.triangle(3090, 103, -48, 52, 0, 0, 48, 52, 0x4f76d8).setDepth(-17)
    this.add.triangle(3155, 115, -36, 45, 0, 0, 36, 45, 0x6b72da).setDepth(-17)
    this.add.rectangle(3090, 216, 272, 24, 0x72d66c).setDepth(-19)
    for (const windowX of [3058, 3090, 3122]) {
      this.add.rectangle(windowX, 165, 18, 28, 0x79c8ff)
        .setDepth(-16)
        .setStrokeStyle(3, 0xffffff, 0.72)
    }

    // Decorative balloons / dirigible silhouettes.
    this.add.ellipse(960, 138, 92, 54, 0xff8b71, 0.92).setDepth(-16)
    this.add.rectangle(960, 177, 44, 14, 0x7b5139).setDepth(-16)
    this.add.line(0, 0, 938, 157, 948, 177, 0x6a4a3a, 0.6).setDepth(-17)
    this.add.line(0, 0, 982, 157, 972, 177, 0x6a4a3a, 0.6).setDepth(-17)

    this.add.ellipse(2760, 112, 74, 44, 0x8b78ea, 0.82).setDepth(-16)
    this.add.rectangle(2760, 143, 35, 11, 0x7b5139).setDepth(-16)

    // Rainbow landmark.
    const rainbow = this.add.graphics().setDepth(-18)
    const rainbowBands = [
      [0xff6f78, 16, 270],
      [0xffc84f, 14, 250],
      [0x62d56c, 14, 231],
      [0x4b8de9, 14, 212],
      [0xa276e8, 13, 194],
    ] as const
    rainbowBands.forEach(([color, thickness, radius]) => {
      rainbow.lineStyle(thickness, color, 0.82)
      rainbow.beginPath()
      rainbow.arc(2550, 435, radius, Math.PI, Math.PI * 2)
      rainbow.strokePath()
    })

    PIT_ZONES.forEach(({ from, to }) => {
      this.add.ellipse((from + to) / 2, 665, to - from, 54, 0x4f8dad, 0.54).setDepth(-12)
      this.add.ellipse((from + to) / 2, 655, (to - from) * 0.84, 24, 0x9de9ff, 0.32).setDepth(-11)
    })

    MUD_ZONES.forEach(({ from, to }) => {
      this.add.ellipse((from + to) / 2, 612, to - from, 31, 0x875a3a, 0.88).setDepth(1)
      this.add.ellipse((from + to) / 2, 607, (to - from) * 0.68, 10, 0xc08b58, 0.5).setDepth(2)
    })

    // Foreground vegetation placed outside the racing path.
    for (const x of [260, 820, 1380, 1690, 2970, 3330]) {
      this.add.circle(x - 18, 602, 24, 0x4cb65c).setDepth(0)
      this.add.circle(x + 8, 600, 30, 0x58c767).setDepth(0)
      this.add.circle(x + 32, 606, 19, 0x72d46c).setDepth(0)
    }

    this.add.text(425, 252, '⭐  KIDDY CLASH  ⭐', {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#1d65a8',
      strokeThickness: 5,
      backgroundColor: '#2b83dfbb',
      padding: { x: 18, y: 11 },
    }).setOrigin(0.5).setDepth(-9)
  }

  private createHud() {
    const t = text[this.language]

    this.add.rectangle(640, 49, 1240, 78, 0xffffff, 0.86)
      .setScrollFactor(0)
      .setDepth(20)
      .setStrokeStyle(3, 0xcde9f7)

    this.add.text(165, 17, `🏝️ ${t.race}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '19px',
      color: '#267ee6',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(21)

    this.abilityText = this.add.text(
      165,
      45,
      `👑 ${abilityLabel(leo, this.language)}: ${t.ready}`,
      {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: '14px',
        color: '#158f38',
        fontStyle: 'bold',
      },
    ).setScrollFactor(0).setDepth(21)

    this.add.text(635, 17, t.objective, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '20px',
      color: '#17324d',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(21)

    const progressTrack = this.add.rectangle(430, 54, 405, 13, 0xc8dce8)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(21)

    this.progressFill = this.add.rectangle(430, 54, 405, 13, 0x48c75b)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(22)
      .setScale(0, 1)

    progressTrack.setStrokeStyle(2, 0x8eb4ca)

    CHECKPOINTS.forEach((checkpoint) => {
      const markerX = 430 + ((checkpoint.x - START_X) / (FINISH_X - START_X)) * 405
      this.add.circle(markerX, 54, 5, 0x267ee6)
        .setScrollFactor(0)
        .setDepth(23)
    })

    this.progressText = this.add.text(640, 66, `${t.progress}: 0%`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '11px',
      color: '#4b6d82',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(23)

    this.checkpointText = this.add.text(850, 18, `🚩 ${t.checkpoint}: 0/${CHECKPOINTS.length}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '14px',
      color: '#267ee6',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(21)

    this.starsText = this.add.text(1010, 17, `⭐ ${t.stars}: 0`, this.hudStyle()).setScrollFactor(0).setDepth(21)
    this.timerText = this.add.text(1010, 48, '⏱ 00:00', this.hudStyle()).setScrollFactor(0).setDepth(21)
    this.positionText = this.add.text(1105, 48, `🏆 ${t.position}: 1/4`, this.hudStyle()).setScrollFactor(0).setDepth(21)
  }

  private completeRace() {
    if (this.finished) return
    this.finished = true
    updateQaState({ finished: true, lastEvent: 'finish' })
    this.player.setVelocity(0, 0)
    this.bots.forEach((bot) => bot.setVelocityX(0))

    const t = text[this.language]
    const place = 1 + this.bots.filter((bot) => bot.x > this.player.x).length

    const panel = this.add.rectangle(640, 360, 690, 300, 0xffffff, 0.96)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(7, 0x2688e8)

    const hero = this.add.image(415, 360, 'leo')
      .setDisplaySize(128, 148)
      .setScrollFactor(0)
      .setDepth(51)

    const title = this.add.text(710, 275, t.win, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '46px',
      color: '#ff8b22',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const placement = this.add.text(710, 335, `🏆 ${place}/4`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '32px',
      color: '#267ee6',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const result = this.add.text(
      710,
      390,
      `⭐ ${this.stars}   •   🚩 ${this.activeCheckpoint}/${CHECKPOINTS.length}   •   XP +${50 + this.stars * 5}`,
      {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: '22px',
        color: '#17324d',
      },
    ).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const replay = this.add.text(710, 452, `▶ ${t.replay}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '21px',
      color: '#2688e8',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const restart = () => this.scene.restart()
    ;[panel, hero, title, placement, result, replay].forEach((item) => {
      item.setInteractive({ useHandCursor: true }).once('pointerdown', restart)
    })
  }

  private createTouchControls() {
    const t = text[this.language]
    const left = this.add.circle(78, 625, 46, 0xffffff, 0.42).setScrollFactor(0).setDepth(30).setInteractive()
    const right = this.add.circle(185, 625, 46, 0xffffff, 0.42).setScrollFactor(0).setDepth(30).setInteractive()
    const ability = this.add.circle(980, 610, 61, 0xff9c2f, 0.94).setScrollFactor(0).setDepth(30).setInteractive()
    const jump = this.add.circle(1140, 610, 70, 0x2688e8, 0.9).setScrollFactor(0).setDepth(30).setInteractive()

    left.setStrokeStyle(4, 0x267ee6, 0.62)
    right.setStrokeStyle(4, 0x267ee6, 0.62)
    ability.setStrokeStyle(5, 0xffffff, 0.7)
    jump.setStrokeStyle(5, 0xffffff, 0.7)

    this.add.text(78, 625, '◀', { fontSize: '32px', color: '#17324d' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
    this.add.text(185, 625, '▶', { fontSize: '32px', color: '#17324d' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
    this.add.text(980, 610, `👑\n${t.super}`, {
      align: 'center',
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
    this.add.text(1140, 610, `↑\n${t.jump}`, {
      align: 'center',
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31)

    left.on('pointerdown', () => { this.leftHeld = true })
    left.on('pointerup', () => { this.leftHeld = false })
    left.on('pointerout', () => { this.leftHeld = false })

    right.on('pointerdown', () => { this.rightHeld = true })
    right.on('pointerup', () => { this.rightHeld = false })
    right.on('pointerout', () => { this.rightHeld = false })

    ability.on('pointerdown', () => { this.abilityQueued = true })
    jump.on('pointerdown', () => { this.jumpQueued = true })
  }

  private createTextures() {
    const graphics = this.add.graphics()

    // Gameplay sprites are generated by Phaser itself for deterministic
    // rendering across browser, Capacitor and Electron. The richer SVG
    // character art remains the canonical menu/presentation artwork.
    graphics.fillStyle(0x8a4a20)
    graphics.fillCircle(48, 34, 31)
    graphics.fillStyle(0xf3a340)
    graphics.fillCircle(48, 36, 24)
    graphics.fillCircle(28, 17, 9)
    graphics.fillCircle(68, 17, 9)
    graphics.fillStyle(0x17324d)
    graphics.fillCircle(39, 33, 4)
    graphics.fillCircle(57, 33, 4)
    graphics.fillStyle(0xffd9a3)
    graphics.fillEllipse(48, 47, 21, 15)
    graphics.fillStyle(0xe84a3a)
    graphics.fillRoundedRect(27, 62, 42, 34, 11)
    graphics.fillStyle(0xffd43b)
    graphics.fillTriangle(48, 69, 42, 82, 54, 82)
    graphics.fillStyle(0x2d83dd)
    graphics.fillRoundedRect(31, 93, 13, 16, 5)
    graphics.fillRoundedRect(52, 93, 13, 16, 5)
    graphics.generateTexture('leo', 96, 112)
    graphics.clear()

    graphics.fillStyle(0xffffff)
    graphics.fillRoundedRect(27, 0, 14, 42, 7)
    graphics.fillRoundedRect(55, 0, 14, 42, 7)
    graphics.fillCircle(48, 40, 26)
    graphics.fillStyle(0xf0518e)
    graphics.fillRoundedRect(27, 65, 42, 32, 11)
    graphics.fillStyle(0x17324d)
    graphics.fillCircle(39, 38, 4)
    graphics.fillCircle(57, 38, 4)
    graphics.fillStyle(0xf28aa8)
    graphics.fillEllipse(48, 49, 9, 6)
    graphics.fillStyle(0xffffff)
    graphics.fillRoundedRect(31, 94, 12, 15, 5)
    graphics.fillRoundedRect(53, 94, 12, 15, 5)
    graphics.generateTexture('bibi', 96, 112)
    graphics.clear()

    graphics.fillStyle(0x9d6039)
    graphics.fillEllipse(23, 37, 24, 40)
    graphics.fillEllipse(73, 37, 24, 40)
    graphics.fillStyle(0xf6e8d8)
    graphics.fillCircle(48, 40, 27)
    graphics.fillStyle(0xcaa168)
    graphics.fillRoundedRect(22, 10, 52, 15, 7)
    graphics.fillRect(31, 2, 34, 13)
    graphics.fillStyle(0x17324d)
    graphics.fillCircle(39, 39, 4)
    graphics.fillCircle(57, 39, 4)
    graphics.fillStyle(0x2b211b)
    graphics.fillEllipse(48, 51, 10, 7)
    graphics.fillStyle(0xc79558)
    graphics.fillRoundedRect(27, 66, 42, 31, 11)
    graphics.fillStyle(0xd94a32)
    graphics.fillRect(28, 67, 40, 7)
    graphics.fillStyle(0xf6e8d8)
    graphics.fillRoundedRect(31, 94, 12, 15, 5)
    graphics.fillRoundedRect(53, 94, 12, 15, 5)
    graphics.generateTexture('max', 96, 112)
    graphics.clear()

    graphics.fillStyle(0xf2792f)
    graphics.fillTriangle(20, 29, 30, 2, 42, 31)
    graphics.fillTriangle(54, 31, 66, 2, 76, 29)
    graphics.fillCircle(48, 40, 27)
    graphics.fillStyle(0xffffff)
    graphics.fillEllipse(48, 51, 30, 22)
    graphics.fillStyle(0x17324d)
    graphics.fillCircle(39, 38, 4)
    graphics.fillCircle(57, 38, 4)
    graphics.fillStyle(0x492718)
    graphics.fillCircle(48, 49, 4)
    graphics.fillStyle(0x327fd1)
    graphics.fillRoundedRect(27, 66, 42, 31, 11)
    graphics.fillStyle(0x7b512e)
    graphics.fillRoundedRect(31, 94, 12, 15, 5)
    graphics.fillRoundedRect(53, 94, 12, 15, 5)
    graphics.generateTexture('foxy', 96, 112)
    graphics.clear()

    graphics.fillStyle(0x69c759)
    graphics.fillCircle(48, 39, 27)
    graphics.fillRoundedRect(27, 65, 42, 34, 12)
    graphics.fillStyle(0xef7735)
    graphics.fillTriangle(31, 18, 37, 2, 43, 19)
    graphics.fillTriangle(46, 13, 52, 0, 58, 16)
    graphics.fillStyle(0x17324d)
    graphics.fillCircle(39, 38, 4)
    graphics.fillCircle(57, 38, 4)
    graphics.fillStyle(0xbce998)
    graphics.fillEllipse(48, 52, 25, 17)
    graphics.generateTexture('dino', 96, 112)
    graphics.clear()

    graphics.fillStyle(0x58bd55)
    graphics.fillRoundedRect(0, 0, 320, 70, 18)
    graphics.fillStyle(0x8b5d34)
    graphics.fillRoundedRect(0, 30, 320, 40, 14)
    graphics.fillStyle(0xa77848)
    for (let x = 25; x < 300; x += 55) graphics.fillCircle(x, 51, 6)
    graphics.generateTexture('ground', 320, 70)
    graphics.clear()

    graphics.fillStyle(0x63c85d)
    graphics.fillRoundedRect(0, 0, 230, 42, 16)
    graphics.fillStyle(0x8b5d34)
    graphics.fillRoundedRect(0, 22, 230, 36, 12)
    graphics.generateTexture('platform', 230, 58)
    graphics.clear()

    graphics.fillStyle(0xd6944f)
    graphics.fillRoundedRect(0, 0, 62, 62, 8)
    graphics.lineStyle(5, 0x8b5a2b)
    graphics.strokeRoundedRect(0, 0, 62, 62, 8)
    graphics.beginPath()
    graphics.moveTo(10, 10)
    graphics.lineTo(52, 52)
    graphics.moveTo(52, 10)
    graphics.lineTo(10, 52)
    graphics.strokePath()
    graphics.generateTexture('crate', 62, 62)
    graphics.clear()

    graphics.fillStyle(0x2d83dd)
    graphics.fillRoundedRect(0, 0, 92, 22, 10)
    graphics.fillStyle(0xffd43b)
    graphics.fillTriangle(34, 17, 46, 3, 58, 17)
    graphics.generateTexture('trampoline', 92, 22)
    graphics.clear()

    graphics.fillStyle(0x267ee6, 0.7)
    graphics.fillRoundedRect(0, 0, 20, 150, 8)
    graphics.fillStyle(0xffffff, 0.85)
    graphics.fillCircle(10, 24, 8)
    graphics.generateTexture('checkpoint', 20, 150)
    graphics.clear()

    graphics.fillStyle(0xffd43b)
    const starPoints: Phaser.Math.Vector2[] = []
    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5
      const radius = i % 2 === 0 ? 23 : 11
      starPoints.push(new Phaser.Math.Vector2(
        24 + Math.cos(angle) * radius,
        24 + Math.sin(angle) * radius,
      ))
    }
    graphics.fillPoints(starPoints, true)
    graphics.lineStyle(3, 0xf0a400)
    graphics.strokePoints(starPoints, true)
    graphics.generateTexture('star', 48, 48)
    graphics.clear()

    graphics.fillStyle(0xffffff)
    graphics.fillRect(0, 0, 18, 180)
    graphics.fillStyle(0x17324d)
    graphics.fillRect(18, 0, 18, 180)
    for (let y = 0; y < 180; y += 36) {
      graphics.fillStyle((y / 36) % 2 === 0 ? 0xffffff : 0x17324d)
      graphics.fillRect(0, y, 18, 18)
      graphics.fillStyle((y / 36) % 2 === 0 ? 0x17324d : 0xffffff)
      graphics.fillRect(18, y, 18, 18)
    }
    graphics.generateTexture('finish', 36, 180)
    graphics.destroy()
  }

  private hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '16px',
      color: '#17324d',
      fontStyle: 'bold',
    }
  }
}
