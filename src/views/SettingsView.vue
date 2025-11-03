<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-4xl mx-auto">
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
          
          <h1 class="text-2xl font-bold text-gray-800">设置</h1>
          
          <div class="w-10"></div>
        </div>
      </header>

      <!-- 设置选项 -->
      <div class="space-y-6">
        <!-- 学习设置 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">学习设置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">每日学习目标</label>
              <div class="flex items-center space-x-4">
                <input
                  v-model.number="settings.dailyGoal"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  class="flex-1"
                >
                <span class="w-12 text-center font-semibold">{{ settings.dailyGoal }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">每天计划学习的单词数量</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">学习级别</label>
              <select
                v-model="settings.studyLevel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="elementary">小学</option>
                <option value="middle">初中</option>
                <option value="high">高中</option>
                <option value="cet4">四级</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">选择适合的学习难度</p>
            </div>
          </div>
        </div>

        <!-- 应用设置 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">应用设置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">主题</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="theme in themes"
                  :key="theme.value"
                  @click="settings.theme = theme.value"
                  class="p-3 rounded-lg border-2 transition-all duration-200"
                  :class="[
                    settings.theme === theme.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
                    theme.color
                  ]"
                >
                  <div class="text-lg font-semibold">{{ theme.name }}</div>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">语言</label>
              <select
                v-model="settings.language"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">通知设置</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-700">学习提醒</p>
                <p class="text-sm text-gray-500">每日学习时间提醒</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.notificationsEnabled"
                  type="checkbox"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-700">音效</p>
                <p class="text-sm text-gray-500">操作音效和发音</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.soundEnabled"
                  type="checkbox"
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">数据管理</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-700">导出学习数据</p>
                <p class="text-sm text-gray-500">备份学习进度和成就</p>
              </div>
              <button
                @click="exportData"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                导出
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-700">重置学习数据</p>
                <p class="text-sm text-gray-500">清除所有学习进度</p>
              </div>
              <button
                @click="confirmReset"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        <!-- 关于 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">关于</h2>
          <div class="space-y-2 text-gray-600">
            <p>英语学习应用 v1.0.0</p>
            <p>基于Vue 3 + TypeScript + Vite构建</p>
            <p>使用SM-2算法实现间隔重复记忆</p>
            <div class="pt-4 space-x-4">
              <a href="#" class="text-blue-500 hover:underline">隐私政策</a>
              <a href="#" class="text-blue-500 hover:underline">使用条款</a>
              <a href="#" class="text-blue-500 hover:underline">反馈建议</a>
            </div>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="mt-8 text-center">
        <button
          @click="saveSettings"
          class="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold"
        >
          保存设置
        </button>
      </div>
    </div>

    <!-- 重置确认对话框 -->
    <div v-if="showResetDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold text-gray-800 mb-4">确认重置</h3>
        <p class="text-gray-600 mb-6">此操作将清除所有学习进度和成就，无法恢复。确定要继续吗？</p>
        <div class="flex space-x-4">
          <button
            @click="showResetDialog = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="resetData"
            class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            确认重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { database } from '@/utils/database'
import type { UserSettings } from '@/types'

const router = useRouter()

const settings = ref<UserSettings>({
  dailyGoal: 10,
  soundEnabled: true,
  notificationsEnabled: true,
  studyLevel: 'elementary',
  theme: 'light',
  language: 'zh'
})

const showResetDialog = ref(false)

const themes = [
  { value: 'light', name: '浅色', color: 'bg-gray-100' },
  { value: 'dark', name: '深色', color: 'bg-gray-800' },
  { value: 'auto', name: '自动', color: 'bg-gradient-to-r from-gray-100 to-gray-800' }
]

// 保存设置
const saveSettings = async () => {
  try {
    await database.saveSettings(settings.value)
    alert('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('保存设置失败')
  }
}

// 导出数据
const exportData = async () => {
  try {
    const progress = await database.getProgress()
    const achievements = await database.getAchievements()
    const srsData = await database.getSRSData()
    
    const exportData = {
      progress,
      achievements,
      srsData,
      settings: settings.value,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `english-learning-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出数据失败')
  }
}

// 显示重置确认
const confirmReset = () => {
  showResetDialog.value = true
}

// 重置数据
const resetData = async () => {
  try {
    localStorage.clear()
    await database.connect() // 重新初始化数据
    showResetDialog.value = false
    alert('数据已重置')
    goBack()
  } catch (error) {
    console.error('重置数据失败:', error)
    alert('重置数据失败')
  }
}

// 返回上一页
const goBack = () => {
  router.push('/')
}

// 加载设置
const loadSettings = async () => {
  try {
    settings.value = await database.getSettings()
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>