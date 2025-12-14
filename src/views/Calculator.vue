<template>
  <div class="calculator-container">
    <NavBar />

    <main class="calculator-main">
      <div class="calculator-wrapper">
        <mdui-card class="calculator-card">
          <div class="display-section">
            <label class="display-label">表達式</label>
            <mdui-text-field
              v-model="expression"
              class="expression-input"
              placeholder="輸入數學表達式"
              variant="outlined"
            ></mdui-text-field>
            
            <mdui-text-field
              class="result-field"
              :value="result"
              readonly
              label="結果"
              variant="filled"
            ></mdui-text-field>
          </div>

          <div class="keypad-section">
            <div class="keypad-grid">
              <mdui-button class="calc-btn func-btn" @click="appendValue('sin(')" variant="elevated">sin</mdui-button>
              <mdui-button class="calc-btn func-btn" @click="appendValue('cos(')" variant="elevated">cos</mdui-button>
              <mdui-button class="calc-btn func-btn" @click="appendValue('tan(')" variant="elevated">tan</mdui-button>
              <mdui-button class="calc-btn func-btn" @click="appendValue('ln(')" variant="elevated">ln</mdui-button>
              
              <mdui-button class="calc-btn num-btn" @click="appendValue('7')" variant="elevated">7</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('8')" variant="elevated">8</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('9')" variant="elevated">9</mdui-button>
              <mdui-button class="calc-btn op-btn" @click="appendValue('/')" variant="elevated">÷</mdui-button>
              
              <mdui-button class="calc-btn num-btn" @click="appendValue('4')" variant="elevated">4</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('5')" variant="elevated">5</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('6')" variant="elevated">6</mdui-button>
              <mdui-button class="calc-btn op-btn" @click="appendValue('*')" variant="elevated">×</mdui-button>
              
              <mdui-button class="calc-btn num-btn" @click="appendValue('1')" variant="elevated">1</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('2')" variant="elevated">2</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('3')" variant="elevated">3</mdui-button>
              <mdui-button class="calc-btn op-btn" @click="appendValue('-')" variant="elevated">−</mdui-button>
              
              <mdui-button class="calc-btn num-btn" @click="appendValue('0')" variant="elevated">0</mdui-button>
              <mdui-button class="calc-btn num-btn" @click="appendValue('.')" variant="elevated">.</mdui-button>
              <mdui-button class="calc-btn op-btn" @click="calculateResult" variant="filled">=</mdui-button>
              <mdui-button class="calc-btn op-btn" @click="appendValue('+')" variant="elevated">+</mdui-button>
            </div>
            
            <div class="control-buttons">
              <mdui-button @click="clearExpression" variant="outlined">清除</mdui-button>
              <mdui-button @click="deleteLastChar" variant="outlined">刪除</mdui-button>
              <mdui-button @click="appendValue('(')" variant="outlined">(</mdui-button>
              <mdui-button @click="appendValue(')')" variant="outlined">)</mdui-button>
              <mdui-button @click="appendValue('π')" variant="outlined">π</mdui-button>
              <mdui-button @click="appendValue('e')" variant="outlined">e</mdui-button>
            </div>
          </div>
        </mdui-card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import 'mdui/components/button.js'
import 'mdui/components/card.js'
import 'mdui/components/text-field.js'

const expression = ref('')
const result = ref('')

const appendValue = (value: string) => {
  expression.value += value
}

const clearExpression = () => {
  expression.value = ''
  result.value = ''
}

const deleteLastChar = () => {
  expression.value = expression.value.slice(0, -1)
}

const calculateResult = () => {
  try {
    // 簡單的數學表達式計算
    let expr = expression.value
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/ln/g, 'Math.log')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
    
    // eslint-disable-next-line no-eval
    const calcResult = eval(expr)
    result.value = calcResult.toString()
  } catch (error) {
    result.value = '錯誤'
  }
}
</script>

<style scoped>
.calculator-container {
  min-height: 100vh;
  background: var(--md3-surface-variant);
}

.calculator-main {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.calculator-card {
  padding: 2rem;
  background: var(--md3-surface);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.display-section {
  margin-bottom: 2rem;
}

.display-label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--md3-on-surface);
  margin-bottom: 0.5rem;
  display: block;
}

.expression-input {
  margin-bottom: 1rem;
  width: 100%;
}

.result-field {
  width: 100%;
}

.keypad-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.calc-btn {
  min-height: 50px;
  font-size: 1.1rem;
  font-weight: 500;
}

.func-btn {
  background: var(--md3-secondary-container);
  color: var(--md3-on-secondary-container);
}

.num-btn {
  background: var(--md3-surface-variant);
  color: var(--md3-on-surface-variant);
}

.op-btn {
  background: var(--md3-primary);
  color: var(--md3-on-primary);
}

.control-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .calculator-main {
    padding: 1rem;
  }
  
  .calculator-card {
    padding: 1rem;
  }
  
  .keypad-grid {
    gap: 0.25rem;
  }
  
  .calc-btn {
    min-height: 45px;
    font-size: 1rem;
  }
}
</style>