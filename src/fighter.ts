import Box from './box'
import Sprite from './sprite'
import FrameManager from './frame-manager'
import FighterSpriteSheets, {type FightActions} from './fighter-sprite-sheets'
import {Point} from './types'
import GameSettings from './game-settings'
import KeyboardManager from './keyboard-manager'
import Sound from './sound'

type ConstructorProps = {
  position: Point
  velocity: Point
  offset: Point
  scale: number
  keyboardManager: KeyboardManager
  frameManager: FrameManager
  sprites: FighterSpriteSheets
  attackBox: Box
  onAttack?: () => void
}

export default class Fighter extends Sprite {
  private velocity: Point
  attackBox: Box
  sprites: FighterSpriteSheets
  keyboardManager: KeyboardManager
  private health: number = 100
  private initialHealth: number = 100
  private initialPosition: Point
  isDead: boolean = false
  private isAttacking: boolean = false
  private canJump: boolean = true
  private attackSound: Sound
  private jumpSound: Sound
  private dieSound: Sound

  constructor(props: ConstructorProps) {
    super({
      ...props,
      width: 50,
      height: 150,
    })

    const {sprites, attackBox, velocity, keyboardManager} = props
    this.keyboardManager = keyboardManager
    this.sprites = sprites

    if (this.sprites.direction === 'Right') {
      this.attackSound = new Sound('./assets/hit.wav', {
        restartOnPlay: true,
      })
      this.jumpSound = new Sound('./assets/jump.mp3', {
        restartOnPlay: true,
      })
    } else {
      this.attackSound = new Sound('./assets/hit2.wav', {
        restartOnPlay: true,
      })
      this.jumpSound = new Sound('./assets/jump2.mp3', {
        restartOnPlay: true,
      })
    }

    this.dieSound = new Sound('./assets/die.wav', {
      volume: 0.4,
    })

    this.velocity = velocity
    this.initialPosition = { ...this.position }

    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: attackBox.width,
      height: attackBox.height,
      offset: attackBox.offset,
    }

    this.keyboardManager.onJump = () => this.jump()
    this.keyboardManager.onAttack = () => this.startAttack()
  }

  update(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, canMove: boolean = true) {
    this.draw(context)

    if (!this.isDead) {
      this.animateFrames()
    }

    this.attackBox.position.x = this.position.x + this.attackBox.offset.x
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y

    if (this.sprites.direction === 'Right') {
      this.attackBox.position.x =
        this.position.x - this.attackBox.offset.x - this.width * 2
    }

    if (GameSettings.debug) {
      // attack box
      context.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height,
      )

      // fighter
      context.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      )
    }

    // 只有在允许移动时才更新位置和处理输入
    if (canMove) {
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y

      // gravity function
      if (
        this.position.y + this.height + this.velocity.y >=
        canvas.height - GameSettings.groundHeight
      ) {
        this.velocity.y = 0
        this.position.y = GameSettings.playerInitialFallPosition
        this.canJump = true
      } else {
        this.velocity.y += GameSettings.gravity
        this.canJump = false
      }

      this.velocity.x = 0

      if (this.shouldMoveLeft()) {
        this.moveLeft()
      } else if (this.shouldMoveRight()) {
        this.moveRight()
      } else {
        this.setIdle()
      }

      if (this.velocity.y < 0) {
        this.switchSprite('Jump')
      } else if (this.velocity.y > 0) {
        this.switchSprite('Fall')
      }
    }
  }

  getHealth() {
    return this.health
  }

  setIdle() {
    this.velocity.x = 0
    this.switchSprite('Idle')
  }

  shouldMoveLeft = () => {
    if (this.isDead) {
      return false
    }

    return (
      this.keyboardManager.getKey('MoveLeft')?.pressed &&
      this.keyboardManager.lastKey === 'MoveLeft'
    )
  }

  moveLeft() {
    if (this.isDead) {
      return
    }

    const newPosition = this.position.x - GameSettings.playerRunSpeed

    if (newPosition < 0) {
      return
    }

    this.velocity.x = -GameSettings.playerRunSpeed
    this.sprites.direction = 'Right'
    this.switchSprite('Run')
  }

  shouldMoveRight = () => {
    if (this.isDead) {
      return false
    }

    return (
      this.keyboardManager.getKey('MoveRight')?.pressed &&
      this.keyboardManager.lastKey === 'MoveRight'
    )
  }

  moveRight() {
    const newPosition =
      this.position.x + GameSettings.playerRunSpeed + this.width
    if (newPosition > GameSettings.screenWidth) {
      return
    }

    this.velocity.x = GameSettings.playerRunSpeed
    this.sprites.direction = 'Left'
    this.switchSprite('Run')
  }

  startAttack() {
    if (!this.isDead) {
      this.switchSprite('Attack1')
      this.isAttacking = true
    }
  }

  finishAttack() {
    this.isAttacking = false
    this.attackSound.play()
  }

  isAttackInProgress() {
    return (
      this.isAttacking &&
      this.frameManager.current === this.sprites.attackFrameNumber
    )
  }

  jump() {
    if (!this.isDead && this.canJump) {
      this.jumpSound.play()
      this.velocity.y -= GameSettings.playerJumpHeight
    }
  }

  takeHit() {
    this.health -= GameSettings.playerDamage

    if (this.health <= 0) {
      this.switchSprite('Death')
      if (!this.isDead) {
        this.dieSound.play()
      }
    } else {
      this.switchSprite('TakeHit')
    }
  }

  switchSprite(action: FightActions) {
    let sprite = this.sprites.get(action)

    const deadSprite = this.sprites.get('Death')
    if (this.image === deadSprite?.image) {
      if (this.frameManager.current === deadSprite.maxFrames - 1) {
        this.isDead = true
      }
      // 只有在不是重置到Idle状态时才阻止切换
      if (action !== 'Idle') {
        return
      }
    }

    // overriding all other animations with the attack animation
    const attackSprite = this.sprites.get('Attack1')
    if (
      this.image === attackSprite?.image &&
      this.frameManager.current < attackSprite.maxFrames - 1
    ) {
      return
    }

    // overriding all other animations with the take hit animation
    const takeHitSprite = this.sprites.get('TakeHit')
    if (
      this.image === takeHitSprite?.image &&
      this.frameManager.current < takeHitSprite.maxFrames - 1
    ) {
      return
    }

    if (sprite && this.image != sprite.image) {
      this.image = sprite.image
      this.frameManager.max = sprite.maxFrames
      this.frameManager.current = 0
    }
  }
  
  // 重置血量
  resetHealth() {
    this.health = this.initialHealth
    this.isDead = false
    this.switchSprite('Idle')
  }
  
  // 重置位置
  resetPosition() {
    this.position.x = this.initialPosition.x
    this.position.y = this.initialPosition.y
    this.velocity.x = 0
    this.velocity.y = 0
    this.isAttacking = false
    this.canJump = true
    // 确保角色以正常状态登场
    this.switchSprite('Idle')
  }
}
