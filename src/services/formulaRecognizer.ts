import axios from 'axios'
import type { AxiosInstance } from 'axios'

export interface FormulaRecognizerConfig {
  baseUrl: string
  apiKey: string
  model: string
  requireStylus?: boolean
}

export interface ModelInfo {
  id: string
  name?: string
  description?: string
}

export interface RecognitionResult {
  latex: string
  confidence?: number
}

export class FormulaRecognizerService {
  private client: AxiosInstance
  private config: FormulaRecognizerConfig

  constructor(config: FormulaRecognizerConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      }
    })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<FormulaRecognizerConfig>) {
    this.config = { ...this.config, ...config }
    this.client.defaults.baseURL = config.baseUrl || this.config.baseUrl
    this.client.defaults.headers['Authorization'] = `Bearer ${config.apiKey || this.config.apiKey}`
  }

  /**
   * 獲取可用模型列表
   */
  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get('/models')

      console.log('API 回應:', response.data)

      // OpenAI 標準格式：{ data: [...] }
      if (response.data && Array.isArray(response.data.data)) {
        const models = response.data.data.map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description
        }))
        console.log('解析到的模型:', models)
        return models
      }

      // 某些 API 可能直接返回陣列
      if (Array.isArray(response.data)) {
        const models = response.data.map((model: any) => ({
          id: model.id || model.name,
          name: model.name || model.id || model.display_name,
          description: model.description || model.info
        }))
        console.log('解析到的模型 (陣列格式):', models)
        return models
      }

      console.warn('未知的模型列表格式:', response.data)
      return []
    } catch (error) {
      console.error('獲取模型列表失敗:', error)
      
      // 拋出錯誤，讓 UI 層處理
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 401) {
          throw new Error('API Key 無效或已過期')
        } else if (status === 404) {
          throw new Error('模型列表 API 不存在 (404)')
        } else {
          throw new Error(`獲取模型列表失敗：${error.message}`)
        }
      }
      throw error
    }
  }

  /**
   * 過濾支援視覺的模型（根據模型名稱推斷）
   */
  filterVisionModels(models: ModelInfo[]): ModelInfo[] {
    const visionKeywords = ['vision', '4o', '4-vision', 'gpt-4-turbo', 'claude-3', 'sonnet', 'gemini', '4v', '4.5v', '4.6v', 'glm']
    
    return models.filter(model => {
      const idLower = model.id.toLowerCase()
      const nameLower = (model.name || '').toLowerCase()
      
      // 檢查是否包含視覺相關關鍵字
      const hasVisionKeyword = visionKeywords.some(keyword => 
        idLower.includes(keyword) || nameLower.includes(keyword)
      )
      
      // gpt-4 系列通常都支援視覺
      const isGpt4 = idLower.includes('gpt-4') || nameLower.includes('gpt-4')
      
      // GLM 系列通常都支援視覺
      const isGlm = idLower.includes('glm') || nameLower.includes('glm')
      
      return hasVisionKeyword || isGpt4 || isGlm
    })
  }

  /**
   * 將圖片轉換為 base64
   */
  private imageToBase64(image: File | HTMLCanvasElement): Promise<string> {
    return new Promise((resolve, reject) => {
      if (image instanceof File) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(image)
      } else {
        resolve(image.toDataURL('image/png'))
      }
    })
  }

  /**
   * 識別手寫公式
   * @param image - 圖片文件或 canvas
   * @param prompt - 自定義提示詞
   */
  async recognize(image: File | HTMLCanvasElement, prompt?: string): Promise<RecognitionResult> {
    const base64Image = await this.imageToBase64(image)

    const systemPrompt = `You are a mathematical formula OCR expert. Your task is to convert handwritten math formulas in images to LaTeX code.

IMPORTANT RULES:
- Output ONLY the LaTeX code, nothing else
- Do not include any explanations, introductions, or conclusions
- Do not use markdown code blocks (no \`\`\`latex or \`\`\`)
- Do not wrap in $ or $$ symbols
- Just return the raw LaTeX formula`

    const userPrompt = prompt || 'Convert this handwritten mathematical formula to LaTeX. Output ONLY the LaTeX code:'

    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.1
      })

      const latex = response.data.choices?.[0]?.message?.content || ''
      
      // 清理回應，提取 LaTeX 代碼
      const cleanedLatex = this.extractLatex(latex)

      return {
        latex: cleanedLatex,
        confidence: response.data.usage?.total_tokens ? 1 - (response.data.usage.total_tokens / 1000) : undefined
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API 請求失敗：${error.response?.data?.error?.message || error.message}`)
      }
      throw error
    }
  }

  /**
   * 從回應中提取 LaTeX 代碼
   */
  private extractLatex(content: string): string {
    let latex = content.trim()

    // 只移除 markdown 代碼塊標記
    latex = latex.replace(/```latex\s*/g, '').replace(/```\s*/g, '')

    // 移除開頭和結尾的空白和換行
    latex = latex.trim()

    return latex
  }

  /**
   * 測試連接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }
}

/**
 * 預設模型列表（OpenAI 相容 API）
 */
export const DEFAULT_MODELS = [
  { name: 'gpt-4o', value: 'gpt-4o' },
  { name: 'gpt-4o-mini', value: 'gpt-4o-mini' },
  { name: 'gpt-4-vision-preview', value: 'gpt-4-vision-preview' },
  { name: 'Custom (自定義)', value: 'custom' }
]
