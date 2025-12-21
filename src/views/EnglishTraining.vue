<template>
  <div>
    <NavBar />

    <main style="padding: 16px; max-width: 800px; margin: 0 auto;">
      <!-- 歷史記錄頁面內容 -->
      <div v-if="isHistoryRoute">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h1 style="margin: 0; color: var(--mdui-color-primary);">學習歷史</h1>
          <mdui-button
            variant="outlined"
            @click="clearHistory"
            icon="delete"
            style="margin-left: 16px;"
          >
            清除歷史
          </mdui-button>
        </div>

        <mdui-card variant="outlined" style="margin-bottom: 24px; padding: 16px;">
          <h3 style="margin: 0 0 16px 0; color: var(--mdui-color-primary);">
            完成的題目數量: {{ completedQuestionsCount }}
          </h3>
          <p style="color: var(--mdui-color-on-surface-variant);">
            系統會自動記錄您已完成的題目，以便避免重複練習。
          </p>
        </mdui-card>

        <div v-if="completedQuestionsCount > 0">
          <h2 style="margin: 24px 0 16px 0;">歷史記錄詳情</h2>
          <mdui-list>
            <mdui-list-item>
              <mdui-icon slot="start" name="check_circle" style="color: var(--mdui-color-secondary);"></mdui-icon>
              <div>已完成題目總數: {{ completedQuestionsCount }}</div>
            </mdui-list-item>
            <mdui-list-item>
              <mdui-icon slot="start" name="schedule" style="color: var(--mdui-color-tertiary);"></mdui-icon>
              <div>最後練習時間: {{ lastPracticeTime }}</div>
            </mdui-list-item>
            <mdui-list-item>
              <mdui-icon slot="start" name="storage" style="color: var(--mdui-color-on-surface-variant);"></mdui-icon>
              <div>本地存儲使用: {{ localStorageUsage }}</div>
            </mdui-list-item>
          </mdui-list>

          <h2 style="margin: 24px 0 16px 0;">已學習的單字</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
            <mdui-chip
              v-for="word in learnedWords.slice(0, 20)"
              :key="word"
              variant="filled"
            >
              {{ word }}
            </mdui-chip>
            <mdui-chip variant="outlined" v-if="learnedWords.length > 20">
              ...還有 {{ learnedWords.length - 20 }} 個
            </mdui-chip>
          </div>
        </div>

        <div v-else>
          <mdui-card variant="filled" style="text-align: center; padding: 32px;">
            <mdui-icon name="history" style="font-size: 3rem; color: var(--mdui-color-on-surface-variant); margin-bottom: 16px;"></mdui-icon>
            <h3 style="margin: 16px 0 8px 0;">尚無歷史記錄</h3>
            <p style="color: var(--mdui-color-on-surface-variant); margin-bottom: 24px;">
              開始練習後，您的學習進度將會顯示在此處
            </p>
            <mdui-button
              variant="filled"
              @click="startPractice"
              icon="play_arrow"
            >
              開始練習
            </mdui-button>
          </mdui-card>
        </div>
      </div>

      <!-- 主入口頁面內容 (當路徑是 /english-training 時，不包括子路由) -->
      <div v-else-if="isMainEnglishRoute">
        <h1 style="text-align: center; margin-bottom: 16px; color: var(--mdui-color-primary);">
          英文詞彙訓練
        </h1>

        <p style="text-align: center; margin-bottom: 32px; color: var(--mdui-color-on-surface-variant);">
          提升您的英語詞彙量，輕鬆應對各種英語考試和日常交流
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px;">
          <mdui-card variant="outlined" style="padding: 24px; text-align: center;">
            <mdui-icon name="psychology" style="font-size: 3rem; color: var(--mdui-color-primary); margin-bottom: 16px;"></mdui-icon>
            <h3 style="margin: 16px 0 8px 0;">智能題目生成</h3>
            <p style="color: var(--mdui-color-on-surface-variant); margin: 0 0 16px 0;">
              基於學測6000字詞庫，AI智能生成個性化練習題目
            </p>
            <mdui-button
              variant="tonal"
              @click="startPractice"
              icon="play_arrow"
            >
              開始練習
            </mdui-button>
          </mdui-card>

          <mdui-card variant="outlined" style="padding: 24px; text-align: center;">
            <mdui-icon name="history" style="font-size: 3rem; color: var(--mdui-color-primary); margin-bottom: 16px;"></mdui-icon>
            <h3 style="margin: 16px 0 8px 0;">學習進度追蹤</h3>
            <p style="color: var(--mdui-color-on-surface-variant); margin: 0 0 16px 0;">
              自動記錄已完成題目，隨時檢視學習歷程
            </p>
            <mdui-button
              variant="tonal"
              @click="viewHistory"
              icon="history"
            >
              查看歷史
            </mdui-button>
          </mdui-card>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <mdui-button
            variant="filled"
            @click="startPractice"
            icon="auto_awesome"
            size="large"
            style="margin: 0 auto;"
          >
            立即開始練習
          </mdui-button>
        </div>

        <!-- 調試功能：清除本地存儲的題目 -->
        <div style="text-align: center; margin-top: 16px;">
          <mdui-button
            variant="outlined"
            @click="clearStoredQuestions"
            icon="delete_forever"
            size="small"
            style="margin: 0 auto;"
          >
            清除本地題目緩存（調試用）
          </mdui-button>
        </div>
      </div>

      <!-- 子路由內容 (practice, etc.) -->
      <router-view v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()

// Computed properties for route matching
const isHistoryRoute = computed(() => route.path === '/english-training/history');
const isMainEnglishRoute = computed(() => {
  return route.path === '/english-training' || route.path === '/english-training/';
});

// 歷史記錄相關狀態
const completedQuestionsCount = ref(0)
const lastPracticeTime = ref('尚未記錄')
const localStorageUsage = ref('未知')
const learnedWords = ref<string[]>([])


onMounted(() => {
  // Load history data if we're on the history page
  if (isHistoryRoute.value) {
    loadHistoryData()
  }
})

// Watch for route changes to load history data when navigating to history page
watch(() => route.path, (newPath) => {
  if (newPath === '/english-training/history') {
    loadHistoryData()
  }
})

const loadHistoryData = () => {
  // 計算完成的題目數量
  const completedIds = localStorage.getItem('completedQuestionIds')
  if (completedIds) {
    try {
      const parsed = JSON.parse(completedIds)
      completedQuestionsCount.value = Array.isArray(parsed) ? parsed.length : 0
    } catch (e) {
      console.error('解析已完成題目ID失敗:', e)
      completedQuestionsCount.value = 0
    }
  } else {
    completedQuestionsCount.value = 0
  }

  // 獲取最後練習時間（從問題存儲時間獲取）
  const questionTimestamp = localStorage.getItem('questionsTimestamp')
  if (questionTimestamp) {
    const date = new Date(parseInt(questionTimestamp))
    lastPracticeTime.value = date.toLocaleString()
  }

  // 計算本地存儲使用情況
  let totalSize = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key) && (key.includes('english') || key.includes('question'))) {
      totalSize += localStorage[key].length
    }
  }
  localStorageUsage.value = `${(totalSize / 1024).toFixed(2)} KB`

  // 獲取學習過的單字 (從錯題記錄或已完成題目中獲取)
  try {
    const storedQuestions = localStorage.getItem('englishQuestions');
    const completedIds = JSON.parse(localStorage.getItem('completedQuestionIds') || '[]');

    // 這裡我們將嘗試從本地存儲中提取學習過的單字
    // 但由於完成的題目ID格式，我們需要根據錯題來獲取單字
    const wrongAnswers = JSON.parse(localStorage.getItem('wrongAnswers') || '[]');
    const wordsSet = new Set<string>();

    // 從錯題中提取學習過的單字
    wrongAnswers.forEach((qa: any) => {
      if (qa.correctAnswer) {
        wordsSet.add(qa.correctAnswer);
      }
    });

    // 從已完成題目ID中嘗試提取單字
    completedIds.forEach((id: string) => {
      // 假設ID格式是 "sentence-correctAnswer"
      const parts = id.split('-');
      if (parts.length > 1) {
        const word = parts[parts.length - 1]; // 取最後部分作為單字
        if (word && word.length > 1) {
          wordsSet.add(word);
        }
      }
    });

    learnedWords.value = Array.from(wordsSet);
  } catch (e) {
    console.error('解析學習單字失敗:', e);
    learnedWords.value = [];
  }
}

const clearHistory = () => {
  if (confirm('確定要清除所有歷史記錄嗎？這將刪除已完成的題目記錄和錯題記錄。')) {
    localStorage.removeItem('completedQuestionIds')
    localStorage.removeItem('wrongAnswers')
    completedQuestionsCount.value = 0
    loadHistoryData() // 重新載入數據
    alert('歷史記錄已清除')
  }
}

// 清除本地存儲的題目（調試用）
const clearStoredQuestions = () => {
  if (confirm('確定要清除本地存儲的題目緩存嗎？這將刪除已生成的題目，下次練習時會重新生成。')) {
    localStorage.removeItem('englishQuestions')
    localStorage.removeItem('questionsTimestamp')
    localStorage.removeItem('questionSource')
    localStorage.removeItem('questionLevel')
    alert('題目緩存已清除')
  }
}

const startPractice = () => {
  router.push('/english-training/practice')
}

const viewHistory = () => {
  // 導航到歷史記錄頁面
  router.push('/english-training/history')
}
</script>