<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { database } from '@/utils/database'
// PWA更新注册 - 暂时禁用以避免构建错误
const offlineReady = ref(false)
const needRefresh = ref(false)
const updateServiceWorker = () => {
  window.location.reload()
}

// 初始化数据库连接
onMounted(async () => {
  try {
    await database.connect()
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }
})
</script>

<template>
  <RouterView />
  
  <!-- PWA 更新提示 -->
  <div
    v-if="offlineReady || needRefresh"
    class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50"
  >
    <div class="flex items-center space-x-3">
      <div class="text-2xl">
        {{ offlineReady ? '📱' : '🔄' }}
      </div>
      <div class="flex-1">
        <p v-if="offlineReady" class="text-sm font-medium text-gray-900">
          应用已准备离线使用
        </p>
        <p v-else-if="needRefresh" class="text-sm font-medium text-gray-900">
          有新内容可用，请刷新页面
        </p>
      </div>
      <div class="flex space-x-2">
        <button
          v-if="offlineReady"
          @click="offlineReady = false"
          class="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          关闭
        </button>
        <template v-else-if="needRefresh">
          <button
            @click="needRefresh = false"
            class="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            忽略
          </button>
          <button
            @click="updateServiceWorker()"
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            刷新
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
