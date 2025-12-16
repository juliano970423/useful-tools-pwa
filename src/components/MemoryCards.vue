<template>
  <div class="memory-cards-container">
    <div class="game-header">
      <h3 class="game-title">記憶卡片配對</h3>
      <div class="game-stats">
        <mdui-chip>配對: {{ matchedPairs }} / {{ totalPairs }}</mdui-chip>
        <mdui-chip>翻牌次數: {{ flipCount }}</mdui-chip>
        <mdui-chip>用時: {{ formatTime(gameTime) }}</mdui-chip>
      </div>
    </div>

    <mdui-card class="game-controls" variant="filled">
      <div class="controls-content">
        <div class="difficulty-selector">
          <label class="control-label">難度</label>
          <mdui-segmented-button-group 
            :value="difficulty"
            selects="single"
            @change="handleDifficultyChange"
          >
            <mdui-segmented-button value="easy">簡單</mdui-segmented-button>
            <mdui-segmented-button value="medium">中等</mdui-segmented-button>
            <mdui-segmented-button value="hard">困難</mdui-segmented-button>
          </mdui-segmented-button-group>
        </div>
        <div class="control-buttons">
          <mdui-button 
            variant="filled" 
            @click="startGame" 
            :disabled="isGameActive"
            icon="play_arrow"
          >
            開始遊戲
          </mdui-button>
          <mdui-button 
            variant="outlined" 
            @click="resetGame"
            icon="refresh"
          >
            重置
          </mdui-button>
        </div>
      </div>
    </mdui-card>

    <div v-if="isGameActive" class="game-board">
      <div 
        v-if="cards.length > 0"
        class="cards-grid"
        :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }"
      >
        <mdui-card
          v-for="(card, index) in cards"
          :key="card.id + '-' + index"
          class="card"
          :class="{
            'flipped': card.isFlipped || card.isMatched,
            'matched': card.isMatched,
            'disabled': isProcessing || card.isMatched
          }"
          :clickable="!isProcessing && !card.isMatched"
          variant="elevated"
          @click="flipCard(card)"
        >
          <div class="card-inner">
            <div class="card-front">
              <span class="card-icon">?</span>
            </div>
            <div class="card-back">
              <div class="card-pattern" v-html="card.pattern"></div>
            </div>
          </div>
        </mdui-card>
      </div>
    </div>

    <div v-if="gameCompleted" class="game-results-container">
      <mdui-card class="game-results" variant="filled">
        <div class="results-content">
          <mdui-icon name="celebration" class="results-icon"></mdui-icon>
          <h3 class="results-title">恭喜完成！</h3>
          <div class="results-stats">
            <mdui-list>
              <mdui-list-item icon="touch_app">
                <div class="stat-label">總翻牌次數</div>
                <div class="stat-value">{{ flipCount }}</div>
              </mdui-list-item>
              <mdui-list-item icon="schedule">
                <div class="stat-label">總用時</div>
                <div class="stat-value">{{ formatTime(gameTime) }}</div>
              </mdui-list-item>
              <mdui-list-item icon="analytics">
                <div class="stat-label">平均每次配對</div>
                <div class="stat-value">{{ averageFlipsPerPair }} 次</div>
              </mdui-list-item>
              <mdui-list-item icon="stars">
                <div class="stat-label">評級</div>
                <div class="stat-value rating">{{ getPerformanceRating() }}</div>
              </mdui-list-item>
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
import 'mdui/components/segmented-button.js'
import 'mdui/components/segmented-button-group.js'
import 'mdui/components/chip.js'
import 'mdui/components/list.js'
import 'mdui/components/list-item.js'
import 'mdui/components/icon.js'

interface Card {
  id: number
  pattern: string
  isFlipped: boolean
  isMatched: boolean
  pairId: number
}

const difficulty = ref<'easy' | 'medium' | 'hard'>('easy')
const isGameActive = ref(false)
const isProcessing = ref(false)
const cards = ref<Card[]>([])
const flippedCards = ref<Card[]>([])
const matchedPairs = ref(0)
const flipCount = ref(0)
const gameTime = ref(0)
const gameStartTime = ref(0)
const gameCompleted = ref(false)
const timerInterval = ref<number | null>(null)

const gridSize = computed(() => {
  switch (difficulty.value) {
    case 'easy': return 4
    case 'medium': return 6
    case 'hard': return 8
    default: return 4
  }
})

const totalPairs = computed(() => {
  return (gridSize.value * gridSize.value) / 2
})

const totalCards = computed(() => {
  return gridSize.value * gridSize.value
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function generateCardPatterns(count: number): Array<{ pattern: string; pairId: number }> {
  const patterns = []
  const shapeTypes = ['circle', 'square', 'triangle', 'star', 'diamond', 'heart', 'hexagon', 'cross']
  const usedShapes = shapeTypes.slice(0, Math.min(count, shapeTypes.length))
  
  if (count <= 0) {
    return []
  }
  
  // 為每個圖案生成配對
  for (let i = 0; i < count; i++) {
    try {
      const shape = usedShapes[i % usedShapes.length]
      const color = `hsl(${(i * 360 / count)}, 70%, 60%)`
      const rotation = Math.floor(Math.random() * 4) * 45
      const size = 40 + (Math.random() * 20)
      
      const pattern = generateSVGPattern(shape!, color, rotation, size)
      
      // 每個圖案生成兩張卡片（一對）
      patterns.push({ pattern, pairId: i })
      patterns.push({ pattern, pairId: i })
    } catch (error) {
      // 使用簡單的備用圖案
      const fallbackPattern = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="30" fill="hsl(${i * 360 / count}, 70%, 60%)"/></svg>`
      patterns.push({ pattern: fallbackPattern, pairId: i })
      patterns.push({ pattern: fallbackPattern, pairId: i })
    }
  }
  
  // 洗牌
  return patterns.sort(() => Math.random() - 0.5)
}

function generateSVGPattern(shape: string, color: string, rotation: number, size: number): string {
  try {
    const center = 50
    const radius = size / 2
    
    let svgContent = ''
    
    switch (shape) {
      case 'circle':
        svgContent = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${color}"/>`
        break
      case 'square':
        svgContent = `<rect x="${center - radius}" y="${center - radius}" width="${size}" height="${size}" fill="${color}" transform="rotate(${rotation} ${center} ${center})"/>`
        break
      case 'triangle':
        const trianglePoints = `${center},${center - radius} ${center - radius},${center + radius} ${center + radius},${center + radius}`
        svgContent = `<polygon points="${trianglePoints}" fill="${color}" transform="rotate(${rotation} ${center} ${center})"/>`
        break
      case 'star':
        svgContent = generateStarPath(center, center, radius, color, rotation)
        break
      case 'diamond':
        const diamondPoints = `${center},${center - radius} ${center + radius},${center} ${center},${center + radius} ${center - radius},${center}`
        svgContent = `<polygon points="${diamondPoints}" fill="${color}" transform="rotate(${rotation} ${center} ${center})"/>`
        break
      case 'heart':
        svgContent = generateHeartPath(center, center, radius, color, rotation)
        break
      case 'hexagon':
        svgContent = generateHexagonPath(center, center, radius, color, rotation)
        break
      case 'cross':
        svgContent = generateCrossPath(center, center, radius, color, rotation)
        break
      default:
        svgContent = `<circle cx="${center}" cy="${center}" r="${radius}" fill="${color}"/>`
    }
    
    return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`
  } catch (error) {
    // 返回一個簡單的圓形作為備用
    return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="20" fill="red"/></svg>`
  }
}

function generateStarPath(cx: number, cy: number, outerRadius: number, color: string, rotation: number): string {
  const innerRadius = outerRadius * 0.4
  const points = 5
  let path = ''
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2 + (rotation * Math.PI / 180)
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    
    if (i === 0) {
      path += `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  }
  path += ' Z'
  
  return `<path d="${path}" fill="${color}"/>`
}

function generateHeartPath(cx: number, cy: number, size: number, color: string, rotation: number): string {
  const scale = size / 25
  const path = `M ${cx},${cy + 10 * scale} 
    C ${cx},${cy + 10 * scale} ${cx - 20 * scale},${cy - 15 * scale} ${cx},${cy - 5 * scale}
    C ${cx + 20 * scale},${cy - 15 * scale} ${cx},${cy + 10 * scale} ${cx},${cy + 10 * scale} Z`
  
  return `<path d="${path}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>`
}

function generateHexagonPath(cx: number, cy: number, radius: number, color: string, rotation: number): string {
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 2 + (rotation * Math.PI / 180)
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  
  return `<polygon points="${points.join(' ')}" fill="${color}"/>`
}

function generateCrossPath(cx: number, cy: number, radius: number, color: string, rotation: number): string {
  const thickness = radius * 0.3
  const cross = `
    <rect x="${cx - thickness/2}" y="${cy - radius}" width="${thickness}" height="${radius * 2}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>
    <rect x="${cx - radius}" y="${cy - thickness/2}" width="${radius * 2}" height="${thickness}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>
  `
  return cross
}

function startGame() {
  try {
    isGameActive.value = true
    gameCompleted.value = false
    matchedPairs.value = 0
    flipCount.value = 0
    gameTime.value = 0
    flippedCards.value = []
    
    // 強制重置卡片
    cards.value = []
    
    // 延遲一下確保DOM更新
    setTimeout(() => {
      initializeCards()
      startTimer()
    }, 100)
    
  } catch (error) {
    isGameActive.value = false
  }
}

function initializeCards() {
  try {
    const patterns = generateCardPatterns(totalPairs.value)
    
    if (patterns.length === 0) {
      throw new Error('No patterns generated')
    }
    
    cards.value = patterns.map((pattern, index) => ({
      id: index,
      pattern: pattern.pattern,
      isFlipped: false,
      isMatched: false,
      pairId: pattern.pairId
    }))
  } catch (error) {
    throw error
  }
}

function startTimer() {
  gameStartTime.value = Date.now()
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  timerInterval.value = setInterval(() => {
    gameTime.value = Math.floor((Date.now() - gameStartTime.value) / 1000)
  }, 1000)
}

function flipCard(card: Card) {
  if (isProcessing.value || card.isFlipped || card.isMatched) {
    return
  }
  
  card.isFlipped = true
  flippedCards.value.push(card)
  flipCount.value++
  
  if (flippedCards.value.length === 2) {
    isProcessing.value = true
    checkMatch()
  }
}

function checkMatch() {
  const [firstCard, secondCard] = flippedCards.value
  
  if (!firstCard || !secondCard) {
    // 如果任一卡片未定義，重置狀態
    flippedCards.value = []
    isProcessing.value = false
    return
  }
  
  if (firstCard.pairId === secondCard.pairId) {
    // 配對成功
    setTimeout(() => {
      if (firstCard) firstCard.isMatched = true
      if (secondCard) secondCard.isMatched = true
      matchedPairs.value++
      flippedCards.value = []
      isProcessing.value = false
      
      // 檢查是否完成遊戲
      if (matchedPairs.value === totalPairs.value) {
        completeGame()
      }
    }, 500)
  } else {
    // 配對失敗
    setTimeout(() => {
      if (firstCard) firstCard.isFlipped = false
      if (secondCard) secondCard.isFlipped = false
      flippedCards.value = []
      isProcessing.value = false
    }, 1000)
  }
}

function completeGame() {
  isGameActive.value = false
  gameCompleted.value = true
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
}

function resetGame() {
  isGameActive.value = false
  gameCompleted.value = false
  matchedPairs.value = 0
  flipCount.value = 0
  gameTime.value = 0
  flippedCards.value = []
  cards.value = []
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
}

function changeDifficulty(newDifficulty: string) {
  difficulty.value = newDifficulty as 'easy' | 'medium' | 'hard'
  resetGame()
}



function handleDifficultyChange(event: CustomEvent) {
  const newDifficulty = event.detail.value
  changeDifficulty(newDifficulty)
}

const averageFlipsPerPair = computed(() => {
  return matchedPairs.value > 0 ? Math.round(flipCount.value / matchedPairs.value * 10) / 10 : 0
})

function getPerformanceRating(): string {
  const efficiency = flipCount.value / (totalPairs.value * 2)
  if (efficiency <= 1.2) return '優秀'
  if (efficiency <= 1.5) return '良好'
  if (efficiency <= 2.0) return '一般'
  return '需要練習'
}

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.memory-cards-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--md3-outline-variant);
}

.game-title {
  margin: 0;
  color: rgb(var(--mdui-color-on-surface));
  font-size: 1.5rem;
  font-weight: 600;
}

.game-stats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.game-controls {
  margin-bottom: 2rem;
}

.controls-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.5rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--mdui-color-on-surface-variant));
  margin-bottom: 0.5rem;
  display: block;
}

.difficulty-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.game-board {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  width: 100%;
}

.cards-grid {
  display: grid;
  gap: 0.75rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-height: 100px;
  min-width: 100px;
  --shape-corner: var(--md-sys-shape-corner-large, 12px);
}

.card:hover:not(.disabled) {
  transform: scale(1.05);
}

.card.disabled {
  cursor: not-allowed;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.card-front {
  background: linear-gradient(135deg, rgb(var(--mdui-color-primary-container)), rgb(var(--mdui-color-secondary-container)));
  color: rgb(var(--mdui-color-on-primary-container));
  border-radius: 12px;
}

.card-back {
  background: rgb(var(--mdui-color-surface));
  transform: rotateY(180deg);
  border: 2px solid rgb(var(--mdui-color-outline-variant));
  border-radius: 12px;
}

.card.matched {
  border-color: rgb(var(--mdui-color-primary));
  background: rgb(var(--mdui-color-primary-container));
}

.card-icon {
  font-size: 2rem;
  font-weight: bold;
}

.card-pattern {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
}

.card-pattern :deep(svg) {
  max-width: 70%;
  max-height: 70%;
  width: auto;
  height: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.game-results-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.game-results {
  padding: 2rem;
  --shape-corner: var(--md-sys-shape-corner-extra-large, 16px);
  min-width: 320px;
  max-width: 400px;
  width: 100%;
}

.results-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.results-icon {
  font-size: 3rem;
  color: rgb(var(--mdui-color-primary));
}

.results-title {
  margin: 0;
  color: rgb(var(--mdui-color-on-surface));
  font-size: 1.5rem;
  font-weight: 600;
}

.results-stats {
  width: 100%;
}

.results-stats mdui-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: rgb(var(--mdui-color-on-surface-variant));
  font-size: 0.875rem;
}

.stat-value {
  color: rgb(var(--mdui-color-on-surface));
  font-size: 1rem;
  font-weight: 500;
}

.stat-value.rating {
  color: rgb(var(--mdui-color-primary));
  font-weight: 600;
}

@media (max-width: 768px) {
  .memory-cards-container {
    padding: 1rem;
  }
  
  .game-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .difficulty-selector {
    justify-content: center;
  }
  
  .control-buttons {
    justify-content: center;
  }
  
  .cards-grid {
    gap: 0.5rem;
  }
  
  .card {
    min-height: 80px;
    min-width: 80px;
  }
  
  .game-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .card {
    min-height: 70px;
    min-width: 70px;
  }
  
  .card-icon {
    font-size: 1.5rem;
  }
}
</style>