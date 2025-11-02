<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div class="container mx-auto max-w-4xl px-4 py-6">
      <header class="mb-8">
        <nav class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-primary-600">
            英语学习应用
          </h1>
          <div class="flex space-x-4">
            <router-link
              v-for="item in navigation"
              :key="item.path"
              :to="item.path"
              class="px-3 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === item.path }"
            >
              {{ item.label }}
            </router-link>
          </div>
        </nav>
      </header>
      
      <main>
        <router-view />
      </main>

      <!-- PWA 安装提示 -->
      <div 
        v-if="pwa.isInstallable && !pwa.isInstalled && !installPromptDismissed" 
        class="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">安装应用</h3>
            <p class="text-sm">添加到主屏幕，获得更好的体验</p>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="pwa.installApp()" 
              class="bg-white text-primary-600 px-3 py-1 rounded text-sm font-medium"
            >
              安装
            </button>
            <button 
              @click="dismissInstallPrompt" 
              class="text-primary-200 px-3 py-1 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- 网络状态提示 -->
      <div 
        v-if="!pwa.isOnline" 
        class="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm">离线模式</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePWA } from '@/composables/usePWA'

const navigation = [
  { path: '/', label: '首页' },
  { path: '/practice', label: '练习' },
  { path: '/progress', label: '进度' },
  { path: '/settings', label: '设置' },
]

const pwa = usePWA()
const installPromptDismissed = ref(false)

function dismissInstallPrompt() {
  installPromptDismissed.value = true
  // 可以将这个状态保存到 localStorage 中，这样用户就不会再次看到提示
  localStorage.setItem('pwa-install-dismissed', 'true')
}

// 检查是否应该显示安装提示
if (localStorage.getItem('pwa-install-dismissed')) {
  installPromptDismissed.value = true
}
</script>