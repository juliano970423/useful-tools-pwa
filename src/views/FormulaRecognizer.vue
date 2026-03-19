<template>
  <div>
    <NavBar />

    <main style="padding: 16px; max-width: 1200px; margin: 0 auto;">
      <h1 style="text-align: center; margin-bottom: 24px;">手寫公式識別</h1>

            <div class="main-layout">
        <!-- 繪圖區域 -->
        <mdui-card class="canvas-card">
          <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="margin: 0;">繪製公式</h3>
              <div style="display: flex; gap: 8px;">
                <mdui-button @click="clearCanvas" variant="outlined" size="small">清除</mdui-button>
                <mdui-button @click="undoLastStroke" variant="outlined" size="small">撤銷</mdui-button>
              </div>
            </div>

            <div class="canvas-container">
              <!-- API 配置按鈕（右上角） -->
              <mdui-button-icon
                @click="toggleConfigPopover"
                icon="settings"
                variant="tonal"
                class="settings-btn"
                title="API 配置"
              ></mdui-button-icon>

              <canvas
                ref="canvasRef"
                @pointerdown="startDrawing"
                @pointermove="draw"
                @pointerup="stopDrawing"
                @pointerleave="stopDrawing"
                @pointercancel="stopDrawing"
                style="touch-action: none;"
              ></canvas>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <mdui-button @click="recognizeFormula" variant="filled" :loading="isRecognizing" style="flex: 1;">
                識別公式
              </mdui-button>
              <mdui-button @click="downloadImage" variant="tonal">下載圖片</mdui-button>
            </div>
          </div>
        </mdui-card>

        <!-- 預覽區域 -->
        <mdui-card class="preview-card">
          <div style="padding: 16px; height: 100%; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 12px 0;">識別結果</h3>

            <!-- LaTeX 預覽 -->
            <div
              ref="latexPreviewRef"
              class="latex-preview"
              style="flex: 1; margin-bottom: 12px; min-height: 150px; display: flex; align-items: center; justify-content: center;"
            >
              <span v-show="!result.latex" style="color: #999; font-size: 14px;">繪製公式後點擊識別</span>
            </div>

            <!-- LaTeX 代碼 -->
            <mdui-text-field
              :value="result.latex"
              @input="result.latex = $event.target.value"
              readonly
              label="LaTeX 代碼"
              variant="outlined"
              full-width
              multiline
              :rows="3"
            ></mdui-text-field>

            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <mdui-button @click="copyLatex" variant="outlined" style="flex: 1;">複製 LaTeX</mdui-button>
              <mdui-dropdown ref="downloadDropdown">
                <mdui-button variant="tonal" slot="trigger" end-icon="arrow_drop_down">下載圖片</mdui-button>
                <mdui-menu>
                  <mdui-menu-item value="svg">SVG 格式</mdui-menu-item>
                  <mdui-menu-item value="png">PNG 格式</mdui-menu-item>
                </mdui-menu>
              </mdui-dropdown>
            </div>

            <div v-if="result.confidence" style="margin-top: 8px; font-size: 12px; color: #666; text-align: center;">
              置信度：{{ Math.round(result.confidence * 100) }}%
            </div>
          </div>
        </mdui-card>
      </div>
      <mdui-dialog ref="configDialogRef" headline="API 配置">
        <div style="display: grid; gap: 12px; padding: 16px;">
          <mdui-text-field
            :value="tempConfig.baseUrl"
            @input="tempConfig.baseUrl = $event.target.value"
            label="API Base URL"
            placeholder="https://open.bigmodel.cn/api/paas/v4"
            variant="outlined"
            full-width
          ></mdui-text-field>

          <mdui-text-field
            :value="tempConfig.apiKey"
            @input="tempConfig.apiKey = $event.target.value"
            label="API Key"
            type="password"
            placeholder="sk-..."
            variant="outlined"
            full-width
          ></mdui-text-field>

          <div style="display: flex; gap: 8px; align-items: center;">
            <mdui-select
              :value="tempConfig.model"
              @change="tempConfig.model = $event.target.value"
              label="模型"
              variant="outlined"
              style="flex: 1;"
              placeholder="選擇或輸入模型"
            >
              <mdui-menu-item
                v-for="model in availableModels"
                :key="model.id"
                :value="model.id"
              >{{ model.name || model.id }}</mdui-menu-item>
              <mdui-menu-item value="custom">自定義...</mdui-menu-item>
            </mdui-select>

            <mdui-button-icon
              @click="loadModels"
              icon="refresh"
              variant="tonal"
              title="刷新模型列表"
            ></mdui-button-icon>
          </div>

          <mdui-text-field
            v-if="tempConfig.model === 'custom'"
            :value="tempCustomModel"
            @input="tempCustomModel = $event.target.value"
            label="自定義模型名稱"
            placeholder="glm-4.6v-flash"
            variant="outlined"
            full-width
            helper-text="常用：glm-4.6v-flash（免費視覺模型）"
          ></mdui-text-field>

          <div style="display: flex; align-items: center; gap: 8px;">
            <mdui-checkbox
              :checked="tempConfig.requireStylus"
              @change="tempConfig.requireStylus = $event.target.checked"
            ></mdui-checkbox>
            <span style="font-size: 14px;">僅允許觸控筆輸入</span>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <mdui-button @click="closeConfig" variant="outlined" style="flex: 1;">取消</mdui-button>
            <mdui-button @click="saveConfigAndClose" variant="filled" style="flex: 1;">保存配置</mdui-button>
          </div>
        </div>
      </mdui-dialog>

      <!-- 錯誤訊息 -->
      <mdui-snackbar ref="snackbarRef" type="error">{{ errorMessage }}</mdui-snackbar>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { FormulaRecognizerService, type FormulaRecognizerConfig } from '@/services/formulaRecognizer'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import html2canvas from 'html2canvas'
// mdui 組件已在 main.ts 中全局導入，無需重複導入

// 配置
const config = ref<FormulaRecognizerConfig>({
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',  // 智譜 AI 預設
  apiKey: '',
  model: '',
  requireStylus: false
})
const customModel = ref('')  // 用戶手動輸入的模型名稱
const downloadDropdown = ref(null)  // 下載選單引用

// Dialog 臨時配置（用於取消時恢復）
const tempConfig = ref<FormulaRecognizerConfig>({
  baseUrl: '',
  apiKey: '',
  model: '',
  requireStylus: false
})
const tempCustomModel = ref('')

// 模型列表
interface ModelInfo {
  id: string
  name?: string
}
const availableModels = ref<ModelInfo[]>([])

// 畫布相關
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const strokes = ref<Array<Array<{ x: number; y: number }>>>([])
const currentStroke = ref<Array<{ x: number; y: number }>>([])

// 識別相關
const isRecognizing = ref(false)
const result = ref({ latex: '', confidence: undefined })
const errorMessage = ref('')
const latexPreviewRef = ref<HTMLElement | null>(null)
const configDialogRef = ref(null)
const snackbarRef = ref(null)

// 可用模型（computed）

// 載入模型列表
const loadModels = async () => {
  if (!config.value.apiKey) {
    availableModels.value = []
    return
  }

  try {
    const service = new FormulaRecognizerService(config.value)
    const models = await service.listModels()

    if (models.length > 0) {
      availableModels.value = models
    } else {
      console.log('未找到任何模型')
      availableModels.value = []
    }
  } catch (error) {
    console.error('載入模型列表失敗:', error)
    availableModels.value = []
  }
}

// 監聽 API Key 變化，自動載入模型列表
watch(() => config.value.apiKey, (newKey, oldKey) => {
  if (newKey !== oldKey) {
    availableModels.value = []
  }
  if (newKey && newKey.length > 10) {
    loadModels()
  }
})

// 監聽 Base URL 變化，重新載入模型列表
watch(() => config.value.baseUrl, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    availableModels.value = []
  }
  if (config.value.apiKey) {
    loadModels()
  }
})

// 初始化
onMounted(() => {
  initCanvas()
  loadConfig()
})

// 初始化畫布
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const container = canvas.parentElement
  if (!container) return

  const rect = container.getBoundingClientRect()
  // 設置 canvas 實際像素尺寸
  canvas.width = rect.width || 600
  canvas.height = 500

  const context = canvas.getContext('2d')
  if (!context) return

  ctx.value = context
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.lineWidth = 3
  ctx.value.strokeStyle = '#000'

  // 填充白色背景
  ctx.value.fillStyle = '#ffffff'
  ctx.value.fillRect(0, 0, canvas.width, canvas.height)
}

// 繪圖相關函數
const getPointerPos = (e: PointerEvent | Touch): { x: number; y: number } => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }

  const rect = canvas.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

const startDrawing = (e: PointerEvent) => {
  e.preventDefault()

  // 檢查是否為觸控筆模式
  if (config.value.requireStylus) {
    // pointerType: 'mouse' = 滑鼠/觸控板，'pen' = 觸控筆，'touch' = 手指/手掌
    // 僅允許滑鼠和觸控筆，阻止手指/手掌
    if (e.pointerType === 'touch') {
      showError('請使用觸控筆繪圖')
      return
    }
  }

  isDrawing.value = true
  const pos = getPointerPos(e)
  currentStroke.value = [pos]
}

const draw = (e: PointerEvent) => {
  e.preventDefault()
  if (!isDrawing.value || !ctx.value) return

  const pos = getPointerPos(e)
  currentStroke.value.push(pos)

  const lastPos = currentStroke.value[currentStroke.value.length - 2]
  ctx.value.beginPath()
  ctx.value.moveTo(lastPos.x, lastPos.y)
  ctx.value.lineTo(pos.x, pos.y)
  ctx.value.stroke()
}

const stopDrawing = () => {
  if (!isDrawing.value) return
  isDrawing.value = false

  if (currentStroke.value.length > 0) {
    strokes.value.push([...currentStroke.value])
  }
  currentStroke.value = []
}

// 清除畫布
const clearCanvas = () => {
  if (!ctx.value || !canvasRef.value) return

  ctx.value.fillStyle = '#ffffff'
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  strokes.value = []
  currentStroke.value = []
  result.value.latex = ''
  result.value.confidence = undefined
}

// 撤銷
const undoLastStroke = () => {
  if (!ctx.value || !canvasRef.value || strokes.value.length === 0) return

  strokes.value.pop()

  // 重繪所有筆畫
  ctx.value.fillStyle = '#ffffff'
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  ctx.value.strokeStyle = '#000'
  ctx.value.lineWidth = 3

  strokes.value.forEach(stroke => {
    if (stroke.length < 2) return

    ctx.value.beginPath()
    ctx.value.moveTo(stroke[0].x, stroke[0].y)

    for (let i = 1; i < stroke.length; i++) {
      ctx.value.lineTo(stroke[i].x, stroke[i].y)
    }
    ctx.value.stroke()
  })
}

// 識別公式
const recognizeFormula = async () => {
  console.log('=== 開始識別公式 ===')
  
  if (!canvasRef.value) {
    console.error('canvasRef 為 null')
    return
  }

  if (!config.value.apiKey) {
    console.log('沒有 API Key，打開配置對話框')
    showError('請先配置 API Key')
    toggleConfigPopover()
    return
  }

  isRecognizing.value = true
  result.value.latex = ''
  console.log('已清空 result，準備發送請求...')

  try {
    // 如果有手動輸入模型名稱，優先使用；否則使用下拉選單選擇的模型
    const model = customModel.value.trim() || config.value.model
    console.log('使用的模型:', model)

    if (!model) {
      showError('請先選擇或輸入模型')
      return
    }

    const service = new FormulaRecognizerService({
      ...config.value,
      model
    })

    console.log('發送 API 請求...')
    const recognitionResult = await service.recognize(canvasRef.value)
    console.log('API 回應:', recognitionResult)

    // 強制更新 result 對象
    result.value = {
      latex: recognitionResult.latex,
      confidence: recognitionResult.confidence
    }
    console.log('result 已更新:', result.value)

    // 渲染 LaTeX
    await nextTick()
    console.log('準備渲染 LaTeX...')
    renderLatex(recognitionResult.latex)
    console.log('=== 識別完成 ===')
  } catch (error) {
    console.error('識別過程出錯:', error)
    let errorMsg = '識別失敗'

    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      // 檢查常見的 API 錯誤
      if (message.includes('429')) {
        errorMsg = '請求過於頻繁（429），請稍後再試'
      } else if (message.includes('401')) {
        errorMsg = 'API Key 無效或已過期（401）'
      } else if (message.includes('403')) {
        errorMsg = '無權限訪問（403），請檢查 API Key 權限'
      } else if (message.includes('404')) {
        errorMsg = '模型不存在或 API 路徑錯誤（404）'
      } else if (message.includes('500')) {
        errorMsg = '服務器錯誤（500），請稍後再試'
      } else if (message.includes('timeout')) {
        errorMsg = '請求超時，請檢查網絡連接'
      } else if (message.includes('network')) {
        errorMsg = '網絡錯誤，請檢查網絡連接'
      } else {
        errorMsg = error.message
      }
    }

    showError(errorMsg)
  } finally {
    isRecognizing.value = false
    console.log('isRecognizing = false')
  }
}

// 渲染 LaTeX
const renderLatex = (latex: string) => {
  if (!latexPreviewRef.value) {
    console.error('latexPreviewRef 為 null')
    return
  }

  try {
    // 先清空內容
    latexPreviewRef.value.innerHTML = ''
    
    katex.render(latex, latexPreviewRef.value, {
      throwOnError: false,
      displayMode: true,
      fontSize: 1.5
    })
    console.log('LaTeX 渲染成功')
  } catch (err) {
    console.error('KaTeX 渲染失敗:', err)
    latexPreviewRef.value.textContent = latex
  }
}

// 下載圖片
const downloadImage = () => {
  if (!canvasRef.value) return

  const link = document.createElement('a')
  link.download = 'formula.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}

// 複製 LaTeX
const copyLatex = async () => {
  if (!result.value.latex) {
    showError('沒有可複製的內容')
    return
  }

  try {
    // 優先使用現代 API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(result.value.latex)
      showError('已複製到剪貼簿')
      return
    }
  } catch (err) {
    console.warn('navigator.clipboard 失敗，嘗試降級方案:', err)
  }

  // 降級方案：使用 execCommand
  try {
    const textArea = document.createElement('textarea')
    textArea.value = result.value.latex
    
    // 使 textarea 不可見
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.style.opacity = '0'
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (successful) {
      showError('已複製到剪貼簿')
    } else {
      showError('複製失敗')
    }
  } catch (err) {
    console.error('降級方案失敗:', err)
    showError('複製失敗，請手動複製')
  }
}

// 下載 LaTeX 預覽為圖片
const downloadLatexImage = async (format: 'svg' | 'png' = 'svg') => {
  console.log('=== 開始下載 ===')
  console.log('格式:', format)
  console.log('result.value:', result.value)
  
  if (!result.value.latex) {
    showError('沒有可下載的內容')
    return
  }

  try {
    // 創建臨時容器渲染 LaTeX
    const tempDiv = document.createElement('div')
    tempDiv.style.display = 'inline-block'
    tempDiv.style.padding = '20px'
    tempDiv.style.background = 'white'
    tempDiv.style.position = 'fixed'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '0'
    tempDiv.style.fontFamily = 'KaTeX_Main, serif'
    document.body.appendChild(tempDiv)

    // 渲染 LaTeX - 使用 MathML 輸出（更兼容）
    katex.render(result.value.latex, tempDiv, {
      displayMode: true,
      throwOnError: false,
      output: 'htmlAndMathml'  // 輸出 HTML 和 MathML
    })

    console.log('渲染完成，HTML:', tempDiv.innerHTML.substring(0, 200))

    if (format === 'svg') {
      console.log('開始 SVG 下載...')
      // 獲取渲染後的 HTML，只提取 MathML 部分
      const mathmlMatch = tempDiv.innerHTML.match(/<math[\s\S]*?<\/math>/)
      const mathContent = mathmlMatch ? mathmlMatch[0] : tempDiv.innerHTML
      
      const rect = tempDiv.getBoundingClientRect()
      const width = Math.max(400, rect.width + 40)
      const height = Math.max(100, rect.height + 40)

      console.log('SVG 尺寸:', width, 'x', height)
      console.log('MathML 內容:', mathContent.substring(0, 100))

      document.body.removeChild(tempDiv)

      // 創建 SVG，將 MathML 內容嵌入
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
             width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="100%" height="100%" fill="white"/>
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="padding: 20px; display: flex; align-items: center; justify-content: center;">
              ${mathContent}
            </div>
          </foreignObject>
        </svg>`
      
      console.log('SVG 內容長度:', svg.length)
      
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'formula.svg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('SVG 下載完成')
      showError('已下載為 SVG 格式')
    } else if (format === 'png') {
      console.log('開始 PNG 下載，使用 html2canvas...')
      
      // 使用 html2canvas 將渲染後的 div 轉換為 PNG
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,  // 2x 清晰度
        logging: true,
        useCORS: true,
        ignoreElements: (element: Element) => {
          // 忽略 Vue 相關的元素
          return element.hasAttribute('data-v-') || element.classList.contains('v-')
        }
      })

      console.log('Canvas 尺寸:', canvas.width, 'x', canvas.height)

      document.body.removeChild(tempDiv)

      // 轉換為 PNG 並下載
      const dataUrl = canvas.toDataURL('image/png')
      console.log('PNG dataURL 長度:', dataUrl.length)
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'formula.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('PNG 下載完成')
      showError('已下載為 PNG 格式')
    }
  } catch (err) {
    console.error('下載失敗:', err)
    showError('下載失敗：' + err.message)
  }
}

// 配置管理

// 簡單的加密/解密函數（Base64 編碼，非安全加密，僅避免明文顯示）
const encodeApiKey = (key: string): string => {
  try {
    return btoa(encodeURIComponent(key))
  } catch {
    return key
  }
}

const decodeApiKey = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return encoded
  }
}

const saveConfig = () => {
  const configToSave = {
    baseUrl: config.value.baseUrl,
    apiKey: config.value.apiKey ? encodeApiKey(config.value.apiKey) : '',
    model: config.value.model,
    requireStylus: config.value.requireStylus,  // 保存觸控筆模式狀態
    customModel: customModel.value  // 保存手動輸入的模型名稱
  }
  localStorage.setItem('formula-recognizer-config', JSON.stringify(configToSave))
  // 保存後清空模型列表，下次載入時重新獲取
  availableModels.value = []
  showError('配置已保存')
}

const loadConfig = () => {
  const saved = localStorage.getItem('formula-recognizer-config')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 解密 API Key
      if (parsed.apiKey) {
        parsed.apiKey = decodeApiKey(parsed.apiKey)
      }
      // 載入配置
      config.value = {
        baseUrl: parsed.baseUrl || config.value.baseUrl,
        apiKey: parsed.apiKey || '',
        model: parsed.model || '',
        requireStylus: parsed.requireStylus || false
      }
      // 載入手動輸入的模型名稱
      if (parsed.customModel) {
        customModel.value = parsed.customModel
      }

      // 載入配置後自動獲取模型列表
      if (config.value.apiKey) {
        setTimeout(() => loadModels(), 500)
      }
    } catch {
      // ignore
    }
  }
}

// 顯示錯誤

// 切換 Dialog 顯示
const toggleConfigPopover = () => {
  if (configDialogRef.value) {
    // 打開 dialog 時，複製當前配置到臨時變量
    if (!configDialogRef.value.open) {
      tempConfig.value = { ...config.value }
      tempCustomModel.value = customModel.value
    }
    configDialogRef.value.open = !configDialogRef.value.open
  }
}

const closeConfig = () => {
  if (configDialogRef.value) {
    configDialogRef.value.open = false
  }
}

const saveConfigAndClose = () => {
  // 保存時，將臨時變量的值賦給正式配置
  config.value = { ...tempConfig.value }
  customModel.value = tempCustomModel.value
  saveConfig()
  closeConfig()
}

// 處理下載格式選擇
const handleDownloadFormat = (format: 'svg' | 'png') => {
  console.log('=== 下載事件 ===')
  console.log('下載格式:', format)
  
  if (format) {
    downloadLatexImage(format)
  }
}

// 監聽 dropdown 選擇
onMounted(() => {
  // 延遲添加事件監聽
  setTimeout(() => {
    const menuItems = document.querySelectorAll('mdui-menu-item')
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const value = (item as HTMLElement).getAttribute('value') as 'svg' | 'png'
        if (value === 'svg' || value === 'png') {
          handleDownloadFormat(value)
        }
      })
    })
  }, 500)
})

const showError = (message: string) => {
  errorMessage.value = message
  // 使用 nextTick 確保 DOM 更新後再開啟 snackbar
  nextTick(() => {
    const snackbar = snackbarRef.value as any
    if (snackbar) {
      snackbar.open = true
    }
  })
}
</script>

<style scoped>
/* 桌面佈局：左側繪圖，右側上下排列預覽和代碼 */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.canvas-container {
  position: relative;
  border: 2px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.settings-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

canvas {
  display: block;
  cursor: crosshair;
  touch-action: none;
}

/* 預覽卡片 */
.preview-card {
  height: 100%;
}

.latex-preview {
  padding: 24px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

/* 移動端佈局：垂直堆疊 */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  main {
    padding: 8px;
  }
}
</style>
