import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  vocabularyBooks, 
  getWordsByLevel, 
  getAllWords,
  getWordsByDifficulty 
} from '@/data/vocabulary'
import { 
  sentencePractice, 
  getSentencesByLevel, 
  getAllSentences 
} from '@/data/sentences'
import { 
  srs, 
  getDueWords, 
  reviewWord, 
  getNewWords,
  getSRSStats,
  calculateUserLevel 
} from '@/stores/srs'

export const useLearningStore = defineStore('learning', () => {
  // 状态
  const currentUser = ref({
    id: 'user-1',
    name: '学习者',
    settings: {
      dailyTarget: 20,
      reviewStrategy: 'balanced', // 'all', 'mistakes', 'balanced'
      difficulty: 'medium', // 'easy', 'medium', 'hard'
      ttsEnabled: true,
      ttsSpeed: 1.0,
      language: 'zh',
      selectedBooks: [1, 2], // 默认选择小学和初中
      reminderEnabled: false,
      reminderTime: '19:00'
    }
  })

  const currentExercise = ref(null)
  const practiceType = ref('words') // 'words' | 'sentences'
  const exerciseQueue = ref([])
  const currentIndex = ref(0)
  const isLoading = ref(false)

  // 计算属性
  const availableBooks = computed(() => {
    return Object.values(vocabularyBooks).map(book => ({
      id: book.id,
      name: book.name,
      level: book.level,
      description: book.description,
      wordCount: book.totalWords,
      words: book.words
    }))
  })

  const availableSentences = computed(() => {
    return Object.values(sentencePractice).map(sentenceSet => ({
      id: sentenceSet.id,
      name: sentenceSet.name,
      level: sentenceSet.level,
      description: sentenceSet.description,
      sentences: sentenceSet.sentences
    }))
  })

  const todayProgress = computed(() => {
    const progress = JSON.parse(localStorage.getItem('today-progress')) || { completed: 0 }
    const today = new Date().toDateString()
    
    if (progress.date !== today) {
      return 0
    }
    
    return progress.completed
  })

  const remainingWords = computed(() => {
    return Math.max(0, currentUser.value.settings.dailyTarget - todayProgress.value)
  })

  const userStats = computed(() => {
    const srsStats = getSRSStats()
    const levelInfo = calculateUserLevel()
    
    return {
      ...srsStats,
      level: levelInfo.level,
      currentExp: levelInfo.currentExp,
      nextExp: levelInfo.nextExp,
      totalExp: levelInfo.totalExp,
      todayProgress: todayProgress.value,
      dailyTarget: currentUser.value.settings.dailyTarget
    }
  })

  // 方法
  function updateSettings(newSettings) {
    currentUser.value.settings = { ...currentUser.value.settings, ...newSettings }
    localStorage.setItem('user-settings', JSON.stringify(currentUser.value.settings))
  }

  function loadSettings() {
    const saved = localStorage.getItem('user-settings')
    if (saved) {
      currentUser.value.settings = { ...currentUser.value.settings, ...JSON.parse(saved) }
    }
  }

  function generateWordExercises(count = 10) {
    const selectedBooks = currentUser.value.settings.selectedBooks
    const difficulty = currentUser.value.settings.difficulty
    const allWords = []

    // 获取选择的词书的单词
    selectedBooks.forEach(bookId => {
      const book = vocabularyBooks[getBookLevelById(bookId)]
      if (book) {
        let words = [...book.words]
        
        // 根据难度筛选
        if (difficulty === 'easy') {
          words = words.filter(w => w.difficulty <= 2)
        } else if (difficulty === 'medium') {
          words = words.filter(w => w.difficulty >= 2 && w.difficulty <= 4)
        } else if (difficulty === 'hard') {
          words = words.filter(w => w.difficulty >= 4)
        }

        // 排除已学单词
        const srsData = srs.data.words
        words = words.filter(w => !srsData[w.id])

        allWords.push(...words)
      }
    })

    // 随机选择单词
    const shuffled = allWords.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map(word => {
      // 生成选项
      const options = generateWordOptions(word, allWords)
      return {
        ...word,
        options: options
      }
    })
  }

  function generateSentenceExercises(count = 5) {
    const allSentences = getAllSentences()
    const shuffled = allSentences.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  function generateWordOptions(correctWord, allWords) {
    const options = [correctWord.word]
    const otherWords = allWords
      .filter(w => w.id !== correctWord.id)
      .map(w => w.meaning)
    
    // 随机选择3个错误选项
    while (options.length < 4 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length)
      const option = otherWords.splice(randomIndex, 1)[0]
      if (!options.includes(option)) {
        options.push(option)
      }
    }

    return options.sort(() => Math.random() - 0.5)
  }

  function startPractice(type) {
    practiceType.value = type
    isLoading.value = true

    try {
      let exercises = []
      
      if (type === 'words') {
        // 获取新单词和需要复习的单词
        const dueWords = getDueWords()
        const newWords = generateWordExercises(Math.min(remainingWords.value, 10))
        
        // 组合练习队列：优先复习，再学新词
        exercises = [...dueWords.slice(0, 5), ...newWords.slice(0, 5)]
      } else {
        exercises = generateSentenceExercises(5)
      }

      exerciseQueue.value = exercises
      currentIndex.value = 0
      currentExercise.value = exercises[0] || null
    } finally {
      isLoading.value = false
    }
  }

  function nextExercise() {
    if (currentIndex.value < exerciseQueue.value.length - 1) {
      currentIndex.value++
      currentExercise.value = exerciseQueue.value[currentIndex.value]
    } else {
      // 练习结束
      endPractice()
    }
  }

  function previousExercise() {
    if (currentIndex.value > 0) {
      currentIndex.value--
      currentExercise.value = exerciseQueue.value[currentIndex.value]
    }
  }

  function endPractice() {
    currentExercise.value = null
    currentIndex.value = 0
    exerciseQueue.value = []
    practiceType.value = 'words'
  }

  function handleAnswer(answerData) {
    if (practiceType.value === 'words' && answerData.word) {
      // 更新SRS状态
      const quality = answerData.correct ? 4 : 2
      const wordId = exerciseQueue.value[currentIndex.value].id
      
      reviewWord(wordId, quality)
      
      // 记录今日进度
      if (answerData.correct) {
        const progress = JSON.parse(localStorage.getItem('today-progress')) || { 
          date: new Date().toDateString(), 
          completed: 0 
        }
        
        const today = new Date().toDateString()
        if (progress.date !== today) {
          progress.date = today
          progress.completed = 0
        }
        
        progress.completed++
        localStorage.setItem('today-progress', JSON.stringify(progress))
      }
    }
  }

  function getBookLevelById(id) {
    const levelMap = {
      1: 'primary',
      2: 'junior', 
      3: 'senior',
      4: 'college'
    }
    return levelMap[id] || 'primary'
  }

  // 根据难度获取可练习的单词
  function getExercisableWords(wordIds) {
    const difficultyRange = getDifficultyRange()
    return wordIds.map(id => {
      const word = getWordById(id)
      if (word && word.difficulty >= difficultyRange.min && word.difficulty <= difficultyRange.max) {
        return word
      }
      return null
    }).filter(Boolean)
  }

  function getDifficultyRange() {
    const difficulty = currentUser.value.settings.difficulty
    switch (difficulty) {
      case 'easy':
        return { min: 1, max: 2 }
      case 'medium':
        return { min: 2, max: 4 }
      case 'hard':
        return { min: 4, max: 5 }
      default:
        return { min: 1, max: 5 }
    }
  }

  function exportData() {
    return {
      userSettings: currentUser.value.settings,
      srsData: srs.exportData(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  function importData(data) {
    if (data.userSettings) {
      updateSettings(data.userSettings)
    }
    
    if (data.srsData) {
      srs.importData(data.srsData)
    }
  }

  function resetProgress() {
    srs.reset()
    localStorage.removeItem('today-progress')
    localStorage.removeItem('learning-progress')
  }

  function getWordBookProgress() {
    const progress = []
    availableBooks.value.forEach(book => {
      const learnedWords = Object.keys(srs.data.words).filter(wordId => {
        const word = book.words.find(w => w.id === parseInt(wordId))
        return word
      }).length
      
      progress.push({
        id: book.id,
        name: book.name,
        learned: learnedWords,
        total: book.wordCount
      })
    })
    
    return progress
  }

  function getWeeklyStats() {
    // 这里可以计算本周的统计数据
    // 暂时返回模拟数据
    return {
      newWords: 25,
      reviews: 80,
      accuracy: userStats.value.accuracy,
      studyTime: 120
    }
  }

  // 初始化
  function initialize() {
    loadSettings()
  }

  return {
    // 状态
    currentUser,
    currentExercise,
    practiceType,
    exerciseQueue,
    currentIndex,
    isLoading,

    // 计算属性
    availableBooks,
    availableSentences,
    todayProgress,
    remainingWords,
    userStats,

    // 方法
    updateSettings,
    loadSettings,
    startPractice,
    nextExercise,
    previousExercise,
    endPractice,
    handleAnswer,
    generateWordExercises,
    generateSentenceExercises,
    exportData,
    importData,
    resetProgress,
    getWordBookProgress,
    getWeeklyStats,
    initialize
  }
})