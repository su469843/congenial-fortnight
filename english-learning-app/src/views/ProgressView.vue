<template>
  <div class="space-y-8">
    <!-- 概览统计 -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card text-center">
        <div class="text-3xl font-bold text-primary-600 mb-2">
          {{ stats.totalWords }}
        </div>
        <div class="text-gray-600">总学习单词</div>
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
      <div class="card text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">
          {{ stats.experience }}
        </div>
        <div class="text-gray-600">经验值</div>
      </div>
    </section>

    <!-- 学习进度图表 -->
    <section class="card">
      <h3 class="text-xl font-semibold mb-6">近7天学习进度</h3>
      <div class="h-64">
        <canvas ref="progressChart" class="w-full h-full"></canvas>
      </div>
    </section>

    <!-- 分类统计 -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">词书学习进度</h3>
        <div class="space-y-4">
          <div 
            v-for="book in wordBooks" 
            :key="book.id"
            class="flex items-center justify-between"
          >
            <div>
              <div class="font-medium">{{ book.name }}</div>
              <div class="text-sm text-gray-600">{{ book.learned }}/{{ book.total }} 单词</div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${(book.learned / book.total) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-700">
                {{ Math.round((book.learned / book.total) * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4">本周练习统计</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>新学单词</span>
            <span class="font-medium">{{ weeklyStats.newWords }}</span>
          </div>
          <div class="flex justify-between">
            <span>复习次数</span>
            <span class="font-medium">{{ weeklyStats.reviews }}</span>
          </div>
          <div class="flex justify-between">
            <span>正确率</span>
            <span class="font-medium text-success-600">{{ weeklyStats.accuracy }}%</span>
          </div>
          <div class="flex justify-between">
            <span>总练习时间</span>
            <span class="font-medium">{{ weeklyStats.studyTime }}分钟</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 成就系统 -->
    <section class="card">
      <h3 class="text-xl font-semibold mb-6">成就徽章</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="text-center p-4 rounded-lg border-2 transition-all"
          :class="achievement.unlocked ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'"
        >
          <div 
            class="text-3xl mb-2"
            :class="achievement.unlocked ? '' : 'grayscale opacity-50'"
          >
            {{ achievement.icon }}
          </div>
          <div class="text-sm font-medium">{{ achievement.title }}</div>
          <div class="text-xs text-gray-600">{{ achievement.description }}</div>
        </div>
      </div>
    </section>

    <!-- 今日目标 -->
    <section class="card">
      <h3 class="text-xl font-semibold mb-4">今日目标</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span>学习 {{ dailyTarget }} 个新单词</span>
          <span class="text-sm text-gray-600">{{ todayProgress }}/{{ dailyTarget }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useProgressStore, useLearningStore } from '@/stores'

Chart.register(...registerables)

const progressChart = ref(null)
const progressStore = useProgressStore()
const learningStore = useLearningStore()

// 使用stores中的数据
const stats = computed(() => progressStore.stats)
const wordBooks = computed(() => progressStore.wordBooks)
const weeklyStats = computed(() => progressStore.weeklyStats)
const achievements = computed(() => progressStore.achievements)
const dailyTarget = computed(() => progressStore.dailyTarget)
const todayProgress = computed(() => progressStore.todayProgress)

const remainingWords = computed(() => progressStore.remainingWords)

onMounted(async () => {
  // 初始化数据并加载
  await progressStore.initialize()
  
  // 初始化图表
  nextTick(() => {
    initChart()
  })
})

function initChart() {
  if (progressChart.value && progressStore.weeklyStats.days.length > 0) {
    const ctx = progressChart.value.getContext('2d')
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: progressStore.weeklyStats.days,
        datasets: [{
          label: '学习单词数',
          data: progressStore.weeklyStats.studyCounts,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })
  }
}
</script>