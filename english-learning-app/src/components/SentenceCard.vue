<template>
  <div class="w-full max-w-2xl mx-auto space-y-6">
    <!-- 练习类型选择 -->
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

    <!-- 听写练习 -->
    <div v-if="currentType === 'dictation'" class="space-y-4">
      <h3 class="text-lg font-medium text-center">听写句子</h3>
      <div class="text-center">
        <button 
          @click="playAudio"
          class="btn-primary text-lg px-6 py-3 mb-4"
          :disabled="!ttsEnabled"
        >
          播放音频
        </button>
      </div>
      <div class="space-y-4">
        <textarea 
          v-model="userInput"
          @keyup.ctrl.enter="checkAnswer"
          placeholder="请输入您听到的句子..."
          class="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          :class="showResult ? (isCorrect ? 'border-success-500' : 'border-error-500') : ''"
        ></textarea>
        <div class="text-center">
          <button @click="checkAnswer" class="btn-primary">
            检查答案
          </button>
        </div>
      </div>
    </div>

    <!-- 句子排序 -->
    <div v-if="currentType === 'ordering'" class="space-y-4">
      <h3 class="text-lg font-medium text-center">将单词排序成正确的句子</h3>
      <div class="space-y-4">
        <!-- 可拖拽的单词 -->
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="word in shuffledWords"
            :key="word + '-' + $index"
            @click="selectWord(word)"
            class="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer"
            :class="selectedWords.includes(word) ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="selectedWords.includes(word)"
          >
            {{ word }}
          </button>
        </div>

        <!-- 句子构建区域 -->
        <div class="min-h-16 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div class="flex flex-wrap gap-2 items-center">
            <span v-if="selectedWords.length === 0" class="text-gray-500">
              点击单词构建句子
            </span>
            <button
              v-for="(word, index) in selectedWords"
              :key="word + '-selected-' + index"
              @click="removeWord(index)"
              class="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg hover:bg-primary-200 transition-colors"
            >
              {{ word }}
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <button 
            @click="resetSelection"
            class="text-gray-500 hover:text-gray-700 text-sm"
          >
            重置
          </button>
          <button 
            @click="checkAnswer"
            :disabled="selectedWords.length === 0"
            class="btn-primary"
          >
            检查答案
          </button>
        </div>
      </div>
    </div>

    <!-- 翻译练习 -->
    <div v-if="currentType === 'translation'" class="space-y-4">
      <h3 class="text-lg font-medium text-center">翻译句子</h3>
      <div class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-lg">{{ sentence.sentence }}</p>
        </div>
        <textarea 
          v-model="userInput"
          @keyup.ctrl.enter="checkAnswer"
          placeholder="请输入中文翻译..."
          class="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          :class="showResult ? (isCorrect ? 'border-success-500' : 'border-error-500') : ''"
        ></textarea>
        <div class="text-center">
          <button @click="checkAnswer" class="btn-primary">
            检查答案
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
      
      <div v-if="!isCorrect" class="space-y-2">
        <div v-if="currentType === 'dictation' || currentType === 'ordering'" class="text-gray-600">
          正确答案：{{ sentence.sentence }}
        </div>
        <div v-if="currentType === 'translation'" class="text-gray-600">
          正确答案：{{ sentence.translation }}
        </div>
      </div>

      <div class="flex justify-center space-x-4">
        <button @click="$emit('next')" class="btn-primary">
          下一个
        </button>
      </div>
    </div>

    <!-- 提示 -->
    <div v-if="currentType === 'ordering' && !showResult" class="text-center text-sm text-gray-500">
      已选择 {{ selectedWords.length }} 个单词
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sentence: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['answer', 'next'])

const currentType = ref('dictation')
const userInput = ref('')
const selectedWords = ref([])
const showResult = ref(false)
const isCorrect = ref(false)

const exerciseTypes = [
  { id: 'dictation', name: '听写' },
  { id: 'ordering', name: '排序' },
  { id: 'translation', name: '翻译' }
]

const ttsEnabled = computed(() => {
  // TODO: 从设置 store 获取
  return true
})

const shuffledWords = computed(() => {
  const words = props.sentence.sentence.split(' ').filter(word => 
    word.trim() !== '' && !/[.,!?]/.test(word)
  )
  return words.sort(() => Math.random() - 0.5)
})

function playAudio() {
  if (!ttsEnabled.value) return
  
  if ('speechSynthesis' in window) {
    // 停止当前播放
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(props.sentence.sentence)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

function selectWord(word) {
  if (!selectedWords.value.includes(word)) {
    selectedWords.value.push(word)
  }
}

function removeWord(index) {
  selectedWords.value.splice(index, 1)
}

function resetSelection() {
  selectedWords.value = []
}

function checkAnswer() {
  let correct = false
  
  if (currentType.value === 'dictation') {
    correct = compareSentences(userInput.value, props.sentence.sentence)
  } else if (currentType.value === 'ordering') {
    const userSentence = selectedWords.value.join(' ')
    const originalWords = props.sentence.sentence.split(' ').filter(word => 
      word.trim() !== '' && !/[.,!?]/.test(word)
    ).join(' ')
    correct = userSentence.toLowerCase().trim() === originalWords.toLowerCase().trim()
  } else if (currentType.value === 'translation') {
    correct = compareTranslations(userInput.value, props.sentence.translation)
  }
  
  isCorrect.value = correct
  showResult.value = true
  
  emit('answer', {
    sentence: props.sentence.sentence,
    type: currentType.value,
    correct: correct,
    userAnswer: currentType.value === 'ordering' ? selectedWords.value.join(' ') : userInput.value
  })
}

function compareSentences(user, original) {
  const normalize = (str) => str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  return normalize(user) === normalize(original)
}

function compareTranslations(user, original) {
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim()
  return normalize(user) === normalize(original)
}
</script>