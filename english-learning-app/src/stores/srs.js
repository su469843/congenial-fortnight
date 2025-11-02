// SRS (Spaced Repetition System) - 基于 SM-2 算法的简化版本
// 用于决定单词的复习间隔，提高记忆效率

class SRSAlgorithm {
  constructor() {
    // SRS 状态存储在 localStorage 中
    this.storageKey = 'srs-data'
    this.data = this.loadData()
  }

  // 加载存储的SRS数据
  loadData() {
    const saved = localStorage.getItem(this.storageKey)
    return saved ? JSON.parse(saved) : {
      words: {}, // { wordId: srsData }
      stats: {
        totalReviews: 0,
        correctAnswers: 0,
        lastStudyDate: null,
        streak: 0,
        lastReviewDate: null
      }
    }
  }

  // 保存数据到localStorage
  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data))
  }

  // 获取或初始化单词的SRS数据
  getWordData(wordId) {
    if (!this.data.words[wordId]) {
      this.data.words[wordId] = {
        wordId: wordId,
        ease: 2.5, // 容易度因子 (EF)
        interval: 0, // 复习间隔天数
        repetitions: 0, // 连续正确次数
        nextReview: null, // 下次复习时间 (timestamp)
        lastReview: null, // 上次复习时间 (timestamp)
        correctCount: 0, // 正确次数
        incorrectCount: 0, // 错误次数
        totalReviews: 0, // 总复习次数
        created: Date.now()
      }
    }
    return this.data.words[wordId]
  }

  // 处理答案并更新SRS数据
  review(wordId, quality) {
    // quality: 0-5 评分 (0=完全不记得, 5=完美记住)
    const wordData = this.getWordData(wordId)
    const now = Date.now()
    
    // 质量评估
    if (quality < 3) {
      // 错误，重新开始
      wordData.repetitions = 0
      wordData.interval = 1
      wordData.incorrectCount++
    } else {
      // 正确
      wordData.repetitions++
      wordData.correctCount++
      
      if (wordData.repetitions === 1) {
        wordData.interval = 1
      } else if (wordData.repetitions === 2) {
        wordData.interval = 6
      } else {
        wordData.interval = Math.round(wordData.interval * wordData.ease)
        wordData.interval = Math.max(1, wordData.interval) // 确保至少1天
      }
    }

    // 更新容易度因子 (EF)
    wordData.ease = Math.max(1.3, wordData.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

    // 设置下次复习时间
    wordData.nextReview = now + (wordData.interval * 24 * 60 * 60 * 1000)
    wordData.lastReview = now
    wordData.totalReviews++

    // 更新统计数据
    this.updateStats(quality >= 3)

    // 保存数据
    this.saveData()

    return {
      interval: wordData.interval,
      ease: wordData.ease,
      repetitions: wordData.repetitions,
      nextReview: wordData.nextReview,
      quality: quality
    }
  }

  // 获取需要复习的单词
  getDueWords() {
    const now = Date.now()
    const dueWords = []
    
    for (const [wordId, wordData] of Object.entries(this.data.words)) {
      if (!wordData.nextReview || wordData.nextReview <= now) {
        dueWords.push(wordData)
      }
    }
    
    // 按紧急程度排序（最久未复习的在前）
    return dueWords.sort((a, b) => {
      if (!a.nextReview) return -1
      if (!b.nextReview) return 1
      return a.nextReview - b.nextReview
    })
  }

  // 获取新学习的单词
  getNewWords(count = 10, difficulty = 'all') {
    // 这里可以根据难度筛选单词
    // 暂时返回空数组，实际实现中会从词汇数据库获取
    return []
  }

  // 更新学习统计
  updateStats(isCorrect) {
    const today = new Date().toDateString()
    const lastStudyDate = this.data.stats.lastStudyDate
    
    if (lastStudyDate !== today) {
      if (lastStudyDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
        // 连续学习
        this.data.stats.streak++
      } else if (lastStudyDate) {
        // 中断了连续
        this.data.stats.streak = 1
      } else {
        // 第一次学习
        this.data.stats.streak = 1
      }
      this.data.stats.lastStudyDate = today
    }

    this.data.stats.totalReviews++
    if (isCorrect) {
      this.data.stats.correctAnswers++
    }
    this.data.stats.lastReviewDate = now
  }

  // 获取学习统计
  getStats() {
    const accuracy = this.data.stats.totalReviews > 0 
      ? Math.round((this.data.stats.correctAnswers / this.data.stats.totalReviews) * 100)
      : 0

    return {
      ...this.data.stats,
      accuracy: accuracy,
      totalWords: Object.keys(this.data.words).length,
      masteredWords: Object.values(this.data.words).filter(w => w.repetitions >= 5).length,
      learningWords: Object.values(this.data.words).filter(w => w.repetitions > 0 && w.repetitions < 5).length,
      newWords: Object.values(this.data.words).filter(w => w.repetitions === 0).length
    }
  }

  // 获取今日学习目标
  getDailyTarget(remaining = true) {
    const today = new Date().toDateString()
    const target = JSON.parse(localStorage.getItem('daily-target')) || 20
    const todayProgress = JSON.parse(localStorage.getItem('today-progress')) || { completed: 0 }
    
    if (remaining) {
      return Math.max(0, target - todayProgress.completed)
    } else {
      return todayProgress.completed
    }
  }

  // 记录今日完成的学习
  recordProgress(count = 1) {
    const today = new Date().toDateString()
    const progress = JSON.parse(localStorage.getItem('today-progress')) || { date: today, completed: 0 }
    
    if (progress.date !== today) {
      progress.date = today
      progress.completed = 0
    }
    
    progress.completed += count
    localStorage.setItem('today-progress', JSON.stringify(progress))
  }

  // 计算等级和经验值
  calculateLevel() {
    const stats = this.getStats()
    const totalReviews = stats.totalReviews
    const accuracy = stats.accuracy
    
    // 基于总复习次数和正确率计算等级
    const baseExp = totalReviews * 10
    const bonusExp = Math.floor(totalReviews * accuracy / 100 * 5)
    const totalExp = baseExp + bonusExp
    
    // 每1000经验值升一级
    const level = Math.floor(totalExp / 1000) + 1
    const currentLevelExp = totalExp % 1000
    const nextLevelExp = 1000 - currentLevelExp
    
    return {
      level: level,
      currentExp: currentLevelExp,
      nextExp: nextLevelExp,
      totalExp: totalExp
    }
  }

  // 重置所有数据
  reset() {
    this.data = {
      words: {},
      stats: {
        totalReviews: 0,
        correctAnswers: 0,
        lastStudyDate: null,
        streak: 0,
        lastReviewDate: null
      }
    }
    this.saveData()
  }

  // 导出数据
  exportData() {
    return {
      srsData: this.data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  // 导入数据
  importData(data) {
    if (data.srsData && data.version) {
      this.data = data.srsData
      this.saveData()
      return true
    }
    return false
  }
}

// 创建全局SRS实例
export const srs = new SRSAlgorithm()

// 便捷函数
export const getDueWords = () => srs.getDueWords()
export const reviewWord = (wordId, quality) => srs.review(wordId, quality)
export const getNewWords = (count, difficulty) => srs.getNewWords(count, difficulty)
export const getSRSStats = () => srs.getStats()
export const getDailyProgress = () => srs.getDailyTarget()
export const recordTodayProgress = (count) => srs.recordProgress(count)
export const calculateUserLevel = () => srs.calculateLevel()
export const exportSRSData = () => srs.exportData()
export const importSRSData = (data) => srs.importData(data)