import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Word, StudySession, PracticeMode } from '@/types'

export const useLearningStore = defineStore('learning', () => {
  const currentWord = ref<Word | null>(null)
  const currentSession = ref<StudySession>({
    wordsStudied: 0,
    correctAnswers: 0,
    startTime: null,
    endTime: null
  })
  const studyQueue = ref<Word[]>([])
  const completedWords = ref<number[]>([])
  const currentLevel = ref<'elementary' | 'middle' | 'high' | 'cet4'>('elementary')
  const currentMode = ref<PracticeMode>('flashcard')

  const sessionAccuracy = computed(() => {
    if (currentSession.value.wordsStudied === 0) return 0
    return Math.round((currentSession.value.correctAnswers / currentSession.value.wordsStudied) * 100)
  })

  const sessionDuration = computed(() => {
    if (!currentSession.value.startTime) return 0
    const end = currentSession.value.endTime || new Date()
    return Math.round((end - currentSession.value.startTime) / 1000)
  })

  const startSession = () => {
    currentSession.value = {
      wordsStudied: 0,
      correctAnswers: 0,
      startTime: new Date(),
      endTime: null
    }
  }

  const endSession = () => {
    currentSession.value.endTime = new Date()
  }

  const nextWord = () => {
    if (studyQueue.value.length > 0) {
      currentWord.value = studyQueue.value.shift()
      return currentWord.value
    }
    return null
  }

  const markWordCorrect = (wordId: number) => {
    currentSession.value.correctAnswers++
    currentSession.value.wordsStudied++
    completedWords.value.push(wordId)
  }

  const markWordIncorrect = (wordId: number) => {
    currentSession.value.wordsStudied++
    // 将错误单词重新加入队列末尾
    const word = studyQueue.value.find(w => w.id === wordId)
    if (word) {
      studyQueue.value.push(word)
    }
  }

  const setStudyLevel = (level: 'elementary' | 'middle' | 'high' | 'cet4') => {
    currentLevel.value = level
  }

  const setPracticeMode = (mode: PracticeMode) => {
    currentMode.value = mode
  }

  const loadWordsForLevel = async (level: 'elementary' | 'middle' | 'high' | 'cet4') => {
    // 这里将来会从API加载单词
    // 现在使用模拟数据
    const mockWords: Word[] = [
      { id: 1, word: 'apple', translation: '苹果', pronunciation: '/ˈæpl/', audio: '', difficulty: level },
      { id: 2, word: 'book', translation: '书', pronunciation: '/bʊk/', audio: '', difficulty: level },
      { id: 3, word: 'cat', translation: '猫', pronunciation: '/kæt/', audio: '', difficulty: level },
      { id: 4, word: 'dog', translation: '狗', pronunciation: '/dɔːɡ/', audio: '', difficulty: level },
      { id: 5, word: 'elephant', translation: '大象', pronunciation: '/ˈelɪfənt/', audio: '', difficulty: level }
    ]
    studyQueue.value = [...mockWords]
  }

  return {
    currentWord,
    currentSession,
    studyQueue,
    completedWords,
    currentLevel,
    currentMode,
    sessionAccuracy,
    sessionDuration,
    startSession,
    endSession,
    nextWord,
    markWordCorrect,
    markWordIncorrect,
    setStudyLevel,
    setPracticeMode,
    loadWordsForLevel
  }
})