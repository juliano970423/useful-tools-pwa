<template>
  <div class="stroop-test-container">
    <div class="test-header">
      <h3 class="test-title">斯特魯普測試</h3>
      <div class="test-stats">
        <mdui-chip>正確: {{ correctAnswers }}</mdui-chip>
        <mdui-chip>錯誤: {{ wrongAnswers }}</mdui-chip>
        <mdui-chip>準確率: {{ accuracy }}%</mdui-chip>
      </div>
    </div>

    <div class="test-controls">
      <mdui-button 
        variant="filled" 
        @click="startTest"
        :disabled="isTestActive"
      >
        開始測試
      </mdui-button>
      <mdui-button 
        variant="outlined" 
        @click="resetTest"
      >
        重置
      </mdui-button>
    </div>

    <div v-if="isTestActive" class="test-area">
      <div class="question-info">
        <p class="instruction">{{ currentInstruction }}</p>
        <p class="question-counter">題目 {{ currentQuestion }} / {{ totalQuestions }}</p>
      </div>

      <mdui-card class="stroop-display" v-if="currentStroopItem">
        <div 
          class="stroop-text"
          :style="{ color: currentStroopItem.fontColor }"
        >
          {{ currentStroopItem.text }}
        </div>
      </mdui-card>

      <div class="answer-buttons">
        <mdui-button 
          v-for="color in colors" 
          :key="color.name"
          variant="filled"
          class="color-button"
          @click="selectAnswer(color)"
          :style="{ backgroundColor: color.color, color: '#fff' }"
          :disabled="isAnswering"
        >
          {{ color.name }}
        </mdui-button>
      </div>

      <mdui-linear-progress :value="timerProgress / 100"></mdui-linear-progress>
    </div>

    <div v-if="testCompleted" class="test-results-container">
      <mdui-card class="test-results" variant="filled">
        <div class="results-content">
          <h4>測試完成！</h4>
          <div class="results-stats">
            <mdui-list>
              <mdui-list-item>總題數: {{ totalQuestions }}</mdui-list-item>
              <mdui-list-item>正確答案: {{ correctAnswers }}</mdui-list-item>
              <mdui-list-item>錯誤答案: {{ wrongAnswers }}</mdui-list-item>
              <mdui-list-item>準確率: {{ accuracy }}%</mdui-list-item>
              <mdui-list-item>平均反應時間: {{ averageReactionTime }}ms</mdui-list-item>
            </mdui-list>
          </div>
        </div>
      </mdui-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import 'mdui/components/card.js'
import 'mdui/components/button.js'
import 'mdui/components/linear-progress.js'
import 'mdui/components/chip.js'
import 'mdui/components/list.js'
import 'mdui/components/list-item.js'

interface Color {
  name: string
  color: string
}

interface StroopItem {
  text: string
  fontColor: string
  correctAnswer: string
  isInterference: boolean
}

interface AnswerRecord {
  question: StroopItem
  userAnswer: string
  isCorrect: boolean
  reactionTime: number
}

const colors: Color[] = [
  { name: '紅', color: '#FF0000' },
  { name: '藍', color: '#0000FF' },
  { name: '綠', color: '#00FF00' },
  { name: '黃', color: '#FFFF00' },
  { name: '紫', color: '#800080' },
  { name: '橙', color: '#FFA500' }
]

const isTestActive = ref(false)
const isTestModeFontColor = ref(true) // true: 判斷字體顏色, false: 判斷文字內容
const currentStroopItem = ref<StroopItem | null>(null)
const currentQuestion = ref(0)
const totalQuestions = ref(20)
const correctAnswers = ref(0)
const wrongAnswers = ref(0)
const testCompleted = ref(false)
const answerRecords = ref<AnswerRecord[]>([])
const questionStartTime = ref(0)
const timerProgress = ref(100)
const timerInterval = ref<number | null>(null)
const questionTimer = ref(0)
const timeLimit = ref(3000) // 3秒限時
const isAnswering = ref(false) // 防止重複答題的鎖定標記

const currentInstruction = computed(() => {
  if (!isTestActive.value) return ''
  return isTestModeFontColor.value 
    ? '請選擇文字的「顏色」' 
    : '請選擇文字的「內容」'
})

const accuracy = computed(() => {
  const total = correctAnswers.value + wrongAnswers.value
  return total > 0 ? Math.round((correctAnswers.value / total) * 100) : 0
})

const averageReactionTime = computed(() => {
  if (answerRecords.value.length === 0) return 0
  const totalTime = answerRecords.value.reduce((sum, record) => sum + record.reactionTime, 0)
  return Math.round(totalTime / answerRecords.value.length)
})

function generateStroopItem(): StroopItem {
  const textColor = colors[Math.floor(Math.random() * colors.length)]
  
  // 防禦性檢查，確保 textColor 存在
  if (!textColor) {
    // 如果隨機選擇失敗，使用預設值
    return {
      text: '紅',
      fontColor: '#FF0000',
      correctAnswer: '紅',
      isInterference: false
    }
  }
  
  // 50% 概率生成干擾題（文字與顏色不符）
  const isInterference = Math.random() < 0.5
  
  let fontColor: string
  let correctAnswer: string
  
  if (isInterference) {
    // 干擾題：字體顏色與文字內容不同
    const differentColors = colors.filter(c => c.name !== textColor.name)
    const fontColorObj = differentColors.length > 0 
      ? differentColors[Math.floor(Math.random() * differentColors.length)]
      : colors[0]; // Fallback to colors[0] if no different colors are found
    fontColor = fontColorObj!.color;
  } else {
    // 一致題：字體顏色與文字內容相同
    fontColor = textColor.color
  }
  
  // 根據當前測試模式確定正確答案
  correctAnswer = isTestModeFontColor.value ? getColorNameByColor(fontColor) : textColor.name
  
  return {
    text: textColor.name,
    fontColor: fontColor,
    correctAnswer: correctAnswer,
    isInterference: isInterference
  }
}

function getColorNameByColor(color: string): string {
  const colorObj = colors.find(c => c.color === color)
  return colorObj ? colorObj.name : ''
}

function startTest() {
  isTestActive.value = true
  testCompleted.value = false
  currentQuestion.value = 0
  correctAnswers.value = 0
  wrongAnswers.value = 0
  answerRecords.value = []
  
  nextQuestion()
}

function nextQuestion() {
  if (currentQuestion.value >= totalQuestions.value) {
    endTest()
    return
  }
  
  currentQuestion.value++
  
  // 隨機切換測試模式（每5題切換一次）
  if (currentQuestion.value % 5 === 1) {
    isTestModeFontColor.value = Math.random() < 0.5
  }
  
  // 重置答題狀態，準備新問題
  isAnswering.value = false
  
  currentStroopItem.value = generateStroopItem()
  questionStartTime.value = Date.now()
  startTimer()
}

function startTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  questionTimer.value = 0
  timerProgress.value = 100
  
  timerInterval.value = setInterval(() => {
    questionTimer.value += 50
    timerProgress.value = Math.max(0, 100 - (questionTimer.value / timeLimit.value) * 100)
    
    if (questionTimer.value >= timeLimit.value) {
      // 超時處理，但只有在未答題狀態下
      if (!isAnswering.value) {
        selectAnswer(null)
      }
      // 清除定時器，避免重複觸發
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
      }
    }
  }, 50)
}

function selectAnswer(selectedColor: Color | null) {
  if (!currentStroopItem.value || !isTestActive.value || isAnswering.value) return
  
  // 設置答題鎖定，防止重複處理
  isAnswering.value = true
  
  // 清除定時器並立即重置進度條
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  timerProgress.value = 0
  
  const reactionTime = Date.now() - questionStartTime.value
  const userAnswer = selectedColor ? selectedColor.name : ''
  const isCorrect = userAnswer === currentStroopItem.value.correctAnswer
  
  if (isCorrect) {
    correctAnswers.value++
  } else {
    wrongAnswers.value++
  }
  
  answerRecords.value.push({
    question: currentStroopItem.value,
    userAnswer: userAnswer,
    isCorrect: isCorrect,
    reactionTime: reactionTime
  })
  
  // 短暫顯示結果，然後下一題
  setTimeout(() => {
    // 重置答題鎖定，準備下一題
    isAnswering.value = false
    nextQuestion()
  }, 500)
}

function endTest() {
  isTestActive.value = false
  testCompleted.value = true
  currentStroopItem.value = null
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
}

function resetTest() {
  isTestActive.value = false
  testCompleted.value = false
  currentQuestion.value = 0
  correctAnswers.value = 0
  wrongAnswers.value = 0
  answerRecords.value = []
  currentStroopItem.value = null
  timerProgress.value = 100
  isAnswering.value = false // 重置答題鎖定
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
}

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  isAnswering.value = false // 清理答題鎖定
})
</script>

<style scoped>
.stroop-test-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--md3-outline-variant);
}

.test-title {
  margin: 0;
  color: var(--md3-on-surface);
  font-size: 1.5rem;
  font-weight: 600;
}

.test-stats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.test-area {
  text-align: center;
}

.question-info {
  margin-bottom: 2rem;
}

.instruction {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--md3-on-surface);
  margin-bottom: 0.5rem;
}

.question-counter {
  font-size: 1rem;
  color: var(--md3-on-surface-variant);
}

.stroop-display {
  margin: 2rem 0;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  --shape-corner: var(--mdui-shape-corner-large, 12px);
}

.stroop-text {
  font-size: 4rem;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
  user-select: none;
}

.answer-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.color-button {
  min-height: 60px;
  font-size: 1.2rem;
  font-weight: bold;
  --shape-corner: var(--mdui-shape-corner-medium, 8px);
}

.test-results-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.test-results {
  padding: 2rem;
  --shape-corner: var(--mdui-shape-corner-large, 12px);
  min-width: 300px;
  max-width: 400px;
  width: 100%;
}

.results-content {
  text-align: center;
}

.results-content h4 {
  margin: 0 0 1rem 0;
  color: var(--md3-on-primary-container);
  font-size: 1.3rem;
  text-align: center;
}

.results-stats {
  text-align: center;
  display: flex;
  justify-content: center;
}

.results-stats mdui-list {
  width: 100%;
  max-width: 250px;
}

@media (max-width: 480px) {
  .stroop-text {
    font-size: 3rem;
  }
  
  .answer-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .test-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>