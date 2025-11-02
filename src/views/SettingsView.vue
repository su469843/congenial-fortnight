<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">设置</h2>
      <p class="text-gray-600">个性化您的学习体验</p>
    </div>

    <!-- 学习设置 -->
    <section class="card">
      <h3 class="text-lg font-semibold mb-6">学习设置</h3>
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            每日目标
          </label>
          <div class="flex items-center space-x-4">
            <input 
            v-model.number="settings.value.dailyTarget"
            type="range" 
            min="5" 
            max="50" 
            step="5"
            class="flex-1"
          >
            <span class="text-lg font-semibold text-primary-600 min-w-16">
              {{ settings.value.dailyTarget }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">每天学习的新单词数量</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            复习策略
          </label>
          <select v-model="settings.value.reviewStrategy" class="input-field">
            <option value="all">复习所有已学单词</option>
            <option value="mistakes">只复习错题</option>
            <option value="balanced">平衡模式</option>
          </select>
          <p class="text-sm text-gray-500 mt-1">决定哪些单词需要复习</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            学习难度
          </label>
          <select v-model="settings.value.difficulty" class="input-field">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
          <p class="text-sm text-gray-500 mt-1">调整新单词的复杂度</p>
        </div>
      </div>
    </section>

    <!-- 音频设置 -->
    <section class="card">
      <h3 class="text-lg font-semibold mb-6">音频设置</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">语音播放</div>
            <div class="text-sm text-gray-600">练习时自动播放发音</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.value.ttsEnabled" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div v-if="settings.ttsEnabled">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            语音速度
          </label>
          <div class="flex items-center space-x-4">
            <span class="text-sm">慢</span>
            <input 
              v-model.number="settings.value.ttsSpeed"
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1"
              class="flex-1"
            >
            <span class="text-sm">快</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">当前速度: {{ settings.value.ttsSpeed }}x</p>
        </div>
      </div>
    </section>

    <!-- 语言设置 -->
    <section class="card">
      <h3 class="text-lg font-semibold mb-6">语言设置</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            界面语言
          </label>
          <select v-model="settings.value.language" class="input-field">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            词书选择
          </label>
          <div class="space-y-2">
            <label 
              v-for="book in availableBooks" 
              :key="book.id"
              class="flex items-center"
            >
              <input 
                :checked="settings.value.selectedBooks.includes(book.id)"
                @change="toggleBook(book.id)"
                type="checkbox" 
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
              <span class="ml-2">{{ book.name }}</span>
              <span class="ml-auto text-sm text-gray-500">{{ book.wordCount }} 单词</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 通知设置 -->
    <section class="card">
      <h3 class="text-lg font-semibold mb-6">通知设置</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">学习提醒</div>
            <div class="text-sm text-gray-600">每日固定时间提醒学习</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="settings.value.reminderEnabled" type="checkbox" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div v-if="settings.reminderEnabled" class="ml-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            提醒时间
          </label>
          <input 
            v-model="settings.value.reminderTime" 
            type="time" 
            class="input-field"
          >
        </div>
      </div>
    </section>

    <!-- 数据管理 -->
    <section class="card">
      <h3 class="text-lg font-semibold mb-6">数据管理</h3>
      <div class="space-y-4">
        <button @click="exportData" class="btn-secondary">
          导出学习数据
        </button>
        <button @click="importData" class="btn-secondary">
          导入学习数据
        </button>
        <button @click="resetProgress" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
          重置所有进度
        </button>
      </div>
    </section>

    <!-- 保存按钮 -->
    <div class="flex justify-center">
      <button @click="saveSettings" class="btn-primary px-8 py-3">
        保存设置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSettingsStore, useProgressStore, useLearningStore } from '@/stores'

const settingsStore = useSettingsStore()
const progressStore = useProgressStore()
const learningStore = useLearningStore()

// 使用stores中的数据
const settings = computed(() => settingsStore.settings)
const availableBooks = computed(() => settingsStore.availableBooks)

onMounted(async () => {
  settingsStore.initialize()
  await progressStore.initialize()
})

function saveSettings() {
  settingsStore.saveSettings()
  // 显示保存成功的提示
  alert('设置已保存！')
}

function exportData() {
  const data = learningStore.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'english-learning-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          learningStore.importData(data)
          settingsStore.importSettings(data)
          alert('数据导入成功！')
        } catch (error) {
          alert('导入失败：文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function resetProgress() {
  if (confirm('确定要重置所有学习进度吗？此操作不可恢复。')) {
    progressStore.resetProgress()
    learningStore.resetProgress()
    alert('进度已重置')
  }
}

function toggleBook(bookId) {
  settingsStore.toggleBook(bookId)
}
</script>