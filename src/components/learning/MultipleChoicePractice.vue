<template>
  <div class="space-y-6">
    <!-- 题目 -->
    <div class="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">选择正确答案</h2>
      <p class="text-5xl font-bold text-gray-800 mb-2">{{ word.word }}</p>
      <p class="text-xl text-gray-600">{{ word.pronunciation }}</p>
    </div>

    <!-- 选项 -->
    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="(option, index) in options"
        :key="index"
        @click="selectAnswer(index)"
        class="p-6 rounded-xl border-2 transition-all duration-200 font-semibold text-lg"
        :class="getOptionClass(index)"
        :disabled="showResult"
      >
        {{ option }}
      </button>
    </div>

    <!-- 结果反馈 -->
    <div v-if="showResult" class="text-center">
      <div v-if="isCorrect" class="text-green-600">
        <div class="text-4xl mb-2">✅</div>
        <p class="text-xl font-semibold">正确!</p>
      </div>
      <div v-else class="text-red-600">
        <div class="text-4xl mb-2">❌</div>
        <p class="text-xl font-semibold">错误</p>
        <p class="text-lg">正确答案: <span class="font-bold">{{ word.translation }}</span></p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showResult" class="flex justify-center">
      <button
        @click="nextQuestion"
        class="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold"
      >
        下一个
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Word } from '@/types'

interface Props {
  word: Word
  questionType: 'translation' | 'pronunciation' | 'definition'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answer: [isCorrect: boolean]
}>()

const selectedOption = ref<number | null>(null)
const showResult = ref(false)
const isCorrect = ref(false)

// 生成选项
const options = computed(() => {
  const allOptions = [props.word.translation]
  
  // 添加干扰项 (这里使用模拟数据，实际应用中应该从词库中随机选择)
  const distractors = ['书', '猫', '狗', '房子', '汽车', '树', '水', '火']
  const shuffled = [...distractors].sort(() => Math.random() - 0.5)
  allOptions.push(...shuffled.slice(0, 3))
  
  // 随机排序
  return allOptions.sort(() => Math.random() - 0.5)
})

const getOptionClass = (index: number) => {
  if (!showResult.value) {
    return selectedOption.value === index 
      ? 'border-blue-500 bg-blue-50' 
      : 'border-gray-300 hover:border-gray-400 bg-white'
  }
  
  const isCorrectOption = options.value[index] === props.word.translation
  if (isCorrectOption) {
    return 'border-green-500 bg-green-50 text-green-700'
  }
  if (selectedOption.value === index && !isCorrect.value) {
    return 'border-red-500 bg-red-50 text-red-700'
  }
  return 'border-gray-300 bg-gray-50 text-gray-500'
}

const selectAnswer = (index: number) => {
  if (showResult.value) return
  
  selectedOption.value = index
  const correctAnswer = props.word.translation
  isCorrect.value = options.value[index] === correctAnswer
  showResult.value = true
  
  emit('answer', isCorrect.value)
}

const nextQuestion = () => {
  selectedOption.value = null
  showResult.value = false
  isCorrect.value = false
}
</script>