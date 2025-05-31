import Fighter from './fighter'
import { AIDifficulty } from './start-screen'
import GameSettings from './game-settings'

export default class AIController {
  private fighter: Fighter
  private player: Fighter
  private difficulty: AIDifficulty
  private lastActionTime: number = 0
  private actionCooldown: number = 0
  private isDefending: boolean = false

  constructor(fighter: Fighter, player: Fighter, difficulty: AIDifficulty) {
    this.fighter = fighter
    this.player = player
    this.difficulty = difficulty
    this.setupDifficultySettings()
  }

  private setupDifficultySettings(): void {
    switch (this.difficulty) {
      case 'easy':
        this.actionCooldown = 2000 // 2 seconds between actions
        break
      case 'expert':
        this.actionCooldown = 800 // 0.8 seconds between actions
        break
      case 'master':
        this.actionCooldown = 300 // 0.3 seconds between actions
        break
    }
  }

  update(): void {
    // Don't update AI if fighter is dead
    if (this.fighter.isDead) {
      return
    }
    
    const currentTime = Date.now()
    
    // Calculate distance to player
    const distance = Math.abs(this.fighter.position.x - this.player.position.x)
    
    // Update AI behavior based on difficulty
    switch (this.difficulty) {
      case 'easy':
        this.updateEasyAI(currentTime, distance)
        break
      case 'expert':
        this.updateExpertAI(currentTime, distance)
        break
      case 'master':
        this.updateMasterAI(currentTime, distance)
        break
    }
  }

  private updateEasyAI(currentTime: number, distance: number): void {
    // Easy AI: Slow movement, low attack frequency, almost no defense
    if (currentTime - this.lastActionTime < this.actionCooldown) {
      return
    }

    // Slowly approach player
    if (distance > 100) {
      this.moveTowardsPlayer(0.3) // Slow movement speed
    } else {
      // Attack with low frequency
      if (Math.random() < 0.3) {
        this.attack()
        this.lastActionTime = currentTime
      }
    }
  }

  private updateExpertAI(currentTime: number, distance: number): void {
    // Expert AI: Balanced attack and defense, higher attack frequency
    if (currentTime - this.lastActionTime < this.actionCooldown) {
      return
    }

    // Check if player is attacking and defend
    if (this.player.isAttackInProgress() && distance < 120) {
      if (Math.random() < 0.6) { // 60% chance to defend
        this.defend()
        this.lastActionTime = currentTime
        return
      }
    }

    // Approach and attack
    if (distance > 80) {
      this.moveTowardsPlayer(0.7) // Moderate movement speed
    } else {
      // Attack with higher frequency
      if (Math.random() < 0.7) {
        this.attack()
        this.lastActionTime = currentTime
      }
    }
  }

  private updateMasterAI(currentTime: number, distance: number): void {
    // Master AI: Aggressive attacks, tight defense, feints
    if (currentTime - this.lastActionTime < this.actionCooldown) {
      return
    }

    // Advanced defense against player attacks
    if (this.player.isAttackInProgress() && distance < 150) {
      if (Math.random() < 0.9) { // 90% chance to defend
        this.defend()
        this.lastActionTime = currentTime
        return
      }
    }

    // Feint attacks (start attack then cancel)
    if (Math.random() < 0.2 && distance < 100) {
      this.feint()
      this.lastActionTime = currentTime
      return
    }

    // Aggressive approach and attack
    if (distance > 60) {
      this.moveTowardsPlayer(1.0) // Fast movement
      
      // Jump attack occasionally
      if (Math.random() < 0.3 && distance < 150) {
        this.jumpAttack()
        this.lastActionTime = currentTime
      }
    } else {
      // Frequent attacks
      if (Math.random() < 0.9) {
        this.attack()
        this.lastActionTime = currentTime
      }
    }
  }

  private moveTowardsPlayer(speedMultiplier: number): void {
    const direction = this.fighter.position.x < this.player.position.x ? 'right' : 'left'
    const speed = GameSettings.playerRunSpeed * speedMultiplier

    if (direction === 'right') {
      this.fighter.position.x += speed
    } else {
      this.fighter.position.x -= speed
    }

    // Update fighter direction (inverted logic)
    if (direction === 'right') {
      this.fighter.sprites.direction = 'Left'  // Face right by setting 'Left'
    } else {
      this.fighter.sprites.direction = 'Right' // Face left by setting 'Right'
    }
  }

  private attack(): void {
    // Set correct direction before attacking
    // Note: direction logic is inverted in Fighter class
    // When moving left, sprites.direction = 'Right'
    // When moving right, sprites.direction = 'Left'
    const direction = this.fighter.position.x < this.player.position.x ? 'right' : 'left'
    
    if (direction === 'right') {
      this.fighter.sprites.direction = 'Left'  // Face right by setting 'Left'
    } else {
      this.fighter.sprites.direction = 'Right' // Face left by setting 'Right'
    }
    
    // Directly call the fighter's attack method
    this.fighter.startAttack()
  }

  private defend(): void {
    // Simple defense: move away from player
    const direction = this.fighter.position.x < this.player.position.x ? 'left' : 'right'
    const speed = GameSettings.playerRunSpeed * 0.5

    if (direction === 'left') {
      this.fighter.position.x -= speed * 2
    } else {
      this.fighter.position.x += speed * 2
    }

    this.isDefending = true
    setTimeout(() => {
      this.isDefending = false
    }, 500)
  }

  private feint(): void {
    // Start an attack motion then quickly move away
    this.attack()
    setTimeout(() => {
      this.defend()
    }, 100)
  }

  private jumpAttack(): void {
    // Directly call the fighter's jump method then attack
    this.fighter.jump()
    
    setTimeout(() => {
      this.attack()
    }, 200)
  }

  // Getter methods for accessing private properties if needed
  isCurrentlyDefending(): boolean {
    return this.isDefending
  }

  getDifficulty(): AIDifficulty {
    return this.difficulty
  }
}