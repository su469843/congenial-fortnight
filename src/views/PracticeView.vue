<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="!currentExercise" class="space-y-6">
      <!-- 练习选择 -->
      <div class="text-center space-y-4">
        <h2 class="text-3xl font-bold text-gray-900">选择练习类型</h2>
        <p class="text-gray-600">选择您想要练习的内容</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div @click="startPractice('words')" class="card hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
          <div class="text-center space-y-4">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold">单词练习</h3>
            <p class="text-gray-600">学习新单词，巩固记忆</p>
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>4种题型</span>
              <span>•</span>
              <span>分级词书</span>
            </div>
          </div>
        </div>

        <div @click="startPractice('sentences')" class="card hover:shadow-lg transition-all cursor-pointer transform hover:scale-105">
          <div class="text-center space-y-4">
            <div class="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold">句子练习</h3>
            <p class="text-gray-600">练习句子理解和表达</p>
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>听写练习</span>
              <span>•</span>
              <span>句子排序</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentExercise" class="space-y-6">
      <!-- 练习进度 -->
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">{{ exerciseTitle }}</h2>
        <div class="text-sm text-gray-600">
          {{ currentIndex + 1 }} / {{ exercises.length }}
        </div>
      </div>

      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }"
        ></div>
      </div>

      <!-- 练习内容 -->
      <div class="card min-h-96 flex items-center justify-center">
        <WordCard 
          v-if="practiceType === 'words'"
          :word="currentExercise"
          @answer="handleAnswer"
          @next="nextExercise"
        />
        <SentenceCard 
          v-else-if="practiceType === 'sentences'"
          :sentence="currentExercise"
          @answer="handleAnswer"
          @next="nextExercise"
        />
      </div>

      <!-- 控制按钮 -->
      <div class="flex justify-between items-center">
        <button 
          v-if="currentIndex > 0" 
          @click="previousExercise"
          class="btn-secondary"
        >
          上一个
        </button>
        <div></div>
        <button 
          @click="endPractice"
          class="text-gray-500 hover:text-gray-700"
        >
          结束练习
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLearningStore, useProgressStore } from '@/stores'
import WordCard from '@/components/WordCard.vue'
import SentenceCard from '@/components/SentenceCard.vue'

const route = useRoute()
const learningStore = useLearningStore()
const progressStore = useProgressStore()

const exerciseTitle = computed(() => {
  return learningStore.practiceType === 'words' ? '单词练习' : '句子练习'
})

const currentExercise = computed(() => learningStore.currentExercise)
const currentIndex = computed(() => learningStore.currentIndex)
const exercises = computed(() => learningStore.exerciseQueue)

function startPractice(type) {
  learningStore.startPractice(type)
  // 学习进度会自动由store更新
  progressStore.updateStreak()
}

function handleAnswer(answerData) {
  learningStore.handleAnswer(answerData)
  
  // 更新学习统计
  if (answerData.correct) {
    progressStore.recordProgress(1)
  }
}

function nextExercise() {
  learningStore.nextExercise()
}

function previousExercise() {
  learningStore.previousExercise()
}

function endPractice() {
  learningStore.endPractice()
}

onMounted(async () => {
  // 初始化stores
  await progressStore.initialize()
  
  const type = route.query.type
  if (type) {
    startPractice(type)
  }
})
</script>