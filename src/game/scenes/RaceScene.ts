import Phaser from 'phaser'
import { HERO_BY_ID, abilityLabel, type GameLanguage } from '../domain/heroes'

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
  },
} as const

const leo = HERO_BY_ID.leo

export class RaceScene extends Phaser.Scene {
  private readonly language: GameLanguage
  private player!: Phaser.Physics.Arcade.Sprite
  private bots: Phaser.Physics.Arcade.Sprite[] = []
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private abilityKey!: Phaser.Input.Keyboard.Key
  private stars = 0
  private finished = false
  private startTime = 0
  private abilityReadyAt = 0
  private starsText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private positionText!: Phaser.GameObjects.Text
  private abilityText!: Phaser.GameObjects.Text
  private leftHeld = false
  private rightHeld = false
  private jumpQueued = false
  private abilityQueued = false

  constructor(language: GameLanguage) {
    super('race')
    this.language = language
  }

  preload() {
    this.load.svg('leo', 'assets/characters/leo.svg')
    this.load.svg('bibi', 'assets/characters/bibi.svg')
    this.load.svg('max', 'assets/characters/max.svg')
    this.load.svg('foxy', 'assets/characters/foxy.svg')
    this.load.svg('dino', 'assets/characters/dino.svg')
  }

  create() {
    const t = text[this.language]
    this.physics.world.setBounds(0, 0, 3600, 720)
    this.cameras.main.setBounds(0, 0, 3600, 720)

    this.createTextures()
    this.createWorldArt()

    const ground = this.physics.add.staticGroup()
    for (let x = 0; x < 3600; x += 320) {
      const y = x > 1850 && x < 2200 ? 610 : 650
      ground.create(x + 160, y, 'ground').refreshBody()
    }

    ground.create(880, 515, 'platform').refreshBody()
    ground.create(1420, 465, 'platform').refreshBody()
    ground.create(2460, 515, 'platform').refreshBody()
    ground.create(2820, 430, 'platform').refreshBody()

    this.player = this.createRacer(180, 548, 'leo', 86, 98)
    this.player.setBounce(0.02)
    this.player.setMaxVelocity(520, 980)

    this.bots = [
      this.createRacer(118, 552, 'bibi', 74, 92),
      this.createRacer(82, 550, 'max', 78, 92),
      this.createRacer(48, 550, 'foxy', 78, 92),
    ]

    this.physics.add.collider(this.player, ground)
    this.bots.forEach((bot) => this.physics.add.collider(bot, ground))

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
    })

    const finish = this.physics.add.staticImage(3420, 505, 'finish')
    finish.setOrigin(0.5, 0.5)
    this.physics.add.overlap(this.player, finish, () => this.completeRace())
    this.bots.forEach((bot) => {
      this.physics.add.overlap(bot, finish, () => bot.setVelocityX(0))
    })

    this.add.text(3390, 320, `🏁 ${t.finish}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '34px',
      color: '#17324d',
      backgroundColor: '#ffffffdd',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.input.keyboard!.addKeys('W,A,D,SPACE')
    this.abilityKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)

    this.createHud()
    this.createTouchControls()
    this.startTime = this.time.now

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -180, 35)
  }

  update(time: number) {
    if (this.finished) return

    const keys = this.input.keyboard!.keys
    const a = keys[Phaser.Input.Keyboard.KeyCodes.A]
    const d = keys[Phaser.Input.Keyboard.KeyCodes.D]
    const w = keys[Phaser.Input.Keyboard.KeyCodes.W]
    const space = keys[Phaser.Input.Keyboard.KeyCodes.SPACE]

    const left = this.cursors.left.isDown || a?.isDown || this.leftHeld
    const right = this.cursors.right.isDown || d?.isDown || this.rightHeld

    if (left && !right) {
      this.player.setVelocityX(-330)
      this.player.setFlipX(true)
    } else if (right && !left) {
      this.player.setVelocityX(385)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(this.player.body!.velocity.x * 0.82)
    }

    const grounded = (this.player.body as Phaser.Physics.Arcade.Body).blocked.down
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(space) ||
      Phaser.Input.Keyboard.JustDown(w)

    if ((jumpPressed || this.jumpQueued) && grounded) {
      this.player.setVelocityY(-565)
      this.jumpQueued = false
    }

    const abilityPressed = Phaser.Input.Keyboard.JustDown(this.abilityKey)
    if ((abilityPressed || this.abilityQueued) && grounded) {
      this.useLeoAbility(time)
    }

    this.updateBots(time)
    this.updateHud(time)
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

    const remaining = Math.max(0, this.abilityReadyAt - time)
    const ability = abilityLabel(leo, this.language)
    const state = remaining <= 0
      ? text[this.language].ready
      : `${(remaining / 1000).toFixed(1)}${text[this.language].seconds}`

    this.abilityText.setText(`👑 ${ability}: ${state}`)
    this.abilityText.setColor(remaining <= 0 ? '#158f38' : '#c16a13')
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
    const jumpZones = [
      [760, 910],
      [1360, 1495],
      [1840, 2000],
      [2370, 2520],
      [2750, 2860],
    ] as const

    this.bots.forEach((bot, index) => {
      const body = bot.body as Phaser.Physics.Arcade.Body
      const speed = 285 + index * 13 + Math.sin(time / 700 + index) * 12
      bot.setVelocityX(speed)

      const needsJump = jumpZones.some(([from, to]) => bot.x > from && bot.x < to)
      if (body.blocked.down && needsJump) {
        const jumpStrength = 500 + index * 12
        bot.setVelocityY(-jumpStrength)
      }
    })
  }

  private createWorldArt() {
    this.add.rectangle(1800, 360, 3600, 720, 0x67c4ff).setDepth(-20)

    for (let i = 0; i < 16; i += 1) {
      const x = 150 + i * 245
      const y = 100 + (i % 4) * 55
      this.add.ellipse(x, y, 170, 62, 0xffffff, 0.42).setDepth(-18)
      this.add.ellipse(x + 55, y + 5, 120, 54, 0xffffff, 0.34).setDepth(-18)
    }

    const islandPositions = [
      [620, 285, 170, 70],
      [1180, 240, 220, 85],
      [1750, 305, 190, 72],
      [2320, 245, 240, 88],
      [3080, 285, 220, 78],
    ] as const

    islandPositions.forEach(([x, y, width, height], index) => {
      this.add.ellipse(x, y, width, height, 0x7d5a37).setDepth(-15)
      this.add.ellipse(x, y - 17, width * 0.93, height * 0.55, 0x63c85d).setDepth(-14)
      if (index % 2 === 0) {
        this.add.rectangle(x, y + 60, 16, 95, 0x9be9ff, 0.75).setDepth(-16)
      }
    })

    this.add.rectangle(3090, 155, 120, 95, 0xe9f4ff).setDepth(-13)
    this.add.triangle(3030, 112, 0, 60, 60, 0, 120, 60, 0x397cc6).setDepth(-12)
    this.add.triangle(3150, 112, 0, 60, 60, 0, 120, 60, 0x397cc6).setDepth(-12)
    this.add.rectangle(3090, 215, 250, 22, 0x80d878).setDepth(-13)

    const rainbow = this.add.graphics().setDepth(-17)
    rainbow.lineStyle(14, 0xff6f6f, 0.8)
    rainbow.beginPath()
    rainbow.arc(2550, 420, 260, Math.PI, Math.PI * 2)
    rainbow.strokePath()
    rainbow.lineStyle(12, 0xffd45e, 0.8)
    rainbow.beginPath()
    rainbow.arc(2550, 420, 242, Math.PI, Math.PI * 2)
    rainbow.strokePath()
    rainbow.lineStyle(12, 0x5fd97d, 0.8)
    rainbow.beginPath()
    rainbow.arc(2550, 420, 224, Math.PI, Math.PI * 2)
    rainbow.strokePath()
    rainbow.lineStyle(12, 0x4b8de9, 0.8)
    rainbow.beginPath()
    rainbow.arc(2550, 420, 206, Math.PI, Math.PI * 2)
    rainbow.strokePath()

    this.add.text(425, 250, '⭐  KIDDY CLASH  ⭐', {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#267ee6bb',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(-10)
  }

  private createHud() {
    const t = text[this.language]

    this.add.rectangle(640, 49, 1240, 78, 0xffffff, 0.86)
      .setScrollFactor(0)
      .setDepth(20)
      .setStrokeStyle(3, 0xcde9f7)

    this.add.text(185, 20, `🏝️ ${t.race}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '20px',
      color: '#267ee6',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(21)

    this.abilityText = this.add.text(
      185,
      50,
      `👑 ${abilityLabel(leo, this.language)}: ${t.ready}`,
      {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: '15px',
        color: '#158f38',
        fontStyle: 'bold',
      },
    ).setScrollFactor(0).setDepth(21)

    this.add.text(640, 24, t.objective, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '22px',
      color: '#17324d',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(21)

    this.starsText = this.add.text(1025, 17, `⭐ ${t.stars}: 0`, this.hudStyle()).setScrollFactor(0).setDepth(21)
    this.timerText = this.add.text(1025, 48, '⏱ 00:00', this.hudStyle()).setScrollFactor(0).setDepth(21)
    this.positionText = this.add.text(1115, 48, `🏆 ${t.position}: 1/4`, this.hudStyle()).setScrollFactor(0).setDepth(21)
  }

  private completeRace() {
    if (this.finished) return
    this.finished = true
    this.player.setVelocity(0, 0)
    this.bots.forEach((bot) => bot.setVelocityX(0))

    const t = text[this.language]
    const place = 1 + this.bots.filter((bot) => bot.x > this.player.x).length

    const panel = this.add.rectangle(640, 360, 650, 285, 0xffffff, 0.96)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(7, 0x2688e8)

    const hero = this.add.image(430, 360, 'leo')
      .setDisplaySize(128, 148)
      .setScrollFactor(0)
      .setDepth(51)

    const title = this.add.text(700, 285, t.win, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '48px',
      color: '#ff8b22',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const placement = this.add.text(700, 345, `🏆 ${place}/4`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '34px',
      color: '#267ee6',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const result = this.add.text(700, 395, `⭐ ${this.stars}   •   XP +${50 + this.stars * 5}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '25px',
      color: '#17324d',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const replay = this.add.text(700, 452, `▶ ${t.replay}`, {
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
    const left = this.add.circle(105, 610, 56, 0xffffff, 0.72).setScrollFactor(0).setDepth(30).setInteractive()
    const right = this.add.circle(235, 610, 56, 0xffffff, 0.72).setScrollFactor(0).setDepth(30).setInteractive()
    const ability = this.add.circle(980, 610, 61, 0xff9c2f, 0.94).setScrollFactor(0).setDepth(30).setInteractive()
    const jump = this.add.circle(1140, 610, 70, 0x2688e8, 0.9).setScrollFactor(0).setDepth(30).setInteractive()

    left.setStrokeStyle(4, 0x267ee6, 0.35)
    right.setStrokeStyle(4, 0x267ee6, 0.35)
    ability.setStrokeStyle(5, 0xffffff, 0.7)
    jump.setStrokeStyle(5, 0xffffff, 0.7)

    this.add.text(105, 610, '◀', { fontSize: '38px', color: '#17324d' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
    this.add.text(235, 610, '▶', { fontSize: '38px', color: '#17324d' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
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
      fontSize: '17px',
      color: '#17324d',
      fontStyle: 'bold',
    }
  }
}
