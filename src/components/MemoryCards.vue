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

    <div class="game-controls">
      <div class="difficulty-selector">
        <label>難度：</label>
        <mdui-segmented-button-group 
          :value="difficulty" 
          @change="changeDifficulty"
          selects="single"
        >
          <mdui-segmented-button value="easy">簡單 (4×4)</mdui-segmented-button>
          <mdui-segmented-button value="medium">中等 (6×6)</mdui-segmented-button>
          <mdui-segmented-button value="hard">困難 (8×8)</mdui-segmented-button>
        </mdui-segmented-button-group>
      </div>
      <div class="control-buttons">
        <mdui-button variant="filled" @click="startGame" :disabled="isGameActive">
          開始遊戲
        </mdui-button>
        <mdui-button variant="outlined" @click="resetGame">
          重置
        </mdui-button>
      </div>
    </div>

    <div v-if="isGameActive" class="game-board">
      <div 
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
          <h4>恭喜完成！</h4>
          <div class="results-stats">
            <mdui-list>
              <mdui-list-item>總翻牌次數: {{ flipCount }}</mdui-list-item>
              <mdui-list-item>總用時: {{ formatTime(gameTime) }}</mdui-list-item>
              <mdui-list-item>平均每次配對: {{ averageFlipsPerPair }} 次</mdui-list-item>
              <mdui-list-item>評級: {{ getPerformanceRating() }}</mdui-list-item>
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
  
  // 為每個圖案生成配對
  for (let i = 0; i < count; i++) {
    const shape = usedShapes[i % usedShapes.length]
    const color = `hsl(${(i * 360 / count)}, 70%, 60%)`
    const rotation = Math.floor(Math.random() * 4) * 45
    const size = 40 + (Math.random() * 20)
    
    const pattern = generateSVGPattern(shape!, color, rotation, size)
    
    // 每個圖案生成兩張卡片（一對）
    patterns.push({ pattern, pairId: i })
    patterns.push({ pattern, pairId: i })
  }
  
  // 洗牌
  return patterns.sort(() => Math.random() - 0.5)
}

function generateSVGPattern(shape: string, color: string, rotation: number, size: number): string {
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
  isGameActive.value = true
  gameCompleted.value = false
  matchedPairs.value = 0
  flipCount.value = 0
  gameTime.value = 0
  flippedCards.value = []
  
  initializeCards()
  startTimer()
}

function initializeCards() {
  const patterns = generateCardPatterns(totalPairs.value)
  cards.value = patterns.map((pattern, index) => ({
    id: index,
    pattern: pattern.pattern,
    isFlipped: false,
    isMatched: false,
    pairId: pattern.pairId
  }))
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
      firstCard.isMatched = true
      secondCard.isMatched = true
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
      firstCard.isFlipped = false
      secondCard.isFlipped = false
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
  color: var(--md3-on-surface);
  font-size: 1.5rem;
  font-weight: 600;
}

.game-stats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.difficulty-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--md3-on-surface);
}

.control-buttons {
  display: flex;
  gap: 1rem;
}

.game-board {
  display: flex;
  justify-content: center;
}

.cards-grid {
  display: grid;
  gap: 0.5rem;
  max-width: 600px;
  width: 100%;
}

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  transition: transform 0.2s ease;
  cursor: pointer;
  --shape-corner: var(--mdui-shape-corner-medium, 8px);
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
}

.card-front {
  background: linear-gradient(135deg, var(--md3-primary-container), var(--md3-secondary-container));
  color: var(--md3-on-primary-container);
  --shape-corner: var(--mdui-shape-corner-medium, 8px);
}

.card-back {
  background: var(--md3-surface);
  transform: rotateY(180deg);
  border: 2px solid var(--md3-outline-variant);
  --shape-corner: var(--mdui-shape-corner-medium, 8px);
}

.card.matched {
  border-color: var(--md3-primary);
  background: var(--md3-primary-container);
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
}

.card-pattern :deep(svg) {
  max-width: 80%;
  max-height: 80%;
  width: auto;
  height: auto;
}

.game-results-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.game-results {
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

@media (max-width: 768px) {
  .memory-cards-container {
    padding: 1rem;
  }
  
  .game-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .difficulty-selector {
    justify-content: center;
  }
  
  .control-buttons {
    justify-content: center;
  }
  
  .cards-grid {
    gap: 0.25rem;
  }
  
  .game-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .card-icon {
    font-size: 1.5rem;
  }
}
</style>