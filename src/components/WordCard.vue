<template>
  <div class="w-full max-w-2xl mx-auto space-y-6">
    <!-- 单词信息 -->
    <div class="text-center space-y-4">
      <div class="relative">
        <h2 class="text-4xl font-bold text-gray-900">{{ word.word }}</h2>
        <button 
          @click="playPronunciation"
          class="absolute -right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-colors"
          :disabled="!ttsEnabled"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          </svg>
        </button>
      </div>
      <p class="text-lg text-gray-600">{{ word.phonetic }}</p>
    </div>

    <!-- 题型选择 -->
    <div class="flex justify-center">
      <div class="flex space-x-2 bg-gray-100 rounded-lg p-1">
        <button 
          v-for="type in exerciseTypes" 
          :key="type.id"
          @click="currentType = type.id"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="currentType === type.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
        >
          {{ type.name }}
        </button>
      </div>
    </div>

    <!-- 练习内容 -->
    <div class="space-y-6">
      <!-- 选择含义 -->
      <div v-if="currentType === 'meaning'" class="space-y-4">
        <h3 class="text-lg font-medium text-center">选择正确的含义</h3>
        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(option, index) in word.options"
            :key="index"
            @click="selectAnswer(option)"
            class="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
            :class="selectedAnswer === option ? 'border-primary-500 bg-primary-50' : ''"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- 拼写练习 -->
      <div v-if="currentType === 'spelling'" class="space-y-4">
        <h3 class="text-lg font-medium text-center">输入正确的拼写</h3>
        <div class="text-center text-gray-600 mb-4">
          含义：{{ word.meaning }}
        </div>
        <div class="flex space-x-2">
          <input 
            v-model="userInput"
            @keyup.enter="checkAnswer"
            type="text" 
            placeholder="输入单词拼写..."
            class="input-field text-center text-lg font-medium"
            :class="showResult ? (isCorrect ? 'border-success-500' : 'border-error-500') : ''"
          >
          <button @click="checkAnswer" class="btn-primary">
            检查
          </button>
        </div>
      </div>

      <!-- 听音练习 -->
      <div v-if="currentType === 'listening'" class="space-y-4">
        <h3 class="text-lg font-medium text-center">听音选择</h3>
        <div class="text-center">
          <button 
            @click="playAudio"
            class="btn-primary text-lg px-6 py-3"
            :disabled="!ttsEnabled"
          >
            播放发音
          </button>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(option, index) in word.options"
            :key="index"
            @click="selectAnswer(option)"
            class="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
            :class="selectedAnswer === option ? 'border-primary-500 bg-primary-50' : ''"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- 例句填空 -->
      <div v-if="currentType === 'sentence'" class="space-y-4">
        <h3 class="text-lg font-medium text-center">选择正确的单词完成句子</h3>
        <div class="bg-gray-50 p-6 rounded-lg">
          <p class="text-lg text-center">
            {{ word.example.replace(word.word, '_____') }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(option, index) in word.options"
            :key="index"
            @click="selectAnswer(option)"
            class="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
            :class="selectedAnswer === option ? 'border-primary-500 bg-primary-50' : ''"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- 结果显示 -->
    <div v-if="showResult" class="text-center space-y-4">
      <div 
        class="text-2xl font-bold"
        :class="isCorrect ? 'text-success-600' : 'text-error-600'"
      >
        {{ isCorrect ? '正确！' : '错误' }}
      </div>
      <div v-if="!isCorrect" class="text-gray-600">
        正确答案：{{ word.word }}
      </div>
      <div class="flex justify-center space-x-4">
        <button 
          @click="showExample" 
          v-if="currentType !== 'sentence'"
          class="btn-secondary"
        >
          查看例句
        </button>
        <button @click="$emit('next')" class="btn-primary">
          下一个
        </button>
      </div>
    </div>

    <!-- 例句显示 -->
    <div v-if="showExampleFlag" class="bg-blue-50 p-4 rounded-lg">
      <h4 class="font-medium text-blue-900 mb-2">例句</h4>
      <p class="text-blue-800">{{ word.example }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['answer', 'next'])

const currentType = ref('meaning')
const selectedAnswer = ref('')
const userInput = ref('')
const showResult = ref(false)
const showExampleFlag = ref(false)
const isCorrect = ref(false)

const exerciseTypes = [
  { id: 'meaning', name: '选义' },
  { id: 'spelling', name: '拼写' },
  { id: 'listening', name: '听音' },
  { id: 'sentence', name: '填空' }
]

const ttsEnabled = computed(() => {
  // TODO: 从设置 store 获取
  return true
})

function selectAnswer(answer) {
  selectedAnswer.value = answer
  checkAnswer()
}

function checkAnswer() {
  let correct = false
  
  if (currentType.value === 'meaning' || currentType.value === 'listening' || currentType.value === 'sentence') {
    correct = selectedAnswer.value === props.word.word
  } else if (currentType.value === 'spelling') {
    correct = userInput.value.toLowerCase().trim() === props.word.word.toLowerCase()
  }
  
  isCorrect.value = correct
  showResult.value = true
  
  emit('answer', {
    word: props.word.word,
    type: currentType.value,
    correct: correct,
    userAnswer: currentType.value === 'spelling' ? userInput.value : selectedAnswer.value
  })
}

function playPronunciation() {
  if (!ttsEnabled.value) return
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(props.word.word)
    utterance.lang = 'en-US'
    utterance.rate = 1.0
    speechSynthesis.speak(utterance)
  }
}

function playAudio() {
  playPronunciation()
}

function showExample() {
  showExampleFlag.value = !showExampleFlag.value
}
</script>