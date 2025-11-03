<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- 顶部导航 -->
      <header class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">英语学习应用</h1>
            <p class="text-gray-600 mt-1">让学习变得有趣高效</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-center">
              <p class="text-sm text-gray-500">连续学习</p>
              <p class="text-2xl font-bold text-orange-500">{{ userStore.user.streak }}天</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500">等级</p>
              <p class="text-2xl font-bold text-purple-500">{{ userStore.user.level }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500">经验值</p>
              <p class="text-2xl font-bold text-green-500">{{ userStore.user.experience }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- 主要内容区 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 学习卡片 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 快速开始 -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">开始学习</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                v-for="level in studyLevels"
                :key="level.value"
                @click="startLearning(level.value)"
                class="p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                :class="[
                  level.color,
                  learningStore.currentLevel === level.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                ]"
              >
                <div class="text-3xl mb-2">{{ level.icon }}</div>
                <div class="font-semibold">{{ level.name }}</div>
                <div class="text-sm opacity-75">{{ level.words }}个单词</div>
              </button>
            </div>
          </div>

          <!-- 今日进度 -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">今日进度</h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600">每日目标</span>
                  <span class="font-semibold">{{ todayProgress }}/10个单词</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                    :style="{ width: `${(todayProgress / 10) * 100}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4 pt-4">
                <div class="text-center">
                  <p class="text-3xl font-bold text-blue-500">{{ learningStore.currentSession.wordsStudied }}</p>
                  <p class="text-sm text-gray-600">已学习</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-green-500">{{ learningStore.sessionAccuracy }}%</p>
                  <p class="text-sm text-gray-600">正确率</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-purple-500">{{ formatTime(learningStore.sessionDuration) }}</p>
                  <p class="text-sm text-gray-600">学习时长</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="space-y-6">
          <!-- 成就展示 -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">最近成就</h2>
            <div class="space-y-3">
              <div
                v-for="achievement in recentAchievements"
                :key="achievement.id"
                class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
              >
                <div class="text-2xl">{{ achievement.icon }}</div>
                <div class="flex-1">
                  <p class="font-semibold text-sm">{{ achievement.name }}</p>
                  <p class="text-xs text-gray-600">{{ achievement.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速统计 -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">学习统计</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">总学单词</span>
                <span class="font-semibold">{{ userStore.user.totalWordsLearned }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">最长连续</span>
                <span class="font-semibold">{{ userStore.user.streak }}天</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">等级进度</span>
                <span class="font-semibold">{{ Math.round(userStore.levelProgress) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useUserStore } from '@/stores/user'
import { database } from '@/utils/database'
import type { Achievement } from '@/types'

const router = useRouter()
const learningStore = useLearningStore()
const userStore = useUserStore()

// 学习级别配置
const studyLevels = [
  { value: 'elementary', name: '小学', icon: '🎒', words: 500, color: 'bg-green-100 border-green-300' },
  { value: 'middle', name: '初中', icon: '📚', words: 1500, color: 'bg-blue-100 border-blue-300' },
  { value: 'high', name: '高中', icon: '🎓', words: 3500, color: 'bg-purple-100 border-purple-300' },
  { value: 'cet4', name: '四级', icon: '🏆', words: 4500, color: 'bg-orange-100 border-orange-300' }
]

// 今日进度
const todayProgress = computed(() => {
  return learningStore.currentSession.wordsStudied
})

// 最近成就
const recentAchievements = ref<Achievement[]>([])

// 格式化时间
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}分钟`
}

// 开始学习
const startLearning = async (level: 'elementary' | 'middle' | 'high' | 'cet4') => {
  learningStore.setStudyLevel(level)
  await learningStore.loadWordsForLevel(level)
  learningStore.startSession()
  router.push('/learn')
}

// 加载成就数据
const loadAchievements = async () => {
  try {
    const achievements = await database.getAchievements()
    recentAchievements.value = achievements.slice(0, 3)
  } catch (error) {
    console.error('加载成就失败:', error)
  }
}

onMounted(() => {
  loadAchievements()
})
</script>