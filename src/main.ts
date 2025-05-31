import './style.css'

import FrameManager from './frame-manager'
import GameBuilder from './game-builder'
import Sprite from './sprite'
import StartScreen, { GameConfig } from './start-screen'
import Game from './game'
import AIController from './ai-controller'
import KeyboardManager from './keyboard-manager'

class GameApp {
  private startScreen: StartScreen
  private currentGame: Game | null = null

  constructor() {
    this.startScreen = new StartScreen((config: GameConfig) => this.startGame(config))
    this.hideGameUI()
  }

  private hideGameUI(): void {
    const header = document.querySelector('header') as HTMLElement
    const gameStatus = document.querySelector('#gameStatus') as HTMLElement
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    
    if (header) header.style.display = 'none'
    if (gameStatus) gameStatus.style.display = 'none'
    if (canvas) canvas.style.display = 'none'
  }

  private showGameUI(): void {
    const header = document.querySelector('header') as HTMLElement
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    
    if (header) header.style.display = 'flex'
    if (canvas) canvas.style.display = 'block'
  }

  private startGame(config: GameConfig): void {
    this.showGameUI()
    
    // Create players based on selection
    const player = config.player1Character.createFunction('Left')
    const enemy = config.player2Character.createFunction('Right')

    // Create AI controller for PVE mode
    let aiController: AIController | null = null
    if (config.mode === 'PVE' && config.aiDifficulty) {
      aiController = new AIController(enemy, player, config.aiDifficulty)
      
      // Replace enemy's keyboard manager with a dummy one for AI control
      const dummyKeyboardManager = new KeyboardManager()
      enemy.keyboardManager = dummyKeyboardManager
    }

    this.currentGame = new GameBuilder()
      .setCanvas(document.querySelector<HTMLCanvasElement>('canvas'))
      .setBackground(
        new Sprite({
          position: {x: 0, y: 0},
          imageSrc: './assets/background.png',
        }),
      )
      .setShop(
        new Sprite({
          position: {x: 600, y: 128},
          imageSrc: './assets/shop.png',
          scale: 2.75,
          frameManager: new FrameManager({max: 6, hold: 5}),
        }),
      )
      .setPlayer(player)
      .setEnemy(enemy)
      .setAIController(aiController)
      .build()

    this.currentGame.start()
  }

  public returnToStartScreen(): void {
    this.hideGameUI()
    this.startScreen.show()
    if (this.currentGame) {
      // Stop current game if needed
      this.currentGame = null
    }
  }
}

// Initialize the game application
new GameApp()
