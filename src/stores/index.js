// 导出所有 Pinia stores
export { useLearningStore } from './learning.js'
export { useProgressStore } from './progress.js'
export { useSettingsStore } from './settings.js'

// SRS 算法相关导出
export {
  srs,
  getDueWords,
  reviewWord,
  getNewWords,
  getSRSStats,
  getDailyProgress,
  calculateUserLevel,
  exportSRSData,
  importSRSData
} from './srs.js'

// 数据源导出
export {
  vocabularyBooks,
  getWordsByLevel,
  getAllWords,
  getWordsByDifficulty
} from '@/data/vocabulary.js'

export {
  sentencePractice,
  getSentencesByLevel,
  getAllSentences,
  getSentencesByDifficulty,
  generateRandomOptions
} from '@/data/sentences.js'