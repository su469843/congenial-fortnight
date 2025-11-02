import { defineStore } from 'pinia'
import { getSRSStats, getDailyProgress, calculateUserLevel } from '@/stores/srs'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    // 基础统计信息
    stats: {
      totalWords: 0,     // 总学习单词数
      streak: 0,         // 连续学习天数
      level: 1,          // 当前等级
      experience: 0,     // 当前经验值
      accuracy: 0,       // 总体正确率
      masteredWords: 0,  // 已掌握的单词
      learningWords: 0,  // 学习中单词
      newWords: 0        // 新单词
    },

    // 每日目标
    dailyTarget: 20,
    todayProgress: 0,
    remainingWords: 20,

    // 词书进度
    wordBooks: [
      { 
        id: 1, 
        level: 'primary', 
        name: '小学英语词汇', 
        totalWords: 200, 
        learnedWords: 0,
        completed: false 
      },
      { 
        id: 2, 
        level: 'junior', 
        name: '初中英语词汇', 
        totalWords: 150, 
        learnedWords: 0,
        completed: false 
      },
      { 
        id: 3, 
        level: 'senior', 
        name: '高中英语词汇', 
        totalWords: 300, 
        learnedWords: 0,
        completed: false 
      },
      { 
        id: 4, 
        level: 'college', 
        name: '大学英语词汇', 
        totalWords: 500, 
        learnedWords: 0,
        completed: false 
      }
    ],

    // 学习历史（最近7天）
    weeklyStats: {
      days: [],
      studyCounts: [],
      accuracy: []
    },

    // 成就系统
    achievements: [
      { 
        id: 1, 
        icon: '🎯', 
        title: '初学者', 
        description: '学习第一个单词', 
        unlocked: false,
        condition: (stats) => stats.totalWords >= 1
      },
      { 
        id: 2, 
        icon: '🔥', 
        title: '连续7天', 
        description: '连续学习7天', 
        unlocked: false,
        condition: (stats) => stats.streak >= 7
      },
      { 
        id: 3, 
        icon: '📚', 
        title: '百词达人', 
        description: '学习100个单词', 
        unlocked: false,
        condition: (stats) => stats.totalWords >= 100
      },
      { 
        id: 4, 
        icon: '⭐', 
        title: '完美主义者', 
        description: '单日正确率达到95%', 
        unlocked: false,
        condition: (stats) => stats.accuracy >= 95 && stats.totalWords >= 50
      },
      { 
        id: 5, 
        icon: '💪', 
        title: '勤奋学者', 
        description: '单日学习50个单词', 
        unlocked: false,
        condition: (stats) => stats.totalWords >= 50
      },
      { 
        id: 6, 
        icon: '🏆', 
        title: '单词大师', 
        description: '掌握所有小学词汇', 
        unlocked: false,
        condition: (stats, wordBooks) => wordBooks[0].completed
      }
    ],

    // 加载状态
    loading: false,
    
    // 最后更新时间
    lastUpdated: null
  }),

  getters: {
    // 获取进度百分比
    progressPercentage: (state) => {
      const total = state.wordBooks.reduce((sum, book) => sum + book.totalWords, 0)
      const learned = state.wordBooks.reduce((sum, book) => sum + book.learnedWords, 0)
      return total > 0 ? Math.round((learned / total) * 100) : 0
    },

    // 获取今日学习进度百分比
    todayProgressPercentage: (state) => {
      return state.dailyTarget > 0 ? Math.round((state.todayProgress / state.dailyTarget) * 100) : 0
    },

    // 获取当前词书
    currentWordBook: (state) => {
      return state.wordBooks.find(book => !book.completed)
    },

    // 获取解锁的成就
    unlockedAchievements: (state) => {
      return state.achievements.filter(achievement => achievement.unlocked)
    },

    // 获取总体完成情况
    overallCompletion: (state) => {
      const completedBooks = state.wordBooks.filter(book => book.completed).length
      return {
        completed: completedBooks,
        total: state.wordBooks.length,
        percentage: Math.round((completedBooks / state.wordBooks.length) * 100)
      }
    }
  },

  actions: {
    // 从 SRS 系统加载数据
    async loadFromSRS() {
      this.loading = true
      try {
        const srsStats = getSRSStats()
        const levelInfo = calculateUserLevel()
        const dailyProgress = getDailyProgress(false)

        this.stats = {
          ...this.stats,
          ...srsStats,
          level: levelInfo.level,
          experience: levelInfo.totalExp
        }

        // 更新每日进度
        this.todayProgress = dailyProgress
        this.remainingWords = Math.max(0, this.dailyTarget - dailyProgress)

        // 重新计算词书进度
        this.updateWordBookProgress()

        // 更新成就状态
        this.updateAchievements()

        // 更新学习历史
        this.updateWeeklyStats()

        this.lastUpdated = new Date().toISOString()
      } catch (error) {
        console.error('加载SRS数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 更新词书进度
    updateWordBookProgress() {
      // 这里需要从SRS数据中计算每个词书的学习进度
      // 暂时使用模拟数据
      this.wordBooks.forEach(book => {
        // TODO: 根据实际SRS数据更新
        if (book.level === 'primary') {
          book.learnedWords = this.stats.learningWords * 0.8
          book.completed = book.learnedWords >= book.totalWords * 0.9
        } else if (book.level === 'junior') {
          book.learnedWords = this.stats.learningWords * 0.2
          book.completed = false
        } else {
          book.learnedWords = 0
          book.completed = false
        }
      })
    },

    // 更新成就状态
    updateAchievements() {
      this.achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition(this.stats, this.wordBooks)) {
          achievement.unlocked = true
        }
      })
    },

    // 更新每周统计
    updateWeeklyStats() {
      // 生成过去7天的模拟数据
      const today = new Date()
      this.weeklyStats.days = []
      this.weeklyStats.studyCounts = []
      this.weeklyStats.accuracy = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        this.weeklyStats.days.push(date.toLocaleDateString('zh-CN', { weekday: 'short' }))
        
        // 模拟数据
        this.weeklyStats.studyCounts.push(Math.floor(Math.random() * 15) + 5)
        this.weeklyStats.accuracy.push(Math.floor(Math.random() * 30) + 70)
      }
    },

    // 记录学习进度
    recordProgress(count = 1) {
      this.todayProgress += count
      this.remainingWords = Math.max(0, this.dailyTarget - this.todayProgress)
      
      // 更新基础统计
      this.stats.totalWords += count
      this.stats.experience += count * 10 // 每单词10经验值
      
      // 重新计算等级
      const levelInfo = calculateUserLevel()
      this.stats.level = levelInfo.level
      this.stats.experience = levelInfo.totalExp

      // 保存到本地存储
      this.saveToLocalStorage()
    },

    // 增加经验值
    addExperience(exp) {
      this.stats.experience += exp
      
      // 重新计算等级
      const levelInfo = calculateUserLevel()
      this.stats.level = levelInfo.level
      this.stats.experience = levelInfo.totalExp
      
      this.saveToLocalStorage()
    },

    // 更新连续天数
    updateStreak() {
      const today = new Date().toDateString()
      const lastStudyDate = localStorage.getItem('last-study-date')
      
      if (lastStudyDate !== today) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
        
        if (lastStudyDate === yesterday) {
          this.stats.streak += 1
        } else {
          this.stats.streak = 1
        }
        
        localStorage.setItem('last-study-date', today)
        this.saveToLocalStorage()
      }
    },

    // 设置每日目标
    setDailyTarget(target) {
      this.dailyTarget = target
      this.remainingWords = Math.max(0, target - this.todayProgress)
      this.saveToLocalStorage()
    },

    // 重置进度
    resetProgress() {
      this.stats = {
        totalWords: 0,
        streak: 0,
        level: 1,
        experience: 0,
        accuracy: 0,
        masteredWords: 0,
        learningWords: 0,
        newWords: 0
      }
      
      this.todayProgress = 0
      this.remainingWords = this.dailyTarget
      
      this.wordBooks.forEach(book => {
        book.learnedWords = 0
        book.completed = false
      })

      this.achievements.forEach(achievement => {
        achievement.unlocked = false
      })

      localStorage.removeItem('srs-data')
      localStorage.removeItem('progress-store')
      localStorage.removeItem('last-study-date')
    },

    // 保存到本地存储
    saveToLocalStorage() {
      const data = {
        stats: this.stats,
        dailyTarget: this.dailyTarget,
        todayProgress: this.todayProgress,
        wordBooks: this.wordBooks,
        achievements: this.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        lastUpdated: this.lastUpdated
      }
      localStorage.setItem('progress-store', JSON.stringify(data))
    },

    // 从本地存储加载
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('progress-store')
        if (saved) {
          const data = JSON.parse(saved)
          
          this.stats = { ...this.stats, ...data.stats }
          this.dailyTarget = data.dailyTarget
          this.todayProgress = data.todayProgress
          this.remainingWords = Math.max(0, this.dailyTarget - this.todayProgress)
          this.wordBooks = data.wordBooks
          this.lastUpdated = data.lastUpdated

          // 恢复成就状态
          if (data.achievements) {
            const achievementMap = new Map(data.achievements.map(a => [a.id, a.unlocked]))
            this.achievements.forEach(achievement => {
              achievement.unlocked = achievementMap.get(achievement.id) || false
            })
          }
        }
      } catch (error) {
        console.error('加载本地数据失败:', error)
      }
    },

    // 初始化
    async initialize() {
      this.loadFromLocalStorage()
      await this.loadFromSRS()
    }
  }
})