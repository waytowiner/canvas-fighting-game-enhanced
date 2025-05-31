import { createSamuraiKenji } from './fighters/samurai-kenji'
import { createSamuraiMack } from './fighters/samurai-mack'
import { createWizardAlatar } from './fighters/wizard-alatar'
import { createWizardAlbus } from './fighters/wizard-albus'
import Fighter from './fighter'
import { Direction } from './types'
import Sound from './sound'
import languageManager from './language-manager'

export interface CharacterInfo {
  name: string
  displayName: string
  createFunction: (direction: Direction) => Fighter
  previewImage: string
}

export const characters: CharacterInfo[] = [
  {
    name: 'samurai-kenji',
    displayName: 'Samurai Kenji', // Will be updated dynamically
    createFunction: createSamuraiKenji,
    previewImage: './assets/characters/samuraiKenji/Idle.png'
  },
  {
    name: 'samurai-mack',
    displayName: 'Samurai Mack', // Will be updated dynamically
    createFunction: createSamuraiMack,
    previewImage: './assets/characters/samuraiMack/Idle.png'
  },
  {
    name: 'wizard-alatar',
    displayName: 'Wizard Alatar', // Will be updated dynamically
    createFunction: createWizardAlatar,
    previewImage: './assets/characters/wizardAlatar/Idle.png'
  },
  {
    name: 'wizard-albus',
    displayName: 'Wizard Albus', // Will be updated dynamically
    createFunction: createWizardAlbus,
    previewImage: './assets/characters/wizardAlbus/Idle.png'
  }
]

export type GameMode = 'PVP' | 'PVE'
export type AIDifficulty = 'easy' | 'expert' | 'master'

export interface GameConfig {
  mode: GameMode
  player1Character: CharacterInfo
  player2Character: CharacterInfo
  aiDifficulty?: AIDifficulty
}

export default class StartScreen {
  private container: HTMLElement
  private onStartGame: (config: GameConfig) => void
  private selectedPlayer1: CharacterInfo | null = null
  private selectedPlayer2: CharacterInfo | null = null
  private selectedMode: GameMode = 'PVP'
  private selectedDifficulty: AIDifficulty = 'easy'
  private startScreenMusic = new Sound('./assets/GameOn.mp3', {
    loop: true,
    volume: 0.3,
  })

  constructor(onStartGame: (config: GameConfig) => void) {
    this.onStartGame = onStartGame
    this.container = this.createStartScreen()
    document.body.appendChild(this.container)
    
    // Listen for language changes
    languageManager.addLanguageChangeListener(() => {
      this.updateLanguage()
    })
    
    this.show()
  }

  private createStartScreen(): HTMLElement {
    const container = document.createElement('div')
    container.id = 'startScreen'
    container.className = 'start-screen'

    // Language switch button
    const languageButton = this.createLanguageButton()

    const title = document.createElement('h1')
    title.textContent = languageManager.getText('gameTitle')
    title.className = 'game-title'
    title.id = 'gameTitle'

    // Game mode selection
    const modeSection = this.createModeSelection()

    const subtitle = document.createElement('p')
    subtitle.textContent = languageManager.getText('selectCharacter')
    subtitle.className = 'game-subtitle'
    subtitle.id = 'selectCharacter'

    const selectionContainer = document.createElement('div')
    selectionContainer.className = 'character-selection'

    // Player 1 selection
    const player1Section = this.createPlayerSection(languageManager.getText('player1'), 'player1')
    
    // VS text
    const vsText = document.createElement('div')
    vsText.textContent = 'VS'
    vsText.className = 'vs-text'

    // Player 2 selection
    const player2Section = this.createPlayerSection(languageManager.getText('player2'), 'player2')

    selectionContainer.appendChild(player1Section)
    selectionContainer.appendChild(vsText)
    selectionContainer.appendChild(player2Section)

    const startButton = document.createElement('button')
    startButton.textContent = languageManager.getText('startGame')
    startButton.className = 'start-button'
    startButton.id = 'startButton'
    startButton.disabled = true
    startButton.onclick = () => this.startGame()

    container.appendChild(languageButton)
    container.appendChild(title)
    container.appendChild(modeSection)
    container.appendChild(subtitle)
    container.appendChild(selectionContainer)
    container.appendChild(startButton)

    return container
  }

  private createModeSelection(): HTMLElement {
    const modeContainer = document.createElement('div')
    modeContainer.className = 'mode-selection'

    const modeTitle = document.createElement('h3')
    modeTitle.textContent = languageManager.getText('selectGameMode')
    modeTitle.className = 'mode-title'
    modeTitle.id = 'selectGameMode'

    const modeButtons = document.createElement('div')
    modeButtons.className = 'mode-buttons'

    // PVP Button
    const pvpButton = document.createElement('button')
    pvpButton.textContent = languageManager.getText('pvpMode')
    pvpButton.className = 'mode-button active'
    pvpButton.id = 'pvpButton'
    pvpButton.onclick = () => this.selectMode('PVP', pvpButton, pveButton, difficultySection)

    // PVE Button
    const pveButton = document.createElement('button')
    pveButton.textContent = languageManager.getText('pveMode')
    pveButton.className = 'mode-button'
    pveButton.id = 'pveButton'
    pveButton.onclick = () => this.selectMode('PVE', pveButton, pvpButton, difficultySection)

    modeButtons.appendChild(pvpButton)
    modeButtons.appendChild(pveButton)

    // AI Difficulty selection (initially hidden)
    const difficultySection = this.createDifficultySelection()
    difficultySection.style.display = 'none'

    modeContainer.appendChild(modeTitle)
    modeContainer.appendChild(modeButtons)
    modeContainer.appendChild(difficultySection)

    return modeContainer
  }

  private createDifficultySelection(): HTMLElement {
    const difficultyContainer = document.createElement('div')
    difficultyContainer.className = 'difficulty-selection'

    const difficultyTitle = document.createElement('h4')
    difficultyTitle.textContent = languageManager.getText('selectAIDifficulty')
    difficultyTitle.className = 'difficulty-title'
    difficultyTitle.id = 'selectAIDifficulty'

    const difficultyButtons = document.createElement('div')
    difficultyButtons.className = 'difficulty-buttons'

    const difficulties = [
      { key: 'easy', labelKey: 'easyDifficulty', descriptionKey: 'easyDescription' },
      { key: 'expert', labelKey: 'expertDifficulty', descriptionKey: 'expertDescription' },
      { key: 'master', labelKey: 'masterDifficulty', descriptionKey: 'masterDescription' }
    ]

    difficulties.forEach((diff, index) => {
      const button = document.createElement('button')
      button.textContent = languageManager.getText(diff.labelKey as any)
      button.className = `difficulty-button ${index === 0 ? 'active' : ''}`
      button.title = languageManager.getText(diff.descriptionKey as any)
      button.id = `${diff.key}Button`
      button.onclick = () => this.selectDifficulty(diff.key as AIDifficulty, button)
      difficultyButtons.appendChild(button)
    })

    difficultyContainer.appendChild(difficultyTitle)
    difficultyContainer.appendChild(difficultyButtons)

    return difficultyContainer
  }

  private selectMode(mode: GameMode, activeButton: HTMLButtonElement, inactiveButton: HTMLButtonElement, difficultySection: HTMLElement): void {
    this.selectedMode = mode
    activeButton.classList.add('active')
    inactiveButton.classList.remove('active')

    if (mode === 'PVE') {
      difficultySection.style.display = 'block'
      // Update player 2 section title
      const player2Title = document.querySelector('.player-section:last-of-type .player-title') as HTMLElement
      if (player2Title) {
        player2Title.textContent = languageManager.getText('aiOpponent')
      }
    } else {
      difficultySection.style.display = 'none'
      // Update player 2 section title back
      const player2Title = document.querySelector('.player-section:last-of-type .player-title') as HTMLElement
      if (player2Title) {
        player2Title.textContent = languageManager.getText('player2')
      }
    }

    this.updateStartButton()
  }

  private selectDifficulty(difficulty: AIDifficulty, activeButton: HTMLButtonElement): void {
    this.selectedDifficulty = difficulty
    
    // Remove active class from all difficulty buttons
    const difficultyButtons = document.querySelectorAll('.difficulty-button')
    difficultyButtons.forEach(btn => btn.classList.remove('active'))
    
    // Add active class to selected button
    activeButton.classList.add('active')
  }

  private createPlayerSection(playerName: string, playerId: string): HTMLElement {
    const section = document.createElement('div')
    section.className = 'player-section'

    const label = document.createElement('h3')
    label.textContent = playerName
    label.className = 'player-title'

    const charactersGrid = document.createElement('div')
    charactersGrid.className = 'characters-grid'

    characters.forEach(character => {
      const characterCard = document.createElement('div')
      characterCard.className = 'character-card'
      characterCard.dataset.character = character.name
      characterCard.dataset.player = playerId

      const characterImage = document.createElement('div')
      characterImage.className = 'character-image'
      characterImage.style.backgroundImage = `url(${character.previewImage})`

      const characterName = document.createElement('div')
      characterName.className = 'character-name'
      characterName.textContent = character.displayName

      characterCard.appendChild(characterImage)
      characterCard.appendChild(characterName)
      characterCard.onclick = () => this.selectCharacter(character, playerId)

      charactersGrid.appendChild(characterCard)
    })

    section.appendChild(label)
    section.appendChild(charactersGrid)

    return section
  }

  private selectCharacter(character: CharacterInfo, playerId: string): void {
    // Remove previous selection
    const previousSelected = document.querySelector(`[data-player="${playerId}"].selected`)
    if (previousSelected) {
      previousSelected.classList.remove('selected')
    }

    // Add selection to current character
    const characterCard = document.querySelector(`[data-character="${character.name}"][data-player="${playerId}"]`)
    if (characterCard) {
      characterCard.classList.add('selected')
    }

    // Update selection state
    if (playerId === 'player1') {
      this.selectedPlayer1 = character
    } else {
      this.selectedPlayer2 = character
    }

    // Enable start button if both players selected
    this.updateStartButton()
  }

  private updateStartButton(): void {
    const startButton = document.querySelector('.start-button') as HTMLButtonElement
    if (startButton) {
      startButton.disabled = !(this.selectedPlayer1 && this.selectedPlayer2)
    }
  }

  private startGame(): void {
    if (this.selectedPlayer1 && this.selectedPlayer2) {
      const config: GameConfig = {
        mode: this.selectedMode,
        player1Character: this.selectedPlayer1,
        player2Character: this.selectedPlayer2,
        aiDifficulty: this.selectedMode === 'PVE' ? this.selectedDifficulty : undefined
      }
      this.hide()
      this.onStartGame(config)
    }
  }

  public show(): void {
    this.container.style.display = 'flex'
    this.startScreenMusic.play()
  }

  public hide(): void {
    this.container.style.display = 'none'
    this.startScreenMusic.stop()
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }

  private createLanguageButton(): HTMLElement {
    const languageContainer = document.createElement('div')
    languageContainer.className = 'language-switch'

    const languageButton = document.createElement('button')
    languageButton.className = 'language-button'
    languageButton.id = 'languageButton'
    languageButton.textContent = languageManager.getCurrentLanguage() === 'zh' ? 'EN' : '中'
    languageButton.title = languageManager.getText('language')
    languageButton.onclick = () => {
      languageManager.toggleLanguage()
    }

    languageContainer.appendChild(languageButton)
    return languageContainer
  }

  private updateLanguage(): void {
    // Update all text elements
    const gameTitle = document.getElementById('gameTitle')
    if (gameTitle) gameTitle.textContent = languageManager.getText('gameTitle')

    const selectCharacter = document.getElementById('selectCharacter')
    if (selectCharacter) selectCharacter.textContent = languageManager.getText('selectCharacter')

    const selectGameMode = document.getElementById('selectGameMode')
    if (selectGameMode) selectGameMode.textContent = languageManager.getText('selectGameMode')

    const pvpButton = document.getElementById('pvpButton')
    if (pvpButton) pvpButton.textContent = languageManager.getText('pvpMode')

    const pveButton = document.getElementById('pveButton')
    if (pveButton) pveButton.textContent = languageManager.getText('pveMode')

    const selectAIDifficulty = document.getElementById('selectAIDifficulty')
    if (selectAIDifficulty) selectAIDifficulty.textContent = languageManager.getText('selectAIDifficulty')

    const easyButton = document.getElementById('easyButton')
    if (easyButton) {
      easyButton.textContent = languageManager.getText('easyDifficulty')
      easyButton.title = languageManager.getText('easyDescription')
    }

    const expertButton = document.getElementById('expertButton')
    if (expertButton) {
      expertButton.textContent = languageManager.getText('expertDifficulty')
      expertButton.title = languageManager.getText('expertDescription')
    }

    const masterButton = document.getElementById('masterButton')
    if (masterButton) {
      masterButton.textContent = languageManager.getText('masterDifficulty')
      masterButton.title = languageManager.getText('masterDescription')
    }

    const startButton = document.getElementById('startButton')
    if (startButton) startButton.textContent = languageManager.getText('startGame')

    const languageButton = document.getElementById('languageButton')
    if (languageButton) {
      languageButton.textContent = languageManager.getCurrentLanguage() === 'zh' ? 'EN' : '中'
      languageButton.title = languageManager.getText('language')
    }

    // Update player section titles
    const playerTitles = document.querySelectorAll('.player-title')
    if (playerTitles.length >= 2) {
      (playerTitles[0] as HTMLElement).textContent = languageManager.getText('player1')
      if (this.selectedMode === 'PVE') {
        (playerTitles[1] as HTMLElement).textContent = languageManager.getText('aiOpponent')
      } else {
        (playerTitles[1] as HTMLElement).textContent = languageManager.getText('player2')
      }
    }

    // Update character names
    const characterNames = document.querySelectorAll('.character-name')
    characterNames.forEach((nameElement, index) => {
      if (index < characters.length) {
        (nameElement as HTMLElement).textContent = languageManager.getCharacterName(characters[index].name)
      }
    })
  }
}