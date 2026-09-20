import Phaser from 'phaser'
import type { GameLanguage } from '../createGame'

const text = {
  'pt-BR': {
    objective: 'Colete estrelas e chegue primeiro!',
    stars: 'Estrelas',
    position: 'Posição',
    finish: 'CHEGADA',
    win: 'Você chegou!',
    replay: 'Toque para jogar novamente',
    jump: 'PULAR',
  },
  'en-US': {
    objective: 'Collect stars and finish first!',
    stars: 'Stars',
    position: 'Position',
    finish: 'FINISH',
    win: 'You finished!',
    replay: 'Tap to play again',
    jump: 'JUMP',
  },
} as const

export class RaceScene extends Phaser.Scene {
  private readonly language: GameLanguage
  private player!: Phaser.Physics.Arcade.Sprite
  private bot!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private stars = 0
  private finished = false
  private startTime = 0
  private starsText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private positionText!: Phaser.GameObjects.Text
  private leftHeld = false
  private rightHeld = false
  private jumpQueued = false

  constructor(language: GameLanguage) {
    super('race')
    this.language = language
  }

  create() {
    const t = text[this.language]
    this.physics.world.setBounds(0, 0, 3600, 720)
    this.cameras.main.setBounds(0, 0, 3600, 720)

    this.createTextures()
    this.add.rectangle(1800, 360, 3600, 720, 0x75c9ff)
    this.add.circle(250, 120, 90, 0xffffff, 0.48)
    this.add.circle(900, 100, 70, 0xffffff, 0.38)
    this.add.circle(1700, 140, 110, 0xffffff, 0.42)

    const ground = this.physics.add.staticGroup()
    for (let x = 0; x < 3600; x += 320) {
      const y = x > 1850 && x < 2200 ? 610 : 650
      ground.create(x + 160, y, 'ground').refreshBody()
    }

    ground.create(880, 520, 'platform').refreshBody()
    ground.create(1420, 470, 'platform').refreshBody()
    ground.create(2460, 520, 'platform').refreshBody()

    this.player = this.physics.add.sprite(180, 560, 'leo')
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0.02)
    this.player.setMaxVelocity(520, 900)

    this.bot = this.physics.add.sprite(110, 560, 'bot')
    this.bot.setCollideWorldBounds(true)
    this.bot.setTint(0xff7fa7)

    this.physics.add.collider(this.player, ground)
    this.physics.add.collider(this.bot, ground)

    const stars = this.physics.add.staticGroup()
    ;[480, 760, 1020, 1300, 1540, 1820, 2320, 2600, 2920, 3200].forEach((x, index) => {
      const y = index % 3 === 1 ? 390 : 510
      stars.create(x, y, 'star')
    })

    this.physics.add.overlap(this.player, stars, (_, star) => {
      const collectible = star as Phaser.Physics.Arcade.Sprite
      collectible.disableBody(true, true)
      this.stars += 1
      this.starsText.setText(`${t.stars}: ${this.stars}`)
    })

    const finish = this.physics.add.staticImage(3420, 520, 'finish')
    this.physics.add.overlap(this.player, finish, () => this.completeRace())
    this.physics.add.overlap(this.bot, finish, () => this.bot.setVelocityX(0))

    this.add.text(3390, 340, t.finish, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '34px',
      color: '#17324d',
      backgroundColor: '#ffffffcc',
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.input.keyboard!.addKeys('W,A,D,SPACE')

    this.add.text(640, 26, t.objective, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '26px',
      color: '#17324d',
      backgroundColor: '#ffffffdd',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20)

    this.starsText = this.add.text(1060, 30, `${t.stars}: 0`, this.hudStyle()).setScrollFactor(0).setDepth(20)
    this.timerText = this.add.text(1060, 72, '00:00', this.hudStyle()).setScrollFactor(0).setDepth(20)
    this.positionText = this.add.text(1060, 114, `${t.position}: 1/2`, this.hudStyle()).setScrollFactor(0).setDepth(20)

    this.createTouchControls()
    this.startTime = this.time.now

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -180, 40)
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

    if (left && !right) this.player.setVelocityX(-330)
    else if (right && !left) this.player.setVelocityX(380)
    else this.player.setVelocityX(this.player.body!.velocity.x * 0.82)

    const grounded = (this.player.body as Phaser.Physics.Arcade.Body).blocked.down
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(space) ||
      Phaser.Input.Keyboard.JustDown(w)

    if ((jumpPressed || this.jumpQueued) && grounded) {
      this.player.setVelocityY(-560)
      this.jumpQueued = false
    }

    const botGrounded = (this.bot.body as Phaser.Physics.Arcade.Body).blocked.down
    this.bot.setVelocityX(this.bot.x < 2800 ? 285 : 320)
    if (botGrounded && (this.bot.x > 760 && this.bot.x < 900 || this.bot.x > 1370 && this.bot.x < 1480 || this.bot.x > 2380 && this.bot.x < 2490)) {
      this.bot.setVelocityY(-520)
    }

    const elapsed = Math.max(0, time - this.startTime)
    const seconds = Math.floor(elapsed / 1000)
    this.timerText.setText(`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`)
    this.positionText.setText(`${text[this.language].position}: ${this.player.x >= this.bot.x ? '1/2' : '2/2'}`)
  }

  private completeRace() {
    if (this.finished) return
    this.finished = true
    this.player.setVelocity(0, 0)
    this.bot.setVelocityX(0)

    const t = text[this.language]
    const panel = this.add.rectangle(640, 360, 620, 250, 0xffffff, 0.94)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(6, 0x2688e8)

    const title = this.add.text(640, 315, t.win, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '50px',
      color: '#ff8b22',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const result = this.add.text(640, 375, `⭐ ${this.stars}   •   XP +${50 + this.stars * 5}`, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '28px',
      color: '#17324d',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    const replay = this.add.text(640, 430, t.replay, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '22px',
      color: '#2688e8',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)

    panel.setInteractive({ useHandCursor: true }).once('pointerdown', () => this.scene.restart())
    title.setInteractive({ useHandCursor: true }).once('pointerdown', () => this.scene.restart())
    result.setInteractive({ useHandCursor: true }).once('pointerdown', () => this.scene.restart())
    replay.setInteractive({ useHandCursor: true }).once('pointerdown', () => this.scene.restart())
  }

  private createTouchControls() {
    const t = text[this.language]
    const left = this.add.circle(110, 610, 58, 0xffffff, 0.56).setScrollFactor(0).setDepth(30).setInteractive()
    const right = this.add.circle(245, 610, 58, 0xffffff, 0.56).setScrollFactor(0).setDepth(30).setInteractive()
    const jump = this.add.circle(1140, 610, 68, 0x2688e8, 0.82).setScrollFactor(0).setDepth(30).setInteractive()

    this.add.text(110, 610, '◀', { fontSize: '38px', color: '#17324d' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
    this.add.text(245, 610, '▶', { fontSize: '38px', color: '#17324d' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)
    this.add.text(1140, 610, `↑\n${t.jump}`, { align: 'center', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(31)

    left.on('pointerdown', () => { this.leftHeld = true })
    left.on('pointerup', () => { this.leftHeld = false })
    left.on('pointerout', () => { this.leftHeld = false })

    right.on('pointerdown', () => { this.rightHeld = true })
    right.on('pointerup', () => { this.rightHeld = false })
    right.on('pointerout', () => { this.rightHeld = false })

    jump.on('pointerdown', () => { this.jumpQueued = true })
  }

  private createTextures() {
    const graphics = this.add.graphics()

    graphics.fillStyle(0x55b94e)
    graphics.fillRoundedRect(0, 0, 320, 70, 18)
    graphics.fillStyle(0x8b5d34)
    graphics.fillRoundedRect(0, 35, 320, 35, 14)
    graphics.generateTexture('ground', 320, 70)
    graphics.clear()

    graphics.fillStyle(0x63c85d)
    graphics.fillRoundedRect(0, 0, 230, 42, 16)
    graphics.fillStyle(0x8b5d34)
    graphics.fillRoundedRect(0, 24, 230, 34, 12)
    graphics.generateTexture('platform', 230, 58)
    graphics.clear()

    graphics.fillStyle(0xf3a340)
    graphics.fillCircle(34, 34, 32)
    graphics.fillStyle(0x7b3f1e)
    graphics.fillCircle(34, 30, 24)
    graphics.fillStyle(0xffd9a3)
    graphics.fillCircle(34, 34, 17)
    graphics.generateTexture('leo', 68, 68)
    graphics.clear()

    graphics.fillStyle(0xffffff)
    graphics.fillCircle(30, 30, 28)
    graphics.fillStyle(0xff7fa7)
    graphics.fillCircle(30, 30, 18)
    graphics.generateTexture('bot', 60, 60)
    graphics.clear()

    graphics.fillStyle(0xffd43b)
    graphics.fillStar(24, 24, 5, 23, 11)
    graphics.generateTexture('star', 48, 48)
    graphics.clear()

    graphics.fillStyle(0xffffff)
    graphics.fillRect(0, 0, 18, 160)
    graphics.fillStyle(0x17324d)
    graphics.fillRect(18, 0, 18, 160)
    graphics.generateTexture('finish', 36, 160)
    graphics.destroy()
  }

  private hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '24px',
      color: '#17324d',
      backgroundColor: '#ffffffdd',
      padding: { x: 12, y: 6 },
    }
  }
}
