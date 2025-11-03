import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    id: null as number | null,
    name: 'Guest',
    level: 1,
    experience: 0,
    streak: 0,
    totalWordsLearned: 0
  })

  const levelProgress = computed(() => {
    const expNeeded = user.value.level * 100
    return (user.value.experience / expNeeded) * 100
  })

  const addExperience = (amount: number) => {
    user.value.experience += amount
    const expNeeded = user.value.level * 100
    if (user.value.experience >= expNeeded) {
      user.value.level++
      user.value.experience = user.value.experience - expNeeded
    }
  }

  const incrementStreak = () => {
    user.value.streak++
  }

  const resetStreak = () => {
    user.value.streak = 0
  }

  const incrementWordsLearned = () => {
    user.value.totalWordsLearned++
  }

  return {
    user,
    levelProgress,
    addExperience,
    incrementStreak,
    resetStreak,
    incrementWordsLearned
  }
})