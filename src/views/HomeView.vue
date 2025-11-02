<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <section class="text-center space-y-4">
      <h2 class="text-4xl font-bold text-gray-900">
        欢迎来到英语学习应用
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        通过科学的间隔重复算法和多样化的练习方式，高效提升您的英语水平
      </p>
      <router-link to="/practice" class="btn-primary text-lg px-8 py-3">
        开始练习
      </router-link>
    </section>

    <!-- 统计信息 -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="text-3xl font-bold text-primary-600 mb-2">
          {{ stats.wordsLearned }}
        </div>
        <div class="text-gray-600">已学单词</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-success-600 mb-2">
          {{ stats.streak }}
        </div>
        <div class="text-gray-600">连续天数</div>
      </div>
      <div class="card text-center">
        <div class="text-3xl font-bold text-warning-600 mb-2">
          {{ stats.level }}
        </div>
        <div class="text-gray-600">当前等级</div>
      </div>
    </section>

    <!-- 每日进度 -->
    <section class="card">
      <h3 class="text-xl font-semibold mb-4">今日进度</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span>每日目标: {{ dailyTarget }} 个单词</span>
          <span>{{ todayProgress }}/{{ dailyTarget }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(todayProgress / dailyTarget) * 100}%` }"
          ></div>
        </div>
        <div class="text-sm text-gray-600">
          {{ remainingWords }} 个单词剩余
        </div>
      </div>
    </section>

    <!-- 练习选项 -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <router-link to="/practice?type=words" class="card hover:shadow-lg transition-shadow cursor-pointer">
        <div class="text-center space-y-3">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">单词练习</h3>
          <p class="text-gray-600">学习新单词，巩固记忆</p>
        </div>
      </router-link>

      <router-link to="/practice?type=sentences" class="card hover:shadow-lg transition-shadow cursor-pointer">
        <div class="text-center space-y-3">
          <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">句子练习</h3>
          <p class="text-gray-600">练习句子理解和表达</p>
        </div>
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLearningStore, useProgressStore } from '@/stores'

const learningStore = useLearningStore()
const progressStore = useProgressStore()

// 使用stores中的计算属性
const stats = computed(() => ({
  wordsLearned: progressStore.stats.totalWords,
  streak: progressStore.stats.streak,
  level: progressStore.stats.level
}))

const dailyTarget = computed(() => progressStore.dailyTarget)
const todayProgress = computed(() => progressStore.todayProgress)
const remainingWords = computed(() => progressStore.remainingWords)

onMounted(async () => {
  // 初始化stores并加载数据
  await progressStore.initialize()
  
  // 如果今日没有学习记录，初始化学习天数
  progressStore.updateStreak()
})
</script>