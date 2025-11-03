import type { Word, SRSItem, LearningProgress, Achievement, UserSettings } from '@/types'

/**
 * 数据库配置
 */
const DATABASE_CONFIG = {
  // Neon PostgreSQL连接字符串 (从环境变量获取)
  connectionString: import.meta.env.VITE_DATABASE_URL || '',
  // 本地开发备用配置
  localFallback: {
    host: 'localhost',
    port: 5432,
    database: 'english_learning',
    user: 'postgres',
    password: 'password'
  }
}

/**
 * 数据库连接管理器
 */
export class DatabaseManager {
  private connection: any = null
  private isConnected: boolean = false

  /**
   * 初始化数据库连接
   */
  async connect(): Promise<void> {
    try {
      // 在实际部署中，这里会使用PostgreSQL客户端库
      // 例如: import { Pool } from 'pg'
      // const pool = new Pool({ connectionString: DATABASE_CONFIG.connectionString })
      
      // 现在使用localStorage作为模拟数据库
      console.log('使用localStorage作为模拟数据库')
      this.isConnected = true
      this.initializeLocalStorage()
    } catch (error) {
      console.error('数据库连接失败:', error)
      throw error
    }
  }

  /**
   * 初始化localStorage数据结构
   */
  private initializeLocalStorage(): void {
    if (!localStorage.getItem('words')) {
      localStorage.setItem('words', JSON.stringify(this.getMockWords()))
    }
    if (!localStorage.getItem('srsData')) {
      localStorage.setItem('srsData', JSON.stringify({}))
    }
    if (!localStorage.getItem('progress')) {
      localStorage.setItem('progress', JSON.stringify(this.getMockProgress()))
    }
    if (!localStorage.getItem('achievements')) {
      localStorage.setItem('achievements', JSON.stringify(this.getMockAchievements()))
    }
    if (!localStorage.getItem('settings')) {
      localStorage.setItem('settings', JSON.stringify(this.getMockSettings()))
    }
  }

  /**
   * 获取模拟单词数据
   */
  private getMockWords(): Word[] {
    return [
      { id: 1, word: 'apple', translation: '苹果', pronunciation: '/ˈæpl/', difficulty: 'elementary', definition: '一种常见的水果', example: 'I eat an apple every day.' },
      { id: 2, word: 'book', translation: '书', pronunciation: '/bʊk/', difficulty: 'elementary', definition: '用于阅读的印刷品', example: 'She is reading a book.' },
      { id: 3, word: 'cat', translation: '猫', pronunciation: '/kæt/', difficulty: 'elementary', definition: '一种小型家养宠物', example: 'The cat is sleeping.' },
      { id: 4, word: 'dog', translation: '狗', pronunciation: '/dɔːɡ/', difficulty: 'elementary', definition: '人类忠诚的朋友', example: 'My dog likes to play.' },
      { id: 5, word: 'elephant', translation: '大象', pronunciation: '/ˈelɪfənt/', difficulty: 'elementary', definition: '陆地上最大的动物', example: 'The elephant is huge.' },
      { id: 6, word: 'computer', translation: '计算机', pronunciation: '/kəmˈpjuːtər/', difficulty: 'middle', definition: '电子计算设备', example: 'I use my computer for work.' },
      { id: 7, word: 'knowledge', translation: '知识', pronunciation: '/ˈnɒlɪdʒ/', difficulty: 'middle', definition: '通过学习获得的信息', example: 'Knowledge is power.' },
      { id: 8, word: 'environment', translation: '环境', pronunciation: '/ɪnˈvaɪrənmənt/', difficulty: 'high', definition: '周围的自然条件', example: 'We must protect the environment.' },
      { id: 9, word: 'achievement', translation: '成就', pronunciation: '/əˈtʃiːvmənt/', difficulty: 'high', definition: '通过努力获得的结果', example: 'Graduating was a great achievement.' },
      { id: 10, word: 'entrepreneur', translation: '企业家', pronunciation: '/ˌɒntrəprəˈnɜːr/', difficulty: 'cet4', definition: '创办企业的人', example: 'She became a successful entrepreneur.' }
    ]
  }

  /**
   * 获取模拟进度数据
   */
  private getMockProgress(): LearningProgress {
    return {
      totalWordsStudied: 0,
      totalCorrectAnswers: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      wordsPerLevel: {
        elementary: 0,
        middle: 0,
        high: 0,
        cet4: 0
      }
    }
  }

  /**
   * 获取模拟成就数据
   */
  private getMockAchievements(): Achievement[] {
    return [
      {
        id: 'first_word',
        name: '初学者',
        description: '学习第一个单词',
        icon: '🌱',
        condition: { type: 'words', value: 1 }
      },
      {
        id: 'ten_words',
        name: '词汇新手',
        description: '学习10个单词',
        icon: '📚',
        condition: { type: 'words', value: 10 }
      },
      {
        id: 'week_streak',
        name: '坚持不懈',
        description: '连续学习7天',
        icon: '🔥',
        condition: { type: 'streak', value: 7 }
      },
      {
        id: 'perfect_session',
        name: '完美表现',
        description: '单次学习正确率达到100%',
        icon: '⭐',
        condition: { type: 'accuracy', value: 100 }
      }
    ]
  }

  /**
   * 获取模拟设置数据
   */
  private getMockSettings(): UserSettings {
    return {
      dailyGoal: 10,
      soundEnabled: true,
      notificationsEnabled: true,
      studyLevel: 'elementary',
      theme: 'light',
      language: 'zh'
    }
  }

  /**
   * 获取指定难度的单词
   */
  async getWordsByDifficulty(difficulty: 'elementary' | 'middle' | 'high' | 'cet4'): Promise<Word[]> {
    const words = JSON.parse(localStorage.getItem('words') || '[]')
    return words.filter((word: Word) => word.difficulty === difficulty)
  }

  /**
   * 获取所有单词
   */
  async getAllWords(): Promise<Word[]> {
    return JSON.parse(localStorage.getItem('words') || '[]')
  }

  /**
   * 保存SRS数据
   */
  async saveSRSData(data: Record<number, SRSItem>): Promise<void> {
    localStorage.setItem('srsData', JSON.stringify(data))
  }

  /**
   * 获取SRS数据
   */
  async getSRSData(): Promise<Record<number, SRSItem>> {
    return JSON.parse(localStorage.getItem('srsData') || '{}')
  }

  /**
   * 保存学习进度
   */
  async saveProgress(progress: LearningProgress): Promise<void> {
    localStorage.setItem('progress', JSON.stringify(progress))
  }

  /**
   * 获取学习进度
   */
  async getProgress(): Promise<LearningProgress> {
    return JSON.parse(localStorage.getItem('progress') || '{}')
  }

  /**
   * 保存成就数据
   */
  async saveAchievements(achievements: Achievement[]): Promise<void> {
    localStorage.setItem('achievements', JSON.stringify(achievements))
  }

  /**
   * 获取成就数据
   */
  async getAchievements(): Promise<Achievement[]> {
    return JSON.parse(localStorage.getItem('achievements') || '[]')
  }

  /**
   * 保存用户设置
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  /**
   * 获取用户设置
   */
  async getSettings(): Promise<UserSettings> {
    return JSON.parse(localStorage.getItem('settings') || '{}')
  }

  /**
   * 关闭数据库连接
   */
  async disconnect(): Promise<void> {
    this.isConnected = false
  }
}

// 创建全局数据库实例
export const database = new DatabaseManager()