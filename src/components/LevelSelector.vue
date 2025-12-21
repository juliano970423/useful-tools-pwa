<template>
  <div style="padding: 16px;">
    <h2 style="text-align: center; margin-bottom: 8px;">選擇難度級別</h2>
    <p style="text-align: center; color: var(--mdui-color-on-surface-variant); margin-bottom: 32px;">
      從適合你的級別開始，逐步提升
    </p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
      <mdui-card
        v-for="level in availableLevels"
        :key="level"
        variant="outlined"
        clickable
        @click="selectLevel(level)"
        :style="{
          borderColor: selectedLevel === level ? 'var(--mdui-color-primary)' : '',
          backgroundColor: selectedLevel === level ? 'var(--mdui-color-primary-container)' : ''
        }"
      >
        <div style="padding: 20px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: var(--mdui-color-primary); margin-bottom: 8px;">Level {{ level }}</div>
          <div style="font-size: 16px; color: var(--mdui-color-on-surface-variant); margin-bottom: 12px;">{{ getLevelDescription(level) }}</div>
          <mdui-chip>{{ wordCounts[level] || 0 }} 單字</mdui-chip>
        </div>
      </mdui-card>
    </div>

    <div v-if="selectedLevel && wordCounts[selectedLevel]" style="margin-bottom: 32px;">
      <mdui-divider></mdui-divider>
      <h3 style="margin: 16px 0;">級別預覽</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div v-for="word in previewWords" :key="word.word" style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px;">
          <strong>{{ word.word }}</strong>
          <span style="font-size: 12px; color: var(--mdui-color-on-surface-variant); background-color: var(--mdui-color-surface-variant); padding: 2px 8px; border-radius: 12px;">{{ word.partOfSpeech }}</span>
          <span style="font-size: 14px; color: var(--mdui-color-on-surface); flex: 1;">{{ word.chineseMeaning }}</span>
        </div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="text-align: center;">
        <h3 style="margin: 0 0 16px 0;">無限模式</h3>
        <p style="margin-bottom: 16px; color: var(--mdui-color-on-surface-variant);">
          無限題目，系統會在第49題時自動加載後續題目
        </p>
      </div>

      <mdui-button
        variant="filled"
        @click="startInfiniteMode"
        :loading="isGenerating"
        :disabled="!selectedLevel"
        full-width
        size="large"
        icon="auto_awesome"
      >
        開始無限練習
      </mdui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getAvailableLevels, getLevelDescription, loadWordData, type WordData } from '@/services/wordService'

const emit = defineEmits<{
  'start-infinite-mode': [level: number]
}>()

const availableLevels = ref<number[]>([])
const selectedLevel = ref<number | null>(null)
const isGenerating = ref(false)
const wordCounts = ref<{ [key: number]: number }>({})
const previewWords = ref<WordData[]>([])

onMounted(() => {
  availableLevels.value = getAvailableLevels()

  // 硬編碼每個級別的單字數量（基於實際CSV文件的行數）
  const correctWordCounts = {
    1: 1000, // level_1.csv 實際有 1000 個單字
    2: 1001, // level_2.csv 實際有 1001 個單字
    3: 1001, // level_3.csv 實際有 1001 個單字
    4: 1002, // level_4.csv 實際有 1002 個單字
    5: 1000, // level_5.csv 實際有 1000 個單字
    6: 1001  // level_6.csv 實際有 1001 個單字
  }

  // 設置每個級別的正確單字數量
  for (const level of availableLevels.value) {
    wordCounts.value[level] = correctWordCounts[level] || 0
  }
})

const selectLevel = (level: number) => {
  selectedLevel.value = level
}

const startInfiniteMode = () => {
  if (selectedLevel.value) {
    isGenerating.value = true
    emit('start-infinite-mode', selectedLevel.value)
  }
}

// 監聽選擇的級別變化，載入預覽單字
watch(selectedLevel, async (newLevel) => {
  if (newLevel) {
    try {
      const words = await loadWordData(newLevel)
      previewWords.value = words.slice(0, 5) // 顯示前5個單字作為預覽
    } catch (error) {
      console.error('載入預覽單字失敗:', error)
      previewWords.value = []
    }
  }
})
</script>