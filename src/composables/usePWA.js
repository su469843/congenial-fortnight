import { ref, onMounted } from 'vue'

export function usePWA() {
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const isOnline = ref(navigator.onLine)
  const updateAvailable = ref(false)

  let deferredPrompt = null

  onMounted(() => {
    // 监听网络状态
    window.addEventListener('online', () => {
      isOnline.value = true
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    // 监听 PWA 安装提示
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      isInstallable.value = true
    })

    // 监听 PWA 安装完成
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
    })

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }
  })

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              updateAvailable.value = true
            }
          })
        }
      })
    } catch (error) {
      console.error('Service Worker 注册失败:', error)
    }
  }

  const installApp = async () => {
    if (!deferredPrompt) return false

    const result = await deferredPrompt.prompt()
    if (result.outcome === 'accepted') {
      isInstalled.value = true
      isInstallable.value = false
      deferredPrompt = null
      return true
    }
    return false
  }

  const updateApp = () => {
    if (updateAvailable.value && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  return {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    updateApp
  }
}