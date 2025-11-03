// 单词类型定义
export interface Word {
  id: number
  word: string
  translation: string
  pronunciation: string
  audio?: string
  definition?: string
  example?: string
  difficulty: 'elementary' | 'middle' | 'high' | 'cet4'
  tags?: string[]
}

// 学习会话类型
export interface StudySession {
  wordsStudied: number
  correctAnswers: number
  startTime: Date | null
  endTime: Date | null
}

// SRS算法相关类型
export interface SRSItem {
  id: number
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
  lastReviewDate?: Date
}

// 学习进度类型
export interface LearningProgress {
  totalWordsStudied: number
  totalCorrectAnswers: number
  totalTimeSpent: number
  currentStreak: number
  longestStreak: number
  wordsPerLevel: {
    elementary: number
    middle: number
    high: number
    cet4: number
  }
}

// 成就类型
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  condition: {
    type: 'words' | 'streak' | 'accuracy' | 'time'
    value: number
  }
}

// 用户设置类型
export interface UserSettings {
  dailyGoal: number
  soundEnabled: boolean
  notificationsEnabled: boolean
  studyLevel: 'elementary' | 'middle' | 'high' | 'cet4'
  theme: 'light' | 'dark' | 'auto'
  language: 'zh' | 'en'
}

// 练习模式类型
export type PracticeMode = 'flashcard' | 'spelling' | 'listening' | 'fillblank' | 'sentence' | 'translation'

// 练习题目类型
export interface PracticeQuestion {
  id: number
  type: PracticeMode
  word: Word
  options?: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
  timeSpent?: number
}