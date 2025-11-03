<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useUserStore } from './stores/user'
import { computed } from 'vue'

const userStore = useUserStore()
const levelProgress = computed(() => userStore.levelProgress)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-blue-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <RouterLink to="/" class="text-2xl font-bold flex items-center">
              <span class="mr-2">📚</span> 英语学习
            </RouterLink>
          </div>
          
          <nav class="hidden md:flex space-x-6">
            <RouterLink to="/" class="hover:text-blue-200 transition">首页</RouterLink>
            <RouterLink to="/learn" class="hover:text-blue-200 transition">学习</RouterLink>
            <RouterLink to="/progress" class="hover:text-blue-200 transition">进度</RouterLink>
            <RouterLink to="/settings" class="hover:text-blue-200 transition">设置</RouterLink>
          </nav>

          <div class="flex items-center space-x-4">
            <div class="text-sm">
              <div>等级: {{ userStore.user.level }}</div>
              <div class="w-20 bg-gray-300 rounded-full h-2">
                <div class="bg-green-400 h-2 rounded-full" :style="{ width: levelProgress + '%' }"></div>
              </div>
            </div>
            <div class="text-sm">
              <div>🔥 {{ userStore.user.streak }} 天</div>
              <div>📖 {{ userStore.user.totalWordsLearned }} 词</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>

    <footer class="bg-gray-800 text-white py-6 mt-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2025 英语学习应用. 使用 Vue 3 构建.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply text-blue-200 font-bold;
}
</style>
