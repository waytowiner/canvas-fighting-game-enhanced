export type Language = 'zh' | 'en'

export interface Translations {
  // Start Screen
  gameTitle: string
  selectGameMode: string
  pvpMode: string
  pveMode: string
  selectAIDifficulty: string
  easyDifficulty: string
  expertDifficulty: string
  masterDifficulty: string
  easyDescription: string
  expertDescription: string
  masterDescription: string
  selectCharacter: string
  player1: string
  player2: string
  aiOpponent: string
  startGame: string
  
  // Character Names
  samuraiKenji: string
  samuraiMack: string
  wizardAlatar: string
  wizardAlbus: string
  
  // Game UI
  round: string
  roundTie: string
  player1RoundWin: string
  player2RoundWin: string
  playerFinalWin: string
  enemyFinalWin: string
  victory: string
  defeat: string
  draw: string
  finalVictory: string
  finalDefeat: string
  backToStart: string
  
  // Language Switch
  language: string
  chinese: string
  english: string
}

const translations: Record<Language, Translations> = {
  zh: {
    // Start Screen
    gameTitle: '格斗游戏',
    selectGameMode: '选择游戏模式',
    pvpMode: 'PVP (玩家对战)',
    pveMode: 'PVE (人机对战)',
    selectAIDifficulty: '选择AI难度',
    easyDifficulty: '爽玩 (简单)',
    expertDifficulty: '专家 (中等)',
    masterDifficulty: '大师 (困难)',
    easyDescription: '缓慢移动，低频攻击，几乎不防御',
    expertDescription: '会攻击和防御，攻击频率较高',
    masterDescription: '疯狂攻击，防御严密，会佯攻',
    selectCharacter: '选择你的角色',
    player1: '玩家 1',
    player2: '玩家 2',
    aiOpponent: 'AI 对手',
    startGame: '开始游戏',
    
    // Character Names
    samuraiKenji: '武士 剑二',
    samuraiMack: '武士 麦克',
    wizardAlatar: '法师 阿拉塔',
    wizardAlbus: '法师 阿尔布斯',
    
    // Game UI
    round: '第 {0} 局',
    roundTie: '本局平局！',
    player1RoundWin: 'Player 1 本局获胜！',
    player2RoundWin: 'Player 2 本局获胜！',
    playerFinalWin: '玩家总胜利！',
    enemyFinalWin: '敌人总胜利！',
    victory: '胜利！',
    defeat: '失败！',
    draw: '平局！',
    finalVictory: '最终胜利！',
    finalDefeat: '最终失败！',
    backToStart: '返回开始画面',
    
    // Language Switch
    language: '语言',
    chinese: '中文',
    english: 'English'
  },
  en: {
    // Start Screen
    gameTitle: 'Fighting Game',
    selectGameMode: 'Select Game Mode',
    pvpMode: 'PVP (Player vs Player)',
    pveMode: 'PVE (Player vs AI)',
    selectAIDifficulty: 'Select AI Difficulty',
    easyDifficulty: 'Easy',
    expertDifficulty: 'Expert',
    masterDifficulty: 'Master',
    easyDescription: 'Slow movement, low attack frequency, rarely defends',
    expertDescription: 'Attacks and defends, higher attack frequency',
    masterDescription: 'Aggressive attacks, tight defense, uses feints',
    selectCharacter: 'Choose Your Character',
    player1: 'Player 1',
    player2: 'Player 2',
    aiOpponent: 'AI Opponent',
    startGame: 'Start Game',
    
    // Character Names
    samuraiKenji: 'Samurai Kenji',
    samuraiMack: 'Samurai Mack',
    wizardAlatar: 'Wizard Alatar',
    wizardAlbus: 'Wizard Albus',
    
    // Game UI
    round: 'Round {0}',
    roundTie: 'Round Tie!',
    player1RoundWin: 'Player 1 Round Win!',
    player2RoundWin: 'Player 2 Round Win!',
    playerFinalWin: 'Player Victory!',
    enemyFinalWin: 'Enemy Victory!',
    victory: 'Victory!',
    defeat: 'Defeat!',
    draw: 'Draw!',
    finalVictory: 'Final Victory!',
    finalDefeat: 'Final Defeat!',
    backToStart: 'Back to Start',
    
    // Language Switch
    language: 'Language',
    chinese: '中文',
    english: 'English'
  }
}

export class LanguageManager {
  private static instance: LanguageManager
  private currentLanguage: Language = 'zh'
  private listeners: Array<() => void> = []

  private constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('gameLanguage') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      this.currentLanguage = savedLanguage
    }
  }

  static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager()
    }
    return LanguageManager.instance
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage
  }

  setLanguage(language: Language): void {
    if (this.currentLanguage !== language) {
      this.currentLanguage = language
      localStorage.setItem('gameLanguage', language)
      this.notifyListeners()
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLanguage === 'zh' ? 'en' : 'zh')
  }

  getText(key: keyof Translations, ...args: string[]): string {
    let text = translations[this.currentLanguage][key]
    // 替换占位符 {0}, {1}, {2} 等
    args.forEach((arg, index) => {
      text = text.replace(`{${index}}`, arg)
    })
    return text
  }

  getCharacterName(characterKey: string): string {
    switch (characterKey) {
      case 'samurai-kenji':
        return this.getText('samuraiKenji')
      case 'samurai-mack':
        return this.getText('samuraiMack')
      case 'wizard-alatar':
        return this.getText('wizardAlatar')
      case 'wizard-albus':
        return this.getText('wizardAlbus')
      default:
        return characterKey
    }
  }

  addLanguageChangeListener(listener: () => void): void {
    this.listeners.push(listener)
  }

  removeLanguageChangeListener(listener: () => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }
}

export default LanguageManager.getInstance()