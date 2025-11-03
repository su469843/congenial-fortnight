<template>
  <div class="space-y-6">
    <!-- 单词卡片 -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center">
      <div v-if="!showTranslation" class="space-y-4">
        <h1 class="text-5xl font-bold text-gray-800">{{ word.word }}</h1>
        <p class="text-2xl text-gray-600">{{ word.pronunciation }}</p>
        <button
          @click="showTranslation = true"
          class="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold"
        >
          显示翻译
        </button>
      </div>
      
      <div v-else class="space-y-4">
        <h1 class="text-5xl font-bold text-gray-800">{{ word.word }}</h1>
        <p class="text-2xl text-gray-600">{{ word.pronunciation }}</p>
        <p class="text-3xl text-blue-600 font-semibold">{{ word.translation }}</p>
        <p v-if="word.definition" class="text-gray-700">{{ word.definition }}</p>
        <p v-if="word.example" class="text-gray-600 italic">"{{ word.example }}"</p>
      </div>
    </div>

    <!-- 掌握程度按钮 -->
    <div v-if="showTranslation" class="flex justify-center space-x-4">
      <button
        v-for="level in masteryLevels"
        :key="level.value"
        @click="handleAnswer(level.value)"
        class="px-6 py-3 rounded-full transition-all duration-200 font-semibold"
        :class="level.color"
      >
        {{ level.label }}
      </button>
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
  answer: [quality: number]
}>()

const showTranslation = ref(false)

const masteryLevels = [
  { value: 1, label: '忘记了', color: 'bg-red-500 text-white hover:bg-red-600' },
  { value: 2, label: '困难', color: 'bg-orange-500 text-white hover:bg-orange-600' },
  { value: 3, label: '一般', color: 'bg-yellow-500 text-white hover:bg-yellow-600' },
  { value: 4, label: '良好', color: 'bg-green-500 text-white hover:bg-green-600' },
  { value: 5, label: '简单', color: 'bg-blue-500 text-white hover:bg-blue-600' }
]

const handleAnswer = (quality: number) => {
  emit('answer', quality)
}
</script>