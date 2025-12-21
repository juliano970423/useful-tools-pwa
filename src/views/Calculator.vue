<template>
  <div>
    <NavBar />
    
    <main style="padding: 16px; max-width: 600px; margin: 0 auto;">
      <h1 style="text-align: center; margin-bottom: 24px;">計算機</h1>
      
      <mdui-card>
        <div style="padding: 24px;">
          <div style="margin-bottom: 24px;">
            <label style="display: block; margin-bottom: 8px;">表達式</label>
            <mdui-text-field
              v-model="expression"
              placeholder="輸入數學表達式"
              variant="outlined"
              full-width
            ></mdui-text-field>
            
            <mdui-text-field
              :value="result"
              readonly
              label="結果"
              variant="filled"
              full-width
              style="margin-top: 16px;"
            ></mdui-text-field>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
              <mdui-button @click="appendValue('sin(')" variant="elevated">sin</mdui-button>
              <mdui-button @click="appendValue('cos(')" variant="elevated">cos</mdui-button>
              <mdui-button @click="appendValue('tan(')" variant="elevated">tan</mdui-button>
              <mdui-button @click="appendValue('ln(')" variant="elevated">ln</mdui-button>
              
              <mdui-button @click="appendValue('7')" variant="elevated">7</mdui-button>
              <mdui-button @click="appendValue('8')" variant="elevated">8</mdui-button>
              <mdui-button @click="appendValue('9')" variant="elevated">9</mdui-button>
              <mdui-button @click="appendValue('/')" variant="elevated">÷</mdui-button>
              
              <mdui-button @click="appendValue('4')" variant="elevated">4</mdui-button>
              <mdui-button @click="appendValue('5')" variant="elevated">5</mdui-button>
              <mdui-button @click="appendValue('6')" variant="elevated">6</mdui-button>
              <mdui-button @click="appendValue('*')" variant="elevated">×</mdui-button>
              
              <mdui-button @click="appendValue('1')" variant="elevated">1</mdui-button>
              <mdui-button @click="appendValue('2')" variant="elevated">2</mdui-button>
              <mdui-button @click="appendValue('3')" variant="elevated">3</mdui-button>
              <mdui-button @click="appendValue('-')" variant="elevated">−</mdui-button>
              
              <mdui-button @click="appendValue('0')" variant="elevated">0</mdui-button>
              <mdui-button @click="appendValue('.')" variant="elevated">.</mdui-button>
              <mdui-button @click="calculateResult" variant="filled">=</mdui-button>
              
              <mdui-button @click="appendValue('sqrt(')" variant="elevated">√</mdui-button>
              <mdui-button @click="appendValue('log(')" variant="elevated">log</mdui-button>
              <mdui-button @click="appendValue('π')" variant="elevated">π</mdui-button>
              <mdui-button @click="appendValue('e')" variant="elevated">e</mdui-button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 16px;">
              <mdui-button @click="clearExpression" variant="outlined">清除</mdui-button>
              <mdui-button @click="deleteLastChar" variant="outlined">刪除</mdui-button>
              <mdui-button @click="appendValue('(')" variant="outlined">(</mdui-button>
              <mdui-button @click="appendValue(')')" variant="outlined">)</mdui-button>
              <mdui-button @click="appendValue('π')" variant="outlined">π</mdui-button>
              <mdui-button @click="appendValue('e')" variant="outlined">e</mdui-button>
            </div>
          </div>
        </div>
      </mdui-card>
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

// 安全的數學表達式計算
const calculate = () => {
  if (!expression.value) return
  
  try {
    // 創建安全的數學環境
    const MathContext = {
      Math: Math,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      log: Math.log10,
      ln: Math.log,
      sqrt: Math.sqrt,
      PI: Math.PI,
      E: Math.E
    }
    
    // 轉換表達式
    let expr = expression.value
      .replace(/sin\(/g, 'sin(')
      .replace(/cos\(/g, 'cos(')
      .replace(/tan\(/g, 'tan(')
      .replace(/log\(/g, 'log(')
      .replace(/ln\(/g, 'ln(')
      .replace(/sqrt\(/g, 'sqrt(')
      .replace(/π/g, 'PI')
      .replace(/e/g, 'E')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
    
    // 使用 Function 構造函數創建安全的計算環境
    const calcFunction = new Function(...Object.keys(MathContext), `return ${expr}`)
    const calcResult = calcFunction(...Object.values(MathContext))
    
    // 驗證結果是否為有效數字
    if (typeof calcResult === 'number' && !isNaN(calcResult) && isFinite(calcResult)) {
      result.value = calcResult.toString()
    } else {
      result.value = '錯誤'
    }
  } catch (error) {
    result.value = '錯誤'
  }
}
</script>

<style scoped>
/* 僅保留基本佈局，使用MDUI原生樣式 */
@media (max-width: 480px) {
  main {
    padding: 8px;
  }
}
</style>