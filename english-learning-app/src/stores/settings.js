import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    dailyTarget: 20,
    reviewStrategy: 'balanced', // 'all', 'mistakes', 'balanced'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    ttsEnabled: true,
    ttsSpeed: 1.0,
    language: 'zh',
    selectedBooks: [1, 2], // 词书ID列表
    reminderEnabled: false,
    reminderTime: '19:00'
  })

  const availableBooks = ref([
    { id: 1, name: '小学英语词汇', wordCount: 200 },
    { id: 2, name: '初中英语词汇', wordCount: 150 },
    { id: 3, name: '高中英语词汇', wordCount: 300 },
    { id: 4, name: '大学英语词汇', wordCount: 500 }
  ])

  // 加载设置
  function loadSettings() {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        settings.value = { ...settings.value, ...parsedSettings }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }

  // 保存设置
  function saveSettings() {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  // 更新单个设置
  function updateSetting(key, value) {
    settings.value[key] = value
    saveSettings()
  }

  // 更新多个设置
  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  // 重置为默认值
  function resetToDefaults() {
    settings.value = {
      dailyTarget: 20,
      reviewStrategy: 'balanced',
      difficulty: 'medium',
      ttsEnabled: true,
      ttsSpeed: 1.0,
      language: 'zh',
      selectedBooks: [1, 2],
      reminderEnabled: false,
      reminderTime: '19:00'
    }
    saveSettings()
  }

  // 导出设置
  function exportSettings() {
    return {
      settings: settings.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  // 导入设置
  function importSettings(data) {
    if (data.settings) {
      settings.value = { ...settings.value, ...data.settings }
      saveSettings()
      return true
    }
    return false
  }

  // 获取难度对应的词汇难度范围
  function getDifficultyRange() {
    const difficulty = settings.value.difficulty
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

  // 检查是否启用了指定词书
  function isBookEnabled(bookId) {
    return settings.value.selectedBooks.includes(bookId)
  }

  // 切换词书启用状态
  function toggleBook(bookId) {
    const index = settings.value.selectedBooks.indexOf(bookId)
    if (index > -1) {
      settings.value.selectedBooks.splice(index, 1)
    } else {
      settings.value.selectedBooks.push(bookId)
    }
    saveSettings()
  }

  // 获取启用的词书列表
  function getEnabledBooks() {
    return availableBooks.value.filter(book => 
      settings.value.selectedBooks.includes(book.id)
    )
  }

  // 自动保存设置变化
  watch(settings, saveSettings, { deep: true })

  // 初始化
  function initialize() {
    loadSettings()
  }

  return {
    settings,
    availableBooks,
    loadSettings,
    saveSettings,
    updateSetting,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    getDifficultyRange,
    isBookEnabled,
    toggleBook,
    getEnabledBooks,
    initialize
  }
})