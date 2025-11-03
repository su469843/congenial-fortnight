<template>
  <div class="space-y-6">
    <!-- 题目 -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">拼写单词</h2>
      <p class="text-3xl text-blue-600 font-semibold mb-2">{{ word.translation }}</p>
      <p class="text-xl text-gray-600 mb-4">{{ word.pronunciation }}</p>
      <p v-if="word.definition" class="text-gray-700">{{ word.definition }}</p>
      <p v-if="word.example" class="text-gray-600 italic mt-2">"{{ word.example }}"</p>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <input
        v-model="userInput"
        @keyup.enter="checkAnswer"
        type="text"
        placeholder="输入英文单词..."
        class="w-full px-4 py-3 text-xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
        :class="{ 'border-red-500': showResult && !isCorrect, 'border-green-500': showResult && isCorrect }"
        :disabled="showResult"
      >
      
      <!-- 结果反馈 -->
      <div v-if="showResult" class="mt-6 text-center">
        <div v-if="isCorrect" class="text-green-600">
          <div class="text-4xl mb-2">✅</div>
          <p class="text-xl font-semibold">正确!</p>
        </div>
        <div v-else class="text-red-600">
          <div class="text-4xl mb-2">❌</div>
          <p class="text-xl font-semibold">错误</p>
          <p class="text-lg">正确答案: <span class="font-bold">{{ word.word }}</span></p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-6 flex justify-center space-x-4">
        <button
          v-if="!showResult"
          @click="checkAnswer"
          class="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold"
        >
          检查答案
        </button>
        <button
          v-if="showResult"
          @click="nextWord"
          class="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-semibold"
        >
          下一个
        </button>
        <button
          v-if="showResult && !isCorrect"
          @click="retry"
          class="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-semibold"
        >
          重试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Word } from '@/types'

interface Props {
  word: Word
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answer: [isCorrect: boolean]
}>()

const userInput = ref('')
const showResult = ref(false)
const isCorrect = ref(false)

const checkAnswer = () => {
  const normalizedInput = userInput.value.toLowerCase().trim()
  const normalizedAnswer = props.word.word.toLowerCase().trim()
  isCorrect.value = normalizedInput === normalizedAnswer
  showResult.value = true
  
  // 自动发送答案
  emit('answer', isCorrect.value)
}

const nextWord = () => {
  userInput.value = ''
  showResult.value = false
  isCorrect.value = false
}

const retry = () => {
  userInput.value = ''
  showResult.value = false
  isCorrect.value = false
}
</script>