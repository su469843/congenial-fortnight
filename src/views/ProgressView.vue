<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- 顶部导航 -->
      <header class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex justify-between items-center">
          <button
            @click="goBack"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 class="text-2xl font-bold text-gray-800">学习进度</h1>
          
          <div class="flex items-center space-x-4">
            <select
              v-model="selectedPeriod"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">今年</option>
              <option value="all">全部</option>
            </select>
          </div>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">总学单词</p>
              <p class="text-3xl font-bold text-blue-500">{{ progress.totalWordsStudied }}</p>
            </div>
            <div class="text-4xl">📚</div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">正确率</p>
              <p class="text-3xl font-bold text-green-500">{{ overallAccuracy }}%</p>
            </div>
            <div class="text-4xl">🎯</div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">学习时长</p>
              <p class="text-3xl font-bold text-purple-500">{{ formatTime(progress.totalTimeSpent) }}</p>
            </div>
            <div class="text-4xl">⏰</div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">连续天数</p>
              <p class="text-3xl font-bold text-orange-500">{{ progress.currentStreak }}</p>
            </div>
            <div class="text-4xl">🔥</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 学习曲线 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">学习曲线</h2>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <div class="text-6xl mb-4">📈</div>
              <p>学习曲线图表</p>
              <p class="text-sm">显示每日学习单词数</p>
            </div>
          </div>
        </div>

        <!-- 正确率趋势 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">正确率趋势</h2>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <div class="text-6xl mb-4">📊</div>
              <p>正确率趋势图</p>
              <p class="text-sm">显示学习效果变化</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 分级进度 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">分级进度</h2>
        <div class="space-y-4">
          <div
            v-for="(count, level) in progress.wordsPerLevel"
            :key="level"
            class="space-y-2"
          >
            <div class="flex justify-between items-center">
              <span class="font-semibold">{{ getLevelName(level) }}</span>
              <span class="text-sm text-gray-600">{{ count }}个单词</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-300"
                :class="getLevelColor(level)"
                :style="{ width: `${Math.min((count / getLevelTarget(level)) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就展示 -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">已解锁成就</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="achievement in unlockedAchievements"
            :key="achievement.id"
            class="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200"
          >
            <div class="text-4xl mb-2">{{ achievement.icon }}</div>
            <p class="font-semibold text-sm">{{ achievement.name }}</p>
            <p class="text-xs text-gray-600">{{ achievement.description }}</p>
            <p v-if="achievement.unlockedAt" class="text-xs text-gray-500 mt-1">
              {{ formatDate(achievement.unlockedAt) }}
            </p>
          </div>
        </div>
        
        <div v-if="unlockedAchievements.length === 0" class="text-center py-8 text-gray-500">
          <div class="text-6xl mb-4">🏆</div>
          <p>还没有解锁成就</p>
          <p class="text-sm">继续学习，解锁更多成就!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '@/utils/database'
import type { LearningProgress, Achievement } from '@/types'

const router = useRouter()

const selectedPeriod = ref('week')
const progress = ref<LearningProgress>({
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
})
const achievements = ref<Achievement[]>([])

// 计算整体正确率
const overallAccuracy = computed(() => {
  if (progress.value.totalWordsStudied === 0) return 0
  return Math.round((progress.value.totalCorrectAnswers / progress.value.totalWordsStudied) * 100)
})

// 已解锁成就
const unlockedAchievements = computed(() => {
  return achievements.value.filter(a => a.unlockedAt)
})

// 获取级别名称
const getLevelName = (level: string): string => {
  const names = {
    elementary: '小学',
    middle: '初中',
    high: '高中',
    cet4: '四级'
  }
  return names[level] || level
}

// 获取级别目标
const getLevelTarget = (level: string): number => {
  const targets = {
    elementary: 500,
    middle: 1500,
    high: 3500,
    cet4: 4500
  }
  return targets[level] || 1000
}

// 获取级别颜色
const getLevelColor = (level: string): string => {
  const colors = {
    elementary: 'bg-green-500',
    middle: 'bg-blue-500',
    high: 'bg-purple-500',
    cet4: 'bg-orange-500'
  }
  return colors[level] || 'bg-gray-500'
}

// 格式化时间
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  return `${hours}小时`
}

// 格式化日期
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 加载进度数据
const loadProgress = async () => {
  try {
    progress.value = await database.getProgress()
  } catch (error) {
    console.error('加载进度失败:', error)
  }
}

// 加载成就数据
const loadAchievements = async () => {
  try {
    achievements.value = await database.getAchievements()
  } catch (error) {
    console.error('加载成就失败:', error)
  }
}

// 返回上一页
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadProgress()
  loadAchievements()
})
</script>