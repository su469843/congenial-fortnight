<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 顶部导航 -->
      <header class="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div class="flex justify-between items-center">
          <button
            @click="goBack"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="flex items-center space-x-6">
            <div class="text-center">
              <p class="text-sm text-gray-500">进度</p>
              <p class="font-semibold">{{ learningStore.currentSession.wordsStudied }}/{{ learningStore.studyQueue.length + learningStore.currentSession.wordsStudied }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500">正确率</p>
              <p class="font-semibold text-green-500">{{ learningStore.sessionAccuracy }}%</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500">连续</p>
              <p class="font-semibold text-orange-500">{{ userStore.user.streak }}天</p>
            </div>
          </div>
        </div>
      </header>

      <!-- 学习模式选择 -->
      <div v-if="!currentWord && learningStore.studyQueue.length > 0" class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">选择学习模式</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="mode in practiceModes"
            :key="mode.value"
            @click="selectMode(mode.value)"
            class="p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
            :class="mode.color"
          >
            <div class="text-3xl mb-2">{{ mode.icon }}</div>
            <div class="font-semibold">{{ mode.name }}</div>
            <div class="text-sm opacity-75">{{ mode.description }}</div>
          </button>
        </div>
      </div>

      <!-- 单词学习卡片 -->
      <div v-if="currentWord" class="bg-white rounded-2xl shadow-lg p-8">
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- 单词卡片内容 -->
        <div class="text-center mb-8">
          <div v-if="showAnswer" class="space-y-4">
            <h1 class="text-5xl font-bold text-gray-800">{{ currentWord.word }}</h1>
            <p class="text-2xl text-gray-600">{{ currentWord.pronunciation }}</p>
            <p class="text-3xl text-blue-600 font-semibold">{{ currentWord.translation }}</p>
            <p v-if="currentWord.definition" class="text-gray-700">{{ currentWord.definition }}</p>
            <p v-if="currentWord.example" class="text-gray-600 italic">"{{ currentWord.example }}"</p>
          </div>
          <div v-else class="space-y-4">
            <h1 class="text-5xl font-bold text-gray-800">{{ currentWord.word }}</h1>
            <p class="text-2xl text-gray-600">{{ currentWord.pronunciation }}</p>
            <button
              @click="showAnswer = true"
              class="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold"
            >
              显示答案
            </button>
          </div>
        </div>

        <!-- 练习模式内容 -->
        <div v-if="showAnswer && currentMode !== 'flashcard'" class="mb-8">
          <FlashcardPractice
            v-if="currentMode === 'flashcard'"
            :word="currentWord"
            @answer="handleAnswer"
          />
          <SpellingPractice
            v-else-if="currentMode === 'spelling'"
            :word="currentWord"
            @answer="handleAnswer"
          />
          <MultipleChoicePractice
            v-else
            :word="currentWord"
            :question-type="currentMode"
            @answer="handleAnswer"
          />
        </div>

        <!-- 难度评价按钮 -->
        <div v-if="showAnswer" class="flex justify-center space-x-4">
          <button
            v-for="difficulty in difficulties"
            :key="difficulty.value"
            @click="rateWord(difficulty.value)"
            class="px-6 py-3 rounded-full transition-all duration-200 font-semibold"
            :class="difficulty.color"
          >
            {{ difficulty.label }}
          </button>
        </div>
      </div>

      <!-- 学习完成 -->
      <div v-if="learningStore.studyQueue.length === 0 && learningStore.currentSession.wordsStudied > 0" class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">学习完成!</h2>
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div>
            <p class="text-3xl font-bold text-blue-500">{{ learningStore.currentSession.wordsStudied }}</p>
            <p class="text-gray-600">学习单词</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-green-500">{{ learningStore.sessionAccuracy }}%</p>
            <p class="text-gray-600">正确率</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-purple-500">{{ formatTime(learningStore.sessionDuration) }}</p>
            <p class="text-gray-600">学习时长</p>
          </div>
        </div>
        <button
          @click="goBack"
          class="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useUserStore } from '@/stores/user'
import { SM2Algorithm } from '@/utils/srs'
import { database } from '@/utils/database'
import FlashcardPractice from '@/components/learning/FlashcardPractice.vue'
import SpellingPractice from '@/components/learning/SpellingPractice.vue'
import MultipleChoicePractice from '@/components/learning/MultipleChoicePractice.vue'
import type { Word, PracticeMode } from '@/types'

const router = useRouter()
const learningStore = useLearningStore()
const userStore = useUserStore()

const currentWord = computed(() => learningStore.currentWord)
const showAnswer = ref(false)
const currentMode = ref<PracticeMode>('flashcard')

// 练习模式配置
const practiceModes = [
  { value: 'flashcard', name: '单词卡片', icon: '📇', description: '看单词回忆意思', color: 'bg-blue-100 border-blue-300' },
  { value: 'spelling', name: '拼写练习', icon: '✏️', description: '看意思拼写单词', color: 'bg-green-100 border-green-300' },
  { value: 'listening', name: '听力练习', icon: '🎧', description: '听音选词', color: 'bg-purple-100 border-purple-300' },
  { value: 'fillblank', name: '填空练习', icon: '📝', description: '补全单词', color: 'bg-orange-100 border-orange-300' },
  { value: 'sentence', name: '句子练习', icon: '💬', description: '单词造句', color: 'bg-red-100 border-red-300' },
  { value: 'translation', name: '翻译练习', icon: '🌐', description: '中英互译', color: 'bg-indigo-100 border-indigo-300' }
]

// 难度评价
const difficulties = [
  { value: 1, label: '忘记了', color: 'bg-red-500 text-white hover:bg-red-600' },
  { value: 2, label: '困难', color: 'bg-orange-500 text-white hover:bg-orange-600' },
  { value: 3, label: '一般', color: 'bg-yellow-500 text-white hover:bg-yellow-600' },
  { value: 4, label: '良好', color: 'bg-blue-500 text-white hover:bg-blue-600' },
  { value: 5, label: '简单', color: 'bg-green-500 text-white hover:bg-green-600' }
]

// 进度百分比
const progressPercentage = computed(() => {
  const total = learningStore.currentSession.wordsStudied + learningStore.studyQueue.length
  if (total === 0) return 0
  return (learningStore.currentSession.wordsStudied / total) * 100
})

// 格式化时间
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}分钟`
}

// 选择练习模式
const selectMode = (mode: PracticeMode) => {
  currentMode.value = mode
  learningStore.setPracticeMode(mode)
  nextWord()
}

// 获取练习组件
const getPracticeComponent = () => {
  switch (currentMode.value) {
    case 'flashcard':
      return 'FlashcardPractice'
    case 'spelling':
      return 'SpellingPractice'
    case 'listening':
    case 'fillblank':
    case 'sentence':
    case 'translation':
      return 'MultipleChoicePractice'
    default:
      return 'FlashcardPractice'
  }
}

// 处理答案
const handleAnswer = (isCorrect: boolean) => {
  const quality = isCorrect ? 4 : 1
  rateWord(quality)
}

// 评价单词难度
const rateWord = async (quality: number) => {
  if (!currentWord.value) return

  // 更新SRS数据
  const srsData = await database.getSRSData()
  const currentItem = srsData[currentWord.value.id] || SM2Algorithm.createNewItem(currentWord.value.id)
  const updatedItem = SM2Algorithm.calculateNextReview(currentItem, quality)
  srsData[currentWord.value.id] = updatedItem
  await database.saveSRSData(srsData)

  // 更新学习进度
  if (SM2Algorithm.isCorrectAnswer(quality)) {
    learningStore.markWordCorrect(currentWord.value.id)
    userStore.addExperience(SM2Algorithm.getExperienceGain(quality))
    userStore.incrementWordsLearned()
  } else {
    learningStore.markWordIncorrect(currentWord.value.id)
  }

  // 进入下一个单词
  nextWord()
}

// 下一个单词
const nextWord = () => {
  showAnswer.value = false
  const word = learningStore.nextWord()
  if (!word) {
    // 学习完成
    learningStore.endSession()
  }
}

// 返回上一页
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  if (!currentWord.value && learningStore.studyQueue.length > 0) {
    nextWord()
  }
})
</script>