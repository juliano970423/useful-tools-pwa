<template>
  <div>
    <!-- 模式選擇 -->
    <div v-if="!currentQuestion && !showLevelSelector" style="text-align: center; padding: 32px 16px;">
      <h1 style="margin-bottom: 16px;">選擇學習方式</h1>
      <p style="margin-bottom: 32px; color: var(--mdui-color-on-surface-variant);">
        從6000單詞庫中精選詞彙，AI為你量身定制題目
      </p>
      
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto;">
        <mdui-button
          variant="filled"
          @click="showLevelSelector = true"
          icon="auto_awesome"
          full-width
          size="large"
        >
          開始AI智能練習
        </mdui-button>
      </div>
    </div>

    <!-- 難度選擇 -->
    <LevelSelector
      v-if="!currentQuestion && showLevelSelector"
      @start-infinite-mode="startInfiniteMode"
    />

    <!-- AI生成題目 -->
    <div v-if="!currentQuestion && showAIGenerator" style="text-align: center; padding: 32px 16px;">
      <h3>AI生成題目中...</h3>
      <p style="color: var(--mdui-color-on-surface-variant); margin: 16px 0;">
        正在為你量身定制個性化題目
      </p>
      <mdui-linear-progress indeterminate></mdui-linear-progress>
      <br>
      <mdui-button 
        variant="text" 
        @click="backToModeSelection"
        full-width
      >
        取消
      </mdui-button>
    </div>

    <!-- 題目顯示區域 -->
    <div v-if="currentQuestion" style="padding: 16px;">
      <!-- 進度顯示 -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 14px; color: var(--mdui-color-on-surface-variant);">題目進度</span>
          <span style="font-size: 14px; color: var(--mdui-color-on-surface-variant);">正確率: {{ Math.round(correctCount / (currentQuestionIndex + (showAnswer ? 1 : 0)) * 100) || 0 }}%</span>
        </div>
        <mdui-linear-progress 
          :value="(currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length * 100"
        ></mdui-linear-progress>
      </div>

      <!-- 題目內容 -->
      <div style="margin-bottom: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <mdui-chip variant="outlined">填空題</mdui-chip>
        </div>
        
        <div style="padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <p style="font-size: 1.25rem; line-height: 1.75rem; margin: 0;" ref="sentenceElement">
            <span v-for="(part, index) in sentenceParts" :key="index"
                  :class="{'blank-placeholder': part.type === 'blank', 'hover-word': part.type === 'word' && showAnswer}"
                  @mouseenter="part.type === 'word' && showAnswer ? showOptionWordInfo(part.text, $event) : null"
                  @mouseleave="part.type === 'word' && showAnswer ? hideWordInfo() : null">
              <span v-if="part.type === 'text'">{{ part.text }}</span>
              <strong v-else-if="part.type === 'blank'" style="color: var(--mdui-color-primary); text-decoration: underline;">{{ part.text }}</strong>
              <span v-else>{{ part.text }}</span>
            </span>
          </p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <mdui-button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            variant="outlined"
            @click="selectAnswer(option)"
            @mouseenter="showAnswer ? showOptionWordInfo(option, $event) : null"
            @mouseleave="showAnswer ? hideWordInfo() : null"
            :class="{
              'correct': showAnswer && option === currentQuestion.correctAnswer,
              'incorrect': showAnswer && option !== currentQuestion.correctAnswer && selectedAnswer === option
            }"
            full-width
            size="large"
          >
            {{ option }}
          </mdui-button>
        </div>
      </div>

      <!-- 答案反饋 -->
      <div v-if="showAnswer">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <mdui-icon 
            :name="selectedAnswer === currentQuestion.correctAnswer ? 'check_circle' : 'error'" 
            style="font-size: 1.25rem;"
            :style="{ color: selectedAnswer === currentQuestion.correctAnswer ? 'var(--mdui-color-secondary)' : 'var(--mdui-color-error)' }"
          ></mdui-icon>
          <span v-if="selectedAnswer === currentQuestion.correctAnswer">正確！</span>
          <span v-else>正確答案是：{{ currentQuestion.correctAnswer }}</span>
        </div>
        
        <mdui-button 
          variant="filled" 
          @click="nextQuestion"
          v-if="currentQuestionIndex < questions.length - 1"
          full-width
          size="large"
        >
          下一題
        </mdui-button>
        
        <mdui-button 
          variant="filled" 
          @click="showResults"
          v-else
          full-width
          size="large"
          icon="flag"
        >
          完成練習
        </mdui-button>
      </div>
    </div>

    <!-- 單字信息懸浮窗 -->
    <div
      v-if="wordInfo.show"
      class="word-info-tooltip"
      :style="{
        position: 'fixed',
        left: wordInfo.x + 'px',
        top: wordInfo.y + 'px',
        zIndex: 1000,
        pointerEvents: 'none'
      }"
    >
      <mdui-card variant="elevated" style="max-width: 300px; padding: 16px;">
        <h4 style="margin: 0 0 8px 0; color: var(--mdui-color-primary);">{{ wordInfo.word }}</h4>
        <p style="margin: 8px 0; font-size: 14px;"><strong>中文解釋:</strong> {{ wordInfo.definition }}</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>詞根:</strong> {{ wordInfo.etymology }}</p>
        <p style="margin: 8px 0; font-size: 14px;"><strong>例句:</strong> {{ wordInfo.example }}</p>
      </mdui-card>
    </div>

    <!-- 結果顯示 -->
    <div v-if="showResult" style="padding: 16px; text-align: center;">
      <div style="margin-bottom: 32px;">
        <mdui-icon name="celebration" style="font-size: 3rem; color: var(--mdui-color-primary); margin-bottom: 16px;"></mdui-icon>
        <h1 style="margin-bottom: 8px;">練習完成！</h1>
        <p style="color: var(--mdui-color-on-surface-variant);">
          恭喜你完成了這次英文單字練習
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <mdui-card variant="filled" style="padding: 24px; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; line-height: 1; margin-bottom: 8px;">{{ correctCount }}</div>
          <div style="font-size: 0.875rem; font-weight: 500; opacity: 0.8;">答對題數</div>
        </mdui-card>
        
        <mdui-card variant="filled" style="padding: 24px; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; line-height: 1; margin-bottom: 8px;">{{ questions.length }}</div>
          <div style="font-size: 0.875rem; font-weight: 500; opacity: 0.8;">總題數</div>
        </mdui-card>
        
        <mdui-card variant="filled" style="padding: 24px; text-align: center;">
          <div style="font-size: 2rem; font-weight: 700; line-height: 1; margin-bottom: 8px;">{{ Math.round(correctCount / questions.length * 100) }}%</div>
          <div style="font-size: 0.875rem; font-weight: 500; opacity: 0.8;">正確率</div>
        </mdui-card>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto;">
        <mdui-button
          variant="filled"
          @click="restart"
          full-width
          size="large"
          icon="refresh"
        >
          開始新練習
        </mdui-button>

        <mdui-button
          variant="outlined"
          @click="$router.push('/english-training/history')"
          full-width
          size="large"
          icon="history"
        >
          查看歷史記錄
        </mdui-button>

        <mdui-button
          variant="outlined"
          @click="showWrongAnswers"
          v-if="wrongAnswers.length > 0"
          full-width
          size="large"
          icon="error_outline"
        >
          查看錯題 ({{ wrongAnswers.length }})
        </mdui-button>
      </div>
    </div>

    <!-- 錯題回顧 -->
    <mdui-dialog :open="showWrongReview" @close="closeWrongReview">
      <mdui-top-app-bar slot="header">
        <mdui-button-icon @click="closeWrongReview" icon="close"></mdui-button-icon>
        <mdui-top-app-bar-title>錯題回顧</mdui-top-app-bar-title>
      </mdui-top-app-bar>
      
      <div style="padding: 16px; max-height: 60vh; overflow-y: auto;">
        <div v-for="(question, index) in wrongAnswers" :key="index" style="margin-bottom: 16px;">
          <mdui-card variant="outlined" style="padding: 16px;">
            <div style="margin-bottom: 12px;">
              <strong>題目 {{ index + 1 }}:</strong>
              <span v-html="question.sentence.replace('____', `<strong style='color: var(--mdui-color-primary);'>${question.correctAnswer}</strong>`)"></span>
            </div>
            <mdui-divider></mdui-divider>
            <div style="margin-top: 12px;">
              <p><strong>你的答案:</strong> <span style="color: var(--mdui-color-error);">{{ question.userAnswer }}</span></p>
              <p><strong>正確答案:</strong> <span style="color: var(--mdui-color-primary);">{{ question.correctAnswer }}</span></p>
            </div>
          </mdui-card>
        </div>
      </div>
      
      <div slot="footer" style="padding: 16px;">
        <mdui-button variant="filled" @click="closeWrongReview" full-width>
          關閉
        </mdui-button>
      </div>
    </mdui-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import LevelSelector from './LevelSelector.vue'
import { loadWordData, type WordData } from '@/services/wordService'

interface Question {
  sentence: string
  correctAnswer: string
  options: string[]
  wordInfo: {
    definition: string
    etymology: string
    example: string
  }
}

interface WordInfo {
  word: string
  definition: string
  etymology: string
  example: string
  show: boolean
  x: number
  y: number
}

// 狀態管理
const questions = ref<Question[]>([])
const currentQuestionIndex = ref(0)
const currentQuestion = ref<Question | null>(null)
const selectedAnswer = ref<string>('')
const showAnswer = ref(false)
const isGenerating = ref(false)
const showResult = ref(false)
const showWrongReview = ref(false)
const correctCount = ref(0)
const wrongAnswers = ref<Question[]>([])
const hasStoredQuestions = ref(false)
const showLevelSelector = ref(false)
const showAIGenerator = ref(false)
const currentLevel = ref<number | null>(null) // 記錄當前級別，用於無限模式
const isGeneratingMoreQuestions = ref(false) // 是否正在生成更多題目

// 用於追蹤已完成的題目ID
const completedQuestionIds = ref<Set<string>>(new Set())

const sentenceElement = ref<HTMLElement | null>(null)

// 單字信息懸浮窗
const wordInfo = ref<WordInfo>({
  word: '',
  definition: '',
  etymology: '',
  example: '',
  show: false,
  x: 0,
  y: 0
})

// 組件掛載時檢查是否有儲存的題目，如果有則自動載入，並載入已完成的題目ID
onMounted(async () => {
  await checkStoredQuestions()
  loadCompletedQuestions(); // 載入已完成的題目ID
  // 如果有儲存的題目，立即載入並開始測驗
  if (hasStoredQuestions.value) {
    await loadExistingQuestions()
  } else {
    // 如果沒有儲存的題目，直接顯示難度選擇器
    showLevelSelector.value = true
  }
})

// 檢查是否有儲存的題目
const checkStoredQuestions = () => {
  const stored = localStorage.getItem('englishQuestions')
  const storedTimestamp = localStorage.getItem('questionsTimestamp')
  
  if (stored && storedTimestamp) {
    const timestamp = parseInt(storedTimestamp)
    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    
    // 如果題目在一周內，可以使用
    if (now - timestamp < oneWeek) {
      hasStoredQuestions.value = true
    } else {
      // 清除過期的題目
      localStorage.removeItem('englishQuestions')
      localStorage.removeItem('questionsTimestamp')
    }
  }
}

// 返回模式選擇
const backToModeSelection = () => {
  showLevelSelector.value = false
  showAIGenerator.value = false
}

// 無限模式：從本地單詞庫隨機選詞生成題目
const startInfiniteMode = async (level: number) => {
  await generateLocalQuestions(level);
  currentLevel.value = level; // 存儲當前級別，用於後續動態加載
}

// 生成初始題目（50題）
const generateInitialQuestions = async (localWords: WordData[], level: number) => {
  // 隨機選擇50個單詞
  const selectedWords = selectRandomWords(localWords, 50)

  // 使用AI基於這些單詞生成題目
  const aiQuestions = await generateAIQuestionsFromWords(selectedWords)

  return aiQuestions
}

// 在接近末尾時動態加載更多題目
const loadMoreQuestions = async () => {
  if (!currentLevel.value || isGeneratingMoreQuestions.value) return;

  console.log(`正在動態加載級別 ${currentLevel.value} 的更多題目...`);
  isGeneratingMoreQuestions.value = true;

  try {
    // 使用本地詞彙庫生成更多題目
    const moreQuestions = await generateQuestionsFromWords(currentLevel.value, 50);

    if (moreQuestions.length === 0) {
      throw new Error('本地題目動態加載失敗');
    }

    // 檢查是否需要為題目添加選項（如果題目沒有選項）
    const processedQuestions = moreQuestions.every(q => q.options && q.options.length > 0)
      ? moreQuestions
      : await addOptionsToQuestions(moreQuestions, currentLevel.value);

    // 將新題目添加到現有題目列表中
    questions.value = [...questions.value, ...processedQuestions];
    console.log(`成功加載了 ${processedQuestions.length} 道新題目，總題目數：${questions.value.length}`);
  } catch (error) {
    console.error('動態加載題目失敗:', error);
    // 如果加載失敗，使用備用題目
    const basicBackupQuestions = getBackupQuestions();
    const backupQuestionsWithOptions = await addOptionsToQuestions(basicBackupQuestions, currentLevel.value);
    questions.value = [...questions.value, ...backupQuestionsWithOptions];
    console.log(`使用備用題目加載了 ${backupQuestionsWithOptions.length} 道題目`);
  } finally {
    isGeneratingMoreQuestions.value = false;
  }
}

// 隨機選擇單詞
const selectRandomWords = (words: WordData[], count: number): WordData[] => {
  const shuffled = [...words].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, words.length))
}

// 使用AI基於選中的單詞生成題目
const generateAIQuestionsFromWords = async (words: WordData[]): Promise<Question[]> => {
  const wordList = words.map(w => ({
    word: w.word,
    partOfSpeech: w.partOfSpeech,
    chineseMeaning: w.chineseMeaning,
    example1: w.example1,
    example2: w.example2
  }))
  
  const prompt = `Based on these ${words.length} English words, generate ${words.length} fill-in-the-blank sentences in JSON format:

Words: ${wordList.map(w => w.word).join(', ')}

Requirements:
1. Each sentence should contain one of these words in context
2. Replace the target word with "____"
3. Only provide the sentence and the correct answer (the target word)
4. Do not generate options, definitions, etymology, or example sentences - these will be retrieved separately
5. Make sentences natural and contextual
6. Focus on academic vocabulary usage
7. Return ONLY the JSON format with no additional text or explanation:
{
  "questions": [
    {
      "sentence": "The scientist's ____ was crucial to the experiment's success.",
      "correctAnswer": "hypothesis"
    }
  ]
}

Generate exactly ${words.length} sentences, one for each word provided.`

  const response = await axios.post('https://text.pollinations.ai/openai', {
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'openai',
    max_tokens: 4000
  })

  const generatedText = response.data.choices[0].message.content
  
  // 清理和解析JSON響應
  let cleanedText = generatedText.trim()
  
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?/, '')
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?/, '')
  }

  // 尝试从响应中提取JSON部分（以防AI输出了额外文本）
  let jsonData = cleanedText;

  // 查找JSON对象的开始和结束
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    jsonData = cleanedText.substring(jsonStart, jsonEnd + 1);
  }

  let data;
  try {
    data = JSON.parse(jsonData);
  } catch (parseError) {
    console.error('JSON解析失敗:', parseError);
    console.log('嘗試解析的文本:', jsonData);

    // 如果直接解析失敗，嘗試查找和提取JSON對象
    const jsonRegex = /({.*})/s;
    const match = cleanedText.match(jsonRegex);

    if (match) {
      data = JSON.parse(match[1]);
    } else {
      throw new Error('無法從AI響應中解析JSON數據');
    }
  }

  if (data.questions && Array.isArray(data.questions)) {
    // 由于AI只生成句子和正确答案，我们需要从词库中获取单词信息和生成选项
    const basicQuestions = await Promise.all(data.questions.map(async (q: any) => {
      // 从词库中查找单词的详细信息
      let wordInfo = {
        definition: '無資料',
        etymology: '無資料',
        example: '無資料'
      };

      // 遍历所有级别查找单词信息
      for (let level = 1; level <= 6; level++) {
        if (currentLevel.value && level !== currentLevel.value) continue; // 如果已知当前级别，只在当前级别查找

        const words = await loadWordData(level);
        const wordData = words.find((w: WordData) => w.word.toLowerCase() === q.correctAnswer.toLowerCase());

        if (wordData) {
          wordInfo = {
            definition: wordData.chineseMeaning || '無資料',
            etymology: wordData.root || '無資料',
            example: wordData.example1 || wordData.example2 || '無資料'
          };
          break;
        }
      }

      return {
        sentence: q.sentence,
        correctAnswer: q.correctAnswer,
        wordInfo: wordInfo
      };
    }));

    // 为每个问题生成选项（使用当前级别作为参考来选择干扰项）
    const questionsWithOptions = await addOptionsToQuestions(basicQuestions, currentLevel.value);

    return questionsWithOptions;
  } else {
    throw new Error('Invalid AI response format')
  }
}

// 使用本地詞彙庫生成題目（從CSV中隨機選擇單字）
const generateLocalQuestions = async (level: number) => {
  isGenerating.value = true

  try {
    console.log(`開始從級別 ${level} 的詞庫生成題目...`)
    const localWords = await loadWordData(level)

    if (localWords.length === 0) {
      throw new Error('本地單詞庫為空')
    }

    // 從本地詞彙庫隨機生成題目
    const generatedQuestions = await generateQuestionsFromWords(level, 50)

    if (generatedQuestions.length === 0) {
      throw new Error('本地題目生成失敗')
    }

    questions.value = generatedQuestions

    // 儲存到local storage
    localStorage.setItem('englishQuestions', JSON.stringify(questions.value))
    localStorage.setItem('questionsTimestamp', Date.now().toString())
    localStorage.setItem('questionSource', 'local') // 標記來源
    localStorage.setItem('questionLevel', level.toString()) // 記錄級別

    // 清除之前的答題記錄
    localStorage.removeItem('wrongAnswers')

    showAIGenerator.value = false
    startQuiz()

  } catch (error) {
    console.error('本地題目生成失敗:', error)

    // 如果本地生成失敗，回退到API生成
    try {
      await generateAIPQuestions()
    } catch (apiError) {
      console.error('API題目生成也失敗:', apiError)
      // 最後回退到備用題目
      const basicBackupQuestions = getBackupQuestions();
      const backupQuestionsWithOptions = await addOptionsToQuestions(basicBackupQuestions, null);
      questions.value = backupQuestionsWithOptions;
      showAIGenerator.value = false
      startQuiz()
    }
  } finally {
    isGenerating.value = false
  }
}

// 使用pollinations.ai API生成題目（保持原有的功能作為備用）
const generateAIPQuestions = async () => {
  isGenerating.value = true

  try {
    // 從CSV中隨機選擇50個單字作為基礎
    // 如果當前級別已知，從該級別選擇；否則從所有級別中選擇
    let selectedWords = [];
    if (currentLevel.value) {
      const levelWords = await loadWordData(currentLevel.value);
      // 隨機選擇50個單字
      const shuffled = [...levelWords].sort(() => 0.5 - Math.random());
      selectedWords = shuffled.slice(0, 50);
    } else {
      // 如果沒有指定級別，從所有級別中選擇
      let allWords = [];
      for (let level = 1; level <= 6; level++) {
        const words = await loadWordData(level);
        allWords = [...allWords, ...words];
      }
      const shuffled = [...allWords].sort(() => 0.5 - Math.random());
      selectedWords = shuffled.slice(0, 50);
    }

    // 構建提示詞，包含隨機選取的單字
    const wordList = selectedWords.map(w => ({
      word: w.word,
      partOfSpeech: w.partOfSpeech,
      chineseMeaning: w.chineseMeaning
    }));

    const prompt = `Based on these ${selectedWords.length} English words, generate ${selectedWords.length} fill-in-the-blank sentences in JSON format:

Words: ${selectedWords.map(w => w.word).join(', ')}

Requirements:
1. Each sentence should contain one of these words in context
2. Replace the target word with "____"
3. Only provide the sentence and the correct answer (the target word)
4. Do not generate options, definitions, etymology, or example sentences - these will be retrieved separately
5. Make sentences natural and contextual
6. Focus on academic vocabulary usage
7. Return ONLY the JSON format with no additional text or explanation:
{
  "questions": [
    {
      "sentence": "The scientist's ____ was crucial to the experiment's success.",
      "correctAnswer": "hypothesis"
    }
  ]
}

Generate exactly ${selectedWords.length} sentences, one for each word provided.`

    const response = await axios.post('https://text.pollinations.ai/openai', {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'openai',
      max_tokens: 4000
    })

    const generatedText = response.data.choices[0].message.content

    // 清理和解析JSON響應
    let cleanedText = generatedText.trim()

    // 如果響應包含代碼塊標記，移除它們
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?/, '')
    }

    // 尝试从响应中提取JSON部分（以防AI输出了额外文本）
    let jsonData = cleanedText;

    // 查找JSON对象的开始和结束
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonData = cleanedText.substring(jsonStart, jsonEnd + 1);
    }

    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (parseError) {
      console.error('JSON解析失敗:', parseError);
      console.log('嘗試解析的文本:', jsonData);

      // 如果直接解析失敗，嘗試查找和提取JSON對象
      const jsonRegex = /({.*})/s;
      const match = cleanedText.match(jsonRegex);

      if (match) {
        data = JSON.parse(match[1]);
      } else {
        throw new Error('無法從AI響應中解析JSON數據');
      }
    }

    if (data.questions && Array.isArray(data.questions)) {
      // 由于AI只生成句子和正确答案，我们需要从词库中获取单词信息和生成选项
      const basicQuestions = await Promise.all(data.questions.slice(0, 50).map(async (q: any) => {
        // 从词库中查找单词的详细信息
        let wordInfo = {
          definition: '無資料',
          etymology: '無資料',
          example: '無資料'
        };

        // 遍历所有级别查找单词信息
        for (let level = 1; level <= 6; level++) {
          const words = await loadWordData(level);
          const wordData = words.find((w: WordData) => w.word.toLowerCase() === q.correctAnswer.toLowerCase());

          if (wordData) {
            wordInfo = {
              definition: wordData.chineseMeaning || '無資料',
              etymology: wordData.root || '無資料',
              example: wordData.example1 || wordData.example2 || '無資料'
            };
            break;
          }
        }

        return {
          sentence: q.sentence,
          correctAnswer: q.correctAnswer,
          wordInfo: wordInfo
        };
      }));

      // 为每个问题生成选项
      const questionsWithOptions = await addOptionsToQuestions(basicQuestions, null);

      questions.value = questionsWithOptions;

      // 儲存到local storage
      localStorage.setItem('englishQuestions', JSON.stringify(questions.value))
      localStorage.setItem('questionsTimestamp', Date.now().toString())
      localStorage.setItem('questionSource', 'ai') // 標記來源
      localStorage.removeItem('questionLevel') // 清除級別

      // 清除之前的答題記錄
      localStorage.removeItem('wrongAnswers')

      showAIGenerator.value = false
      startQuiz()
    } else {
      throw new Error('Invalid response format')
    }

  } catch (error) {
    console.error('生成題目失敗:', error)

    // 如果API調用失敗，使用備用題目
    const basicBackupQuestions = getBackupQuestions();
    const backupQuestionsWithOptions = await addOptionsToQuestions(basicBackupQuestions, null);
    questions.value = backupQuestionsWithOptions;
    showAIGenerator.value = false
    startQuiz()
  } finally {
    isGenerating.value = false
  }
}

// 載入現有的題目
const loadExistingQuestions = async () => {
  const stored = localStorage.getItem('englishQuestions')
  const storedTimestamp = localStorage.getItem('questionsTimestamp')
  const source = localStorage.getItem('questionSource')
  const level = localStorage.getItem('questionLevel')

  if (stored && storedTimestamp) {
    const timestamp = parseInt(storedTimestamp)
    const now = Date.now()
    const oneWeek = 7 * 24 * 60 * 60 * 1000

    // 如果題目在一周內，可以使用
    if (now - timestamp < oneWeek) {
      let loadedQuestions = JSON.parse(stored);

      // 檢查是否有題目缺少選項，如果有則補充選項
      // 如果第一個問題沒有選項，則為所有問題添加選項
      if (loadedQuestions.length > 0 && (!loadedQuestions[0].options || loadedQuestions[0].options.length === 0)) {
        // 這表示題目是新格式（沒有選項），需要添加選項
        const levelNum = level ? parseInt(level) : null;
        // 這裡需要異步處理，但由於是從localStorage加載的，我們需要特別處理
        // 一種方式是重新調用選項生成函數
        addOptionsToQuestions(loadedQuestions, levelNum).then(questionsWithOptions => {
          questions.value = questionsWithOptions;
          console.log(`載入${source === 'local' ? '本地' : 'AI'}題目並補充選項 (級別: ${level || 'N/A'})`)
          startQuiz();
        }).catch(error => {
          console.error('為現有題目添加選項時出錯:', error);
          // 如果添加選項失敗，使用原題目
          questions.value = loadedQuestions;
          console.log(`載入${source === 'local' ? '本地' : 'AI'}題目 (級別: ${level || 'N/A'})`)
          startQuiz();
        });
      } else {
        // 題目已有選項，直接使用
        questions.value = loadedQuestions;
        console.log(`載入${source === 'local' ? '本地' : 'AI'}題目 (級別: ${level || 'N/A'})`)
        startQuiz()
      }
    } else {
      // 清除過期的題目
      localStorage.removeItem('englishQuestions')
      localStorage.removeItem('questionsTimestamp')
      localStorage.removeItem('questionSource')
      localStorage.removeItem('questionLevel')
      hasStoredQuestions.value = false
      console.log('本地題目已過期，已清除')
    }
  }
}

// 開始測驗
const startQuiz = () => {
  currentQuestionIndex.value = 0
  correctCount.value = 0
  wrongAnswers.value = []
  showResult.value = false
  showWrongReview.value = false
  showNextQuestion()
}

// 顯示下一題
const showNextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length) {
    currentQuestion.value = questions.value[currentQuestionIndex.value]
    selectedAnswer.value = ''
    showAnswer.value = false
  }
}

// 將句子分割為可渲染的部件
interface SentencePart {
  type: 'text' | 'blank' | 'word';
  text: string;
}

const sentenceParts = computed<SentencePart[]>(() => {
  if (!currentQuestion.value) return []

  // 根據是否已顯示答案來決定句子內容
  const sentence = showAnswer.value ?
    currentQuestion.value.sentence.replace('____', currentQuestion.value.correctAnswer) :
    currentQuestion.value.sentence;

  const parts: SentencePart[] = [];

  // 分割句子中的空格和單詞，但保留空格和標點
  const regex = /(____)|([a-zA-Z]+(?:'[a-zA-Z]+)?)/g;
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(sentence)) !== null) {
    // 添加匹配前的文本（包括空格和標點）
    if (match.index > lastIndex) {
      const textBefore = sentence.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push({ type: 'text', text: textBefore });
      }
    }

    // 添加匹配的內容
    if (match[1]) { // 空白占位符
      parts.push({ type: 'blank', text: match[1] });
    } else if (match[2]) { // 單詞（可能包含撇號）
      parts.push({ type: 'word', text: match[2] });
    }

    lastIndex = match.index + match[0].length;
  }

  // 添加最後剩餘的文本（包括空格和標點）
  if (lastIndex < sentence.length) {
    const remainingText = sentence.substring(lastIndex);
    if (remainingText) {
      parts.push({ type: 'text', text: remainingText });
    }
  }

  return parts;
});

// 選擇答案
const selectAnswer = (option: string) => {
  if (showAnswer.value) return // 已經顯示答案，不可再選

  selectedAnswer.value = option
  showAnswer.value = true

  // 創建唯一的題目ID，用於追蹤已完成的題目
  const questionId = `${currentQuestion.value?.sentence}-${currentQuestion.value?.correctAnswer}`;
  completedQuestionIds.value.add(questionId);

  // 記錄答題結果
  if (option === currentQuestion.value?.correctAnswer) {
    correctCount.value++
  } else {
    // 記錄錯題
    const wrongQuestion = {
      ...currentQuestion.value!,
      userAnswer: option
    }
    wrongAnswers.value.push(wrongQuestion)
  }

  // 保存已完成的題目ID到本地存儲
  saveCompletedQuestions();
}

// 保存已完成的題目ID到本地存儲
const saveCompletedQuestions = () => {
  localStorage.setItem('completedQuestionIds', JSON.stringify(Array.from(completedQuestionIds.value)));
}

// 載入已完成的題目ID
const loadCompletedQuestions = () => {
  const stored = localStorage.getItem('completedQuestionIds');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      completedQuestionIds.value = new Set(parsed);
    } catch (error) {
      console.error('載入已完成題目ID失敗:', error);
      completedQuestionIds.value = new Set();
    }
  }
}

// 清除歷史記錄
const clearHistory = () => {
  if (confirm('確定要清除所有歷史記錄嗎？這將刪除已完成的題目記錄和錯題記錄。')) {
    completedQuestionIds.value.clear();
    localStorage.removeItem('completedQuestionIds');
    localStorage.removeItem('wrongAnswers');
    console.log('歷史記錄已清除');
  }
}

// 獲取歷史記錄統計
const getHistoryStats = () => {
  const completedIds = localStorage.getItem('completedQuestionIds');
  let completedCount = 0;

  if (completedIds) {
    try {
      const parsed = JSON.parse(completedIds);
      completedCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch (e) {
      console.error('解析已完成題目ID失敗:', e);
    }
  }

  const wrongAnswersCount = localStorage.getItem('wrongAnswers') ? JSON.parse(localStorage.getItem('wrongAnswers') || '[]').length : 0;

  return {
    completedCount,
    wrongAnswersCount
  };
}


// 下一題
const nextQuestion = async () => {
  currentQuestionIndex.value++

  // 如果當前題目接近末尾（第49題），且尚未加載更多題目，則自動加載
  if (currentQuestionIndex.value >= questions.value.length - 1 && !isGeneratingMoreQuestions.value) {
    await loadMoreQuestions()
  }

  showNextQuestion()
}

// 顯示結果
const showResults = () => {
  showResult.value = true
  currentQuestion.value = null
  
  // 儲存錯題到local storage
  if (wrongAnswers.value.length > 0) {
    localStorage.setItem('wrongAnswers', JSON.stringify(wrongAnswers.value))
  }
}

// 重新開始
const restart = () => {
  questions.value = []
  currentQuestionIndex.value = 0
  currentQuestion.value = null
  showResult.value = false
  showWrongReview.value = false
  correctCount.value = 0
  wrongAnswers.value = []
}

// 顯示錯題
const showWrongAnswers = () => {
  showWrongReview.value = true
}

// 關閉錯題回顧
const closeWrongReview = () => {
  showWrongReview.value = false
}

// 顯示單字信息（用於選項）
const showWordInfo = (word: string, event: MouseEvent) => {
  if (!currentQuestion.value) return
  
  const info = currentQuestion.value.wordInfo
  wordInfo.value = {
    word: word,
    definition: info.definition,
    etymology: info.etymology,
    example: info.example,
    show: true,
    x: event.clientX,
    y: event.clientY - 100
  }
}

// 顯示句子中的單詞信息
const showSentenceWordInfo = (word: string, event: MouseEvent) => {
  if (!currentQuestion.value || !showAnswer.value) return

  // 確保只有在完成答案後才能顯示詞彙資訊
  wordInfo.value = {
    word: word,
    definition: currentQuestion.value.wordInfo.definition,
    etymology: currentQuestion.value.wordInfo.etymology,
    example: currentQuestion.value.wordInfo.example,
    show: true,
    x: event.clientX,
    y: event.clientY - 100
  }
}

// 處理單字變化形式的函數
const findWordByInflection = (word: string, words: WordData[]): WordData | undefined => {
  const lookupWord = word.toLowerCase();

  // 精確匹配
  let foundWord = words.find(w => w.word.toLowerCase() === lookupWord);
  if (foundWord) return foundWord;

  // 處理不規則變化形式
  const irregularForms: { [key: string]: string } = {
    // 過去式/過去分詞
    'woke': 'wake',
    'waked': 'wake',
    'took': 'take',
    'taken': 'take',
    'gave': 'give',
    'given': 'give',
    'went': 'go',
    'gone': 'go',
    'broke': 'break',
    'broken': 'break',
    'chose': 'choose',
    'chosen': 'choose',
    'drove': 'drive',
    'driven': 'drive',
    'ate': 'eat',
    'eaten': 'eat',
    'fell': 'fall',
    'fallen': 'fall',
    'froze': 'freeze',
    'frozen': 'freeze',
    'grew': 'grow',
    'grown': 'grow',
    'knew': 'know',
    'known': 'know',
    'swam': 'swim',
    'swum': 'swim',
    'threw': 'throw',
    'thrown': 'throw',
    'blew': 'blow',
    'blown': 'blow',
    'flew': 'fly',
    'flown': 'fly',
    'saw': 'see',
    'seen': 'see',
    'drew': 'draw',
    'drawn': 'draw',
    'bought': 'buy',
    'caught': 'catch',
    'taught': 'teach',
    'brought': 'bring',
    'fought': 'fight',
    'sought': 'seek',
    'thought': 'think',
    'bent': 'bend',
    'bound': 'bind',
    'built': 'build',
    'dealt': 'deal',
    'felt': 'feel',
    'held': 'hold',
    'kept': 'keep',
    'knelt': 'kneel',
    'led': 'lead',
    'lent': 'lend',
    'lost': 'lose',
    'meant': 'mean',
    'paid': 'pay',
    'said': 'say',
    'sold': 'sell',
    'sent': 'send',
    'spent': 'spend',
    'stood': 'stand',
    'understood': 'understand',
    'won': 'win',
    'wound': 'wind',
    'withdrew': 'withdraw',
    'withdrawn': 'withdraw',
    'withstood': 'withstand',
    'shook': 'shake',
    'shaken': 'shake',
    'spoke': 'speak',
    'spoken': 'speak',
    'rode': 'ride',
    'ridden': 'ride',
    'wore': 'wear',
    'worn': 'wear',
    'tore': 'tear',
    'torn': 'tear',
    'stole': 'steal',
    'stolen': 'steal',

    // 不規則動詞
    'was': 'be',
    'were': 'be',
    'am': 'be',
    'is': 'be',
    'are': 'be',
    'been': 'be',

    // 名詞複數形式
    'children': 'child',
    'men': 'man',
    'women': 'woman',
    'people': 'person',
    'feet': 'foot',
    'teeth': 'tooth',
    'mice': 'mouse',
    'geese': 'goose',
    'oxen': 'ox',
    'sheep': 'sheep', // 不規則但相同
    'deer': 'deer',
    'fish': 'fish',
    'series': 'series',
    'species': 'species',

    // 形容詞/副詞比較級/最高級
    'better': 'good',
    'best': 'good',
    'worse': 'bad',
    'worst': 'bad',
    'further': 'far',
    'farther': 'far',
    'furthest': 'far',
    'farthest': 'far',
    'elder': 'old',
    'eldest': 'old',
    'inner': 'in',
    'innermost': 'in',
    'outer': 'out',
    'outmost': 'out',
    'utter': 'out',
    'uttermost': 'out',

    // 以-on 結尾變 -a 的名詞 (希臘詞源)
    'phenomena': 'phenomenon',
    'criteria': 'criterion',
    'data': 'datum',
    'analyses': 'analysis',
    'crises': 'crisis',
    'bases': 'basis',
    'nuclei': 'nucleus',
    'radii': 'radius',
    'curricula': 'curriculum',
    'memoranda': 'memorandum',
    'strata': 'stratum',
    'criterion': 'criterion',
    'phenomenon': 'phenomenon',
    'datum': 'datum',
    'analysis': 'analysis',
    'crisis': 'crisis',
    'basis': 'base',
    'nucleus': 'nucleus',
    'radius': 'radius',
    'curriculum': 'curriculum',
    'memorandum': 'memorandum',
    'stratum': 'stratum',

    // 所有格 (移除後綴) - 特殊處理
  };

  // 檢查是否是不規則變化形式
  if (irregularForms[lookupWord]) {
    const baseWord = irregularForms[lookupWord];
    foundWord = words.find(w => w.word.toLowerCase() === baseWord);
    if (foundWord) return foundWord;
  }

  // 處理常見變化規則
  const suffixes = [
    { suffix: 's', condition: (w: string) => w.endsWith('s') && w !== 's' && w.length > 1 },
    { suffix: 'es', condition: (w: string) => w.endsWith('es') && !['species', 'series'].includes(w) },
    { suffix: 'ed', condition: (w: string) => w.endsWith('ed') },
    { suffix: 'ing', condition: (w: string) => w.endsWith('ing') },
    { suffix: 'er', condition: (w: string) => w.endsWith('er') },
    { suffix: 'est', condition: (w: string) => w.endsWith('est') },
    { suffix: 'ly', condition: (w: string) => w.endsWith('ly') },
    { suffix: 'tion', condition: (w: string) => w.endsWith('tion') },
    { suffix: 'sion', condition: (w: string) => w.endsWith('sion') },
    { suffix: 'ness', condition: (w: string) => w.endsWith('ness') },
    { suffix: 'ment', condition: (w: string) => w.endsWith('ment') },
    { suffix: 'ful', condition: (w: string) => w.endsWith('ful') },
    { suffix: 'less', condition: (w: string) => w.endsWith('less') },
    { suffix: 'able', condition: (w: string) => w.endsWith('able') },
    { suffix: 'ible', condition: (w: string) => w.endsWith('ible') },
    { suffix: 'ous', condition: (w: string) => w.endsWith('ous') },
    { suffix: 'ive', condition: (w: string) => w.endsWith('ive') },
    { suffix: 'al', condition: (w: string) => w.endsWith('al') },
    { suffix: 'ic', condition: (w: string) => w.endsWith('ic') },
    { suffix: 'ty', condition: (w: string) => w.endsWith('ty') },
    { suffix: 'ry', condition: (w: string) => w.endsWith('ry') },
    { suffix: 'cy', condition: (w: string) => w.endsWith('cy') },
    { suffix: 'y', condition: (w: string) => w.endsWith('y') && w.length > 1 },
    { suffix: 'ies', condition: (w: string) => w.endsWith('ies') && w.length > 3 },
    { suffix: 'ied', condition: (w: string) => w.endsWith('ied') && w.length > 3 },
    { suffix: 'ingly', condition: (w: string) => w.endsWith('ingly') && w.length > 5 },
    { suffix: 'edly', condition: (w: string) => w.endsWith('edly') && w.length > 4 }
  ];

  for (const { suffix, condition } of suffixes) {
    if (condition(lookupWord)) {
      let potentialBase = lookupWord;
      if (lookupWord.endsWith(suffix)) {
        potentialBase = lookupWord.substring(0, lookupWord.length - suffix.length);
      }

      // 特殊情況處理
      if (suffix === 'ies') {
        // 將 -ies 改為 -y
        const specialBase = potentialBase + 'y';
        foundWord = words.find(w => w.word.toLowerCase() === specialBase);
      } else if (suffix === 'ed' && lookupWord.endsWith('ied')) {
        // 將 -ied 改為 -y
        const specialBase = potentialBase.substring(0, potentialBase.length - 1) + 'y';
        foundWord = words.find(w => w.word.toLowerCase() === specialBase);
      } else if (suffix === 's' && potentialBase.endsWith('ie')) {
        // 將 -ies 的情況
        const specialBase = potentialBase.substring(0, potentialBase.length - 2) + 'y';
        foundWord = words.find(w => w.word.toLowerCase() === specialBase);
      } else {
        foundWord = words.find(w => w.word.toLowerCase() === potentialBase);
      }

      if (foundWord) return foundWord;
    }
  }

  // 處理所有格 (移除 's 或 s')
  if (lookupWord.includes("'s")) {
    const potentialBase = lookupWord.replace(/'s$/, '');
    foundWord = words.find(w => w.word.toLowerCase() === potentialBase);
    if (foundWord) return foundWord;
  } else if (lookupWord.endsWith('s\'')) {
    const potentialBase = lookupWord.replace(/s'$/, '');
    foundWord = words.find(w => w.word.toLowerCase() === potentialBase);
    if (foundWord) return foundWord;
  }

  return undefined;
};

// 顯示選項單詞信息
const showOptionWordInfo = async (word: string, event: MouseEvent) => {
  if (!currentQuestion.value || !showAnswer.value) return

  try {
    // 統一從詞庫中查找該單字的資訊，不論是否為正確答案
    for (let level = 1; level <= 6; level++) {
      const words = await loadWordData(level);

      // 使用變化形式處理函數
      const foundWord = findWordByInflection(word, words);

      if (foundWord) {
        wordInfo.value = {
          word: word,
          definition: foundWord.chineseMeaning || '無資料',
          etymology: foundWord.root || '無資料',
          example: foundWord.example1 || foundWord.example2 || '無資料',
          show: true,
          x: event.clientX,
          y: event.clientY - 100
        };
        return;
      }
    }

    // 如果在任何級別都找不到單詞，顯示"無資料"
    wordInfo.value = {
      word: word,
      definition: '無資料',
      etymology: '無資料',
      example: '無資料',
      show: true,
      x: event.clientX,
      y: event.clientY - 100
    };
  } catch (error) {
    console.error('加載單詞資訊失敗:', error);
    wordInfo.value = {
      word: word,
      definition: '無資料',
      etymology: '無資料',
      example: '無資料',
      show: true,
      x: event.clientX,
      y: event.clientY - 100
    };
  }
}

// 隱藏單字信息
const hideWordInfo = () => {
  wordInfo.value.show = false
}

// 為問題添加選項（從詞庫中隨機選擇）
const addOptionsToQuestions = async (basicQuestions: Omit<Question, 'options'>[], level: number | null) => {
  // 如果指定了級別，從該級別詞庫中選擇選項；否則嘗試載入所有級別
  let allWords: WordData[] = [];

  if (level !== null) {
    allWords = await loadWordData(level);
  } else {
    // 如果沒有指定級別，載入所有級別的詞彙
    for (let lvl = 1; lvl <= 6; lvl++) {
      const words = await loadWordData(lvl);
      allWords = [...allWords, ...words];
    }
  }

  // 為每個問題生成選項
  return basicQuestions.map((q) => {
    // 找到與正確答案相同詞性的詞彙作為干擾選項
    const correctWordData = allWords.find(w => w.word.toLowerCase() === q.correctAnswer.toLowerCase());
    const samePosWords = correctWordData
      ? allWords.filter(w =>
          w.partOfSpeech === correctWordData.partOfSpeech &&
          w.word.toLowerCase() !== q.correctAnswer.toLowerCase()
        )
      : allWords.filter(w => w.word.toLowerCase() !== q.correctAnswer.toLowerCase());

    // 隨機選擇3個干擾選項
    const shuffled = [...samePosWords].sort(() => 0.5 - Math.random());
    const selectedDistractors = shuffled.slice(0, 3);

    // 組合選項並隨機排序
    const options = [q.correctAnswer, ...selectedDistractors.map(w => w.word)];
    const finalOptions = options.sort(() => Math.random() - 0.5);

    // 從詞庫中獲取正確的單字資訊，而不是使用原始的（可能是備用的）資訊
    let wordInfo = {
      definition: '無資料',
      etymology: '無資料',
      example: '無資料'
    };

    if (correctWordData) {
      wordInfo = {
        definition: correctWordData.chineseMeaning || '無資料',
        etymology: correctWordData.root || '無資料',
        example: correctWordData.example1 || correctWordData.example2 || '無資料'
      };
    }

    return {
      ...q,
      options: finalOptions,
      wordInfo: wordInfo
    } as Question;
  });
}

// 備用題目（當API不可用時）- 只返回句子和正確答案，選項和單字資訊從CSV獲取
const getBackupQuestions = (): Omit<Question, 'options'>[] => {
  return [
    {
      sentence: "The scientist's ____ was crucial to the experiment's success.",
      correctAnswer: "hypothesis",
      wordInfo: {
        definition: "",
        etymology: "",
        example: ""
      }
    },
    {
      sentence: "The ____ of the novel made it difficult to understand.",
      correctAnswer: "complexity",
      wordInfo: {
        definition: "",
        etymology: "",
        example: ""
      }
    },
    {
      sentence: "Her ____ personality made her popular among her colleagues.",
      correctAnswer: "amicable",
      wordInfo: {
        definition: "",
        etymology: "",
        example: ""
      }
    }
  ]
}
</script>

<style scoped>
/* 僅保留最基礎的佈局樣式，其他使用MDUI原生 */
.sentence {
  font-size: 1.25rem;
  line-height: 1.75rem;
  margin: 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 2rem 0;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.word-info-tooltip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

/* 單詞hover效果 - 使用MDUI變量 */
.hover-word {
  cursor: pointer;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.hover-word:hover {
  background-color: var(--mdui-color-primary-container);
  color: var(--mdui-color-on-primary-container);
}

.blank-placeholder {
  color: var(--mdui-color-primary);
  text-decoration: underline;
}
</style>