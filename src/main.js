import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import { dbManager } from './db/database.js'
import './assets/main.css'

// i18n 配置
const messages = {
  zh: {
    common: {
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      next: '下一个',
      previous: '上一个',
      continue: '继续',
      finish: '完成',
    },
    navigation: {
      home: '首页',
      practice: '练习',
      progress: '进度',
      settings: '设置',
    },
    practice: {
      wordCards: '单词卡片',
      sentencePractice: '句子练习',
      selectMeaning: '选择含义',
      typeTranslation: '输入翻译',
      listenAndType: '听写',
      fillBlanks: '填空',
      correct: '正确',
      incorrect: '错误',
    },
    progress: {
      dailyGoal: '每日目标',
      streak: '连续天数',
      experience: '经验值',
      level: '等级',
      wordsLearned: '已学单词',
      accuracy: '正确率',
    },
    settings: {
      dailyTarget: '每日目标',
      reviewStrategy: '复习策略',
      ttsEnabled: '语音播放',
      language: '语言',
    }
  },
  en: {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      next: 'Next',
      previous: 'Previous',
      continue: 'Continue',
      finish: 'Finish',
    },
    navigation: {
      home: 'Home',
      practice: 'Practice',
      progress: 'Progress',
      settings: 'Settings',
    },
    practice: {
      wordCards: 'Word Cards',
      sentencePractice: 'Sentence Practice',
      selectMeaning: 'Select Meaning',
      typeTranslation: 'Type Translation',
      listenAndType: 'Listen & Type',
      fillBlanks: 'Fill Blanks',
      correct: 'Correct',
      incorrect: 'Incorrect',
    },
    progress: {
      dailyGoal: 'Daily Goal',
      streak: 'Streak',
      experience: 'Experience',
      level: 'Level',
      wordsLearned: 'Words Learned',
      accuracy: 'Accuracy',
    },
    settings: {
      dailyTarget: 'Daily Target',
      reviewStrategy: 'Review Strategy',
      ttsEnabled: 'Text-to-Speech',
      language: 'Language',
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages,
})

const pinia = createPinia()

// 初始化数据库
async function initializeApp() {
  try {
    console.log('正在初始化数据库...')
    const initSuccess = await dbManager.init()
    if (initSuccess) {
      console.log('数据库初始化成功')
      // 初始化表结构（如果不存在）
      await dbManager.initTables()
      console.log('数据库表结构初始化完成')
    } else {
      console.error('数据库初始化失败，请检查连接配置')
    }
  } catch (error) {
    console.error('数据库初始化错误:', error)
  }
}

const app = createApp(App)

// 在应用挂载前初始化数据库
initializeApp().then(() => {
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.mount('#app')
}).catch(error => {
  console.error('应用启动失败:', error)
  // 即使数据库初始化失败，也继续启动应用
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.mount('#app')
})