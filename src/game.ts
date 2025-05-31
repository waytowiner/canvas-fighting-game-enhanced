import Fighter from './fighter'
import GameSettings from './game-settings'
import Sprite from './sprite'
import Timer from './timer'
import Sound from './sound'
import Collision from './collision'
import AIController from './ai-controller'
import languageManager from './language-manager'

type ConstructorProps = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  player: Fighter
  enemy: Fighter
  background: Sprite
  shop: Sprite
  aiController?: AIController | null
}

export default class Game {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  timer: Timer
  background: Sprite
  shop: Sprite
  player: Fighter
  enemy: Fighter
  aiController: AIController | null = null
  
  // 三局两胜制相关属性
  private currentRound: number = 1
  private playerScore: number = 0
  private enemyScore: number = 0
  private maxRounds: number = 3
  private gameEnded: boolean = false
  private roundEnded: boolean = false
  private countdownActive: boolean = false

  private backgroundSound = new Sound('./assets/bgm2.mp3', {
    loop: true,
    volume: 0.3,
  })
  private victorSound = new Sound('./assets/victor.mp3', {
    loop: false,
    volume: 0.5,
  })
  private loseSound = new Sound('./assets/lose.mp3', {
    loop: false,
    volume: 0.5,
  })

  constructor({
    canvas,
    context,
    player,
    enemy,
    background,
    shop,
    aiController,
  }: ConstructorProps) {
    this.canvas = canvas
    this.context = context
    this.background = background
    this.shop = shop
    this.player = player
    this.enemy = enemy
    this.aiController = aiController || null

    this.timer = new Timer(GameSettings.gameDuration)
      .onTick(
        timer => (document.querySelector('#timer')!.innerHTML = `${timer}`),
      )
      .onFinish(() => this.determineRoundWinner())

    // 初始化界面文本
    this.initializeUI()
    
    // 监听语言变更
    languageManager.addLanguageChangeListener(() => {
      this.updateUILanguage()
    })
  }

  determineRoundWinner() {
    if (this.gameEnded || this.roundEnded) return
    
    this.roundEnded = true
    const gameStatus = document.querySelector('#gameStatus') as HTMLDivElement
    
    // 判断本局胜负
    let roundWinner = ''
    if (this.player.getHealth() === this.enemy.getHealth()) {
      roundWinner = 'tie'
    } else if (this.player.getHealth() > this.enemy.getHealth()) {
      roundWinner = 'player'
      this.playerScore++
    } else {
      roundWinner = 'enemy'
      this.enemyScore++
    }
    
    // 更新分数显示
    this.updateScoreDisplay()
    
    // 显示本局结果
    gameStatus.style.display = 'flex'
    if (roundWinner === 'tie') {
      gameStatus.innerHTML = languageManager.getText('roundTie')
    } else if (roundWinner === 'player') {
      gameStatus.innerHTML = languageManager.getText('player1RoundWin')
    } else {
      gameStatus.innerHTML = languageManager.getText('player2RoundWin')
    }
    
    // 2秒后检查是否游戏结束或开始倒计时
    setTimeout(() => {
      this.checkGameEnd()
    }, 2000)
  }
  
  checkGameEnd() {
    // 检查是否有人获得两局胜利
    if (this.playerScore >= 2 || this.enemyScore >= 2) {
      this.showFinalResult()
    } else {
      this.startCountdown()
    }
  }
  
  // 显示最终结算画面
  showFinalResult() {
    this.gameEnded = true
    
    const finalResult = document.querySelector('#finalResult') as HTMLDivElement
    const finalImage = document.querySelector('#finalImage') as HTMLDivElement
    const finalText = document.querySelector('#finalText') as HTMLDivElement
    const restartButton = document.querySelector('#restartButton') as HTMLButtonElement
    
    const winner = this.playerScore >= 2 ? 'Player' : 'Enemy'
    
    // 显示胜利者信息
    if (winner === 'Player') {
      finalText.textContent = languageManager.getText('playerFinalWin')
      // 显示玩家胜利图片并加庆祝符号
      finalImage.style.backgroundImage = "url('./assets/kenji/Idle.png')"
      finalImage.classList.remove('failed')
      finalImage.classList.add('victory')
    } else {
      finalText.textContent = languageManager.getText('enemyFinalWin')
      // 显示玩家失败图片并加红叉
      finalImage.style.backgroundImage = "url('./assets/kenji/Idle.png')"
      finalImage.classList.remove('victory')
      finalImage.classList.add('failed')
    }
    
    // 设置重启按钮文本
    restartButton.textContent = languageManager.getText('backToStart')
    
    // 添加返回按钮事件监听器
    restartButton.onclick = () => {
      window.location.reload()
    }
    
    finalResult.style.display = 'flex'
  }
  
  startCountdown() {
    this.countdownActive = true
    const countdownDiv = document.querySelector('#countdown') as HTMLDivElement
    const countdownNumber = document.querySelector('#countdownNumber') as HTMLDivElement
    let countdown = 3
    
    countdownDiv.style.display = 'flex'
    
    const countdownInterval = setInterval(() => {
      countdownNumber.textContent = countdown.toString()
      countdown--
      
      if (countdown < 0) {
        clearInterval(countdownInterval)
        countdownDiv.style.display = 'none'
        this.countdownActive = false
        this.startNextRound()
      }
    }, 1000)
  }

  start() {
    this.updateRoundDisplay()
    this.updateScoreDisplay()
    this.timer.start()
    this.animate()
    this.backgroundSound.play()
  }
  
  // 更新回合显示
  updateRoundDisplay() {
    const roundInfo = document.querySelector('#roundInfo') as HTMLDivElement
    roundInfo.innerHTML = languageManager.getText('round', this.currentRound.toString())
  }
  
  // 更新分数显示
  updateScoreDisplay() {
    const playerScore = document.querySelector('#playerScore') as HTMLSpanElement
    const enemyScore = document.querySelector('#enemyScore') as HTMLSpanElement
    playerScore.innerHTML = this.playerScore.toString()
    enemyScore.innerHTML = this.enemyScore.toString()
  }
  
  // 开始下一局
  startNextRound() {
    if (this.gameEnded) return
    
    // 重置回合状态
    this.roundEnded = false
    this.currentRound++
    this.updateRoundDisplay()
    
    // 隐藏游戏状态显示
    const gameStatus = document.querySelector('#gameStatus') as HTMLDivElement
    gameStatus.style.display = 'none'
    
    // 重置角色状态
    this.resetFighters()
    
    // 重置计时器
    this.timer.reset()
    this.timer.start()
  }
  
  // 重置角色状态
  resetFighters() {
    // 重置血量
    this.player.resetHealth()
    this.enemy.resetHealth()
    
    // 更新血量显示
    this.updateHealth(this.player.getHealth(), '#playerHealth')
    this.updateHealth(this.enemy.getHealth(), '#enemyHealth')
    
    // 重置位置
    this.player.resetPosition()
    this.enemy.resetPosition()
  }

  animate() {
    window.requestAnimationFrame(() => {
      this.animate()
    })

    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.background.update(this.canvas, this.context)

    this.shop.update(this.canvas, this.context)

    this.context.fillStyle = 'rgba(255,255,255,0.15)'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 在倒计时期间禁止角色移动
    const canMove = !this.countdownActive && !this.roundEnded
    this.player.update(this.canvas, this.context, canMove)
    this.enemy.update(this.canvas, this.context, canMove)

    // Update AI if in PVE mode
    if (this.aiController) {
      this.aiController.update()
    }

    if (this.timer.isFinished() || this.gameEnded || this.roundEnded || this.countdownActive) {
      return
    }

    if (
      this.hasFightersCollided(this.player, this.enemy) &&
      this.player.isAttackInProgress()
    ) {
      this.player.finishAttack()
      this.enemy.takeHit()
      this.updateHealth(this.enemy.getHealth(), '#enemyHealth')
    }

    // if player misses
    if (this.player.isAttackInProgress()) {
      this.player.finishAttack()
    }

    if (
      this.hasFightersCollided(this.enemy, this.player) &&
      this.enemy.isAttackInProgress()
    ) {
      this.enemy.finishAttack()
      this.player.takeHit()
      this.updateHealth(this.player.getHealth(), '#playerHealth')
    }

    // if enemy misses
    if (this.enemy.isAttackInProgress()) {
      this.enemy.finishAttack()
    }

    // end round based on health
    if (this.enemy.getHealth() <= 0 || this.player.getHealth() <= 0) {
      this.determineRoundWinner()
      this.timer.stop()
    }
  }

  hasFightersCollided = (fighter1: Fighter, fighter2: Fighter) => {
    return Collision.detect({
      fighter1,
      fighter2,
    })
  }

  updateHealth = (health: number, selector: string) => {
    const enemyHealth = document.querySelector(selector) as HTMLDivElement
    enemyHealth.style.width = `${health}%`
  }

  // 初始化界面文本
  initializeUI() {
    this.updateRoundDisplay()
    const restartButton = document.querySelector('#restartButton') as HTMLButtonElement
    if (restartButton) {
      restartButton.textContent = languageManager.getText('backToStart')
    }
  }

  // 更新界面语言
  updateUILanguage() {
    this.updateRoundDisplay()
    const restartButton = document.querySelector('#restartButton') as HTMLButtonElement
    if (restartButton) {
      restartButton.textContent = languageManager.getText('backToStart')
    }
  }
}
