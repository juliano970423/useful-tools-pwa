// 單字數據服務
export interface WordData {
  word: string
  partOfSpeech: string
  root: string
  rootMeaning: string  // 保留此字段以保持向後兼容性，但不再使用
  chineseMeaning: string
  example1: string
  example2: string
  level: number
}

export interface QuestionFromWord {
  sentence: string
  correctAnswer: string
  options: string[]
  wordInfo: {
    definition: string
    etymology: string
    example: string
  }
}

// 存儲所有單字數據
const wordDatabase: { [level: string]: WordData[] } = {}

// 清除單字數據緩存（用於調試）
export const clearWordDataCache = () => {
  for (const key in wordDatabase) {
    delete wordDatabase[key]
  }
  console.log('單字數據緩存已清除')
}

// 載入單字數據 - 從真實的 CSV 文件讀取
export const loadWordData = async (level: number): Promise<WordData[]> => {
  const levelKey = `level_${level}`

  if (wordDatabase[levelKey]) {
    return wordDatabase[levelKey]
  }

  try {
    // 從 public/assets/words 資料夾加載 CSV 文件
    const response = await fetch(`/assets/words/level_${level}.csv`)

    if (!response.ok) {
      throw new Error(`無法載入級別 ${level} 的單字文件: ${response.status}`)
    }

    const csvContent = await response.text()
    const words = parseCSVContent(csvContent, level)

    wordDatabase[levelKey] = words
    return words
  } catch (error) {
    console.error(`載入${levelKey}單字數據失敗:`, error)
    return []
  }
}

// 解析CSV內容 - 專門針對這種特定格式優化
const parseCSVContent = (csvContent: string, level: number): WordData[] => {
  const allLines = csvContent.split('\n');
  // 處理標題行，跳過多餘的「詞根意思」
  const headerLine = allLines[0];
  let headerParts = headerLine.split(',');
  // 檢查是否有多餘的「詞根意思」標題
  if (headerParts.filter(h => h.trim() === '詞根意思').length > 1) {
    console.log(`級別 ${level} 檢測到多餘的「詞根意思」標題，正在修復...`);
    // 找到多餘的「詞根意思」並移除（保留第一個）
    const cleanedHeaderParts = [];
    let firstJiGenYiSiFound = false;
    for (const part of headerParts) {
      if (part.trim() === '詞根意思') {
        if (!firstJiGenYiSiFound) {
          cleanedHeaderParts.push(part);
          firstJiGenYiSiFound = true;
        } else {
          // 跳過多餘的「詞根意思」，這相當於將後續標題向前移動一位
          continue;
        }
      } else {
        cleanedHeaderParts.push(part);
      }
    }
    headerParts = cleanedHeaderParts;
    console.log(`修復後的標題: ${headerParts.join(',')}`);
  }

  const lines = allLines.slice(1); // 跳過標題行
  console.log(`開始解析級別 ${level} 的 CSV 文件，共 ${lines.length} 行數據`)

  const words: WordData[] = []
  let totalLines = 0
  let validLines = 0
  let invalidLines = 0

  for (const line of lines) {
    totalLines++
    if (line.trim()) {
      // 使用更智能的解析方法來處理這種特殊CSV格式
      // 我們知道格式是固定的：單字,詞性,詞根,詞根意思,中文解釋,例句1,例句2
      // 其中後3個字段可能包含逗號

      // 首先，處理被引號包圍的字段
      const parts = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = i + 1 < line.length ? line[i + 1] : '';

        if (char === '"' && !inQuotes) {
          // 開始引號字段
          inQuotes = true;
        } else if (char === '"' && inQuotes) {
          // 檢查是否為轉義引號 ""
          if (nextChar === '"') {
            // 處理轉義引號 ""
            current += '"';
            i++; // 跳過下一個引號
          } else {
            // 結束引號字段
            inQuotes = false;
          }
        } else if (char === ',' && !inQuotes) {
          // 如果不在引號內遇到逗號，則分割字段
          parts.push(current);
          current = '';
        } else {
          // 添加字符到當前字段
          current += char;
        }
      }
      // 添加最後一個字段
      parts.push(current);

      // 移除每個字段的前後引號（如果存在）
      for (let i = 0; i < parts.length; i++) {
        let field = parts[i];
        if (field.startsWith('"') && field.endsWith('"') && field.length >= 2) {
          field = field.substring(1, field.length - 1); // 移除首尾引號
        }
        parts[i] = field;
      }

      // 如果字段數量仍少於7，添加空字段直到達到7個
      while (parts.length < 7) {
        parts.push('');
      }

      // 如果原始CSV格式不規範（包含未被引號包圍的逗號），我們需要特殊處理
      // 基於我們知道應當有7個字段，進行後處理
      if (parts.length !== 7) {
        // 如果字段數量不正確，嘗試智能重組
        const reassembled = smartReassembleCSVLine(parts);
        if (reassembled.length === 7) {
          // 使用重組後的結果
          parts.splice(0, parts.length, ...reassembled);
        }
      }

      // 調試輸出每行的字段數量
      if (parts.length < 7) {
        console.log(`行 (${parts.length} 個字段) - 原始內容: ${line.substring(0, 200)}${line.length > 200 ? '...' : ''}`)
        console.log(`解析後字段:`, parts.map((p, i) => `${i}: "${p.substring(0, 50)}${p.length > 50 ? '...' : ''}"`).slice(0, 10))
      }

      if (parts.length >= 6 && parts[0]) {
        validLines++
        const [word, partOfSpeech, root, chineseMeaning, example1, example2] = parts
        const wordData: WordData = {
          word: word.trim(),
          partOfSpeech: partOfSpeech?.trim() || '',
          root: root?.trim() || '',
          rootMeaning: '', // 詞根意思欄位不存在
          chineseMeaning: chineseMeaning?.trim() || '',
          example1: example1?.trim() || '',
          example2: example2?.trim() || '',
          level
        }
        words.push(wordData)

        // 只打印前幾個單字作為調試信息
        if (words.length <= 3) {
          console.log(`解析的單字 ${words.length}: ${wordData.word} - ${wordData.chineseMeaning}`)
        }
      } else {
        invalidLines++
        console.log(`無效行 (${parts.length} 個字段): ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`)
        console.log(`字段:`, parts)
      }
    }
  }

  console.log(`級別 ${level} 解析完成: 總行數=${totalLines}, 有效行=${validLines}, 無效行=${invalidLines}, 最終單字數=${words.length}`)
  return words
}

// 智能重組CSV行，處理未被引號包圍的逗號
function smartReassembleCSVLine(parts: string[]): string[] {
  // 基於已知格式：單字,詞性,詞根,中文解釋,例句1,例句2
  // 如果字段數量多於6，很可能是在中文解釋或例句中有多餘逗號

  if (parts.length === 6) {
    return parts; // 已經是正確格式
  }

  // 如果字段數量少於6，嘗試另一種策略
  if (parts.length < 6) {
    return parts;
  }

  // 格式：[單字, 詞性, 詞根, ...剩餘部分]
  // 我們需要將剩餘部分重組為：中文解釋, 例句1, 例句2
  if (parts.length > 6) {
    const result = [];

    // 添加前3個字段（單字,詞性,詞根）- 這些通常不包含逗號
    for (let i = 0; i < Math.min(3, parts.length); i++) {
      result.push(parts[i]);
    }

    // 從剩餘的字段構建中文解釋、例句1和例句2
    const remainingParts = parts.slice(3);
    if (remainingParts.length >= 3) {
      // 我們需要智能地確定哪部分是中文解釋，哪部分是例句
      // 中文解釋通常是中文，而例句通常是英文句子
      let chineseMeaningEndIndex = remainingParts.length - 2; // 預設倒數2個是例句

      // 檢查最後幾個字段是否包含英文字符，若是則為例句
      // 從後往前找，直到找到一個似乎是中文解釋的字段
      for (let i = remainingParts.length - 1; i >= 2; i--) {
        if (/[a-zA-Z]/.test(remainingParts[i - 1])) { // 如果前一個字段包含英文字符
          chineseMeaningEndIndex = i - 1;
          break;
        }
      }

      // 構建中文解釋（從第一個剩餘字段到 chineseMeaningEndIndex）
      const chineseMeaningParts = remainingParts.slice(0, Math.max(1, chineseMeaningEndIndex + 1));
      const chineseMeaning = chineseMeaningParts.join(',');
      result.push(chineseMeaning);

      // 構建例句1（如果存在）
      const example1Index = chineseMeaningEndIndex + 1;
      if (example1Index < remainingParts.length) {
        result.push(remainingParts[example1Index]);
      } else {
        result.push('');
      }

      // 構建例句2（如果存在）
      const example2Index = example1Index + 1;
      if (example2Index < remainingParts.length) {
        result.push(remainingParts[example2Index]);
      } else {
        result.push('');
      }
    } else {
      // 如果剩餘字段少於3個，直接添加並補空
      for (let i = 3; i < parts.length; i++) {
        result.push(parts[i]);
      }
      // 如果數量不夠6個，補空字符串
      while (result.length < 6) {
        result.push('');
      }
    }

    return result;
  }

  return parts;
}

// 從單字生成題目
export const generateQuestionsFromWords = async (
  level: number,
  count: number = 50
): Promise<QuestionFromWord[]> => {
  const words = await loadWordData(level)

  if (words.length === 0) {
    return []
  }

  // 獲取已完成的題目ID，用於跳過已完成的題目
  const completedQuestionIds = new Set<string>();
  const stored = localStorage.getItem('completedQuestionIds');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach(id => completedQuestionIds.add(id));
      }
    } catch (e) {
      console.error('解析已完成題目ID失敗:', e);
    }
  }

  // 過濾掉已完成的單字，只選擇未完成的
  const availableWords = words.filter(word => {
    const simpleQuestionId = `${word.word}-${word.chineseMeaning}`;
    // 檢查是否在已完成的題目列表中
    return !completedQuestionIds.has(simpleQuestionId);
  });

  // 隨機打亂可用的單字
  const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);

  const questions: QuestionFromWord[] = []

  // 選擇前 count 個單字生成題目
  for (const word of shuffledWords) {
    if (questions.length >= count) break;

    const question = createQuestionFromWord(word, words)
    if (question) {
      questions.push(question)
    }
  }

  return questions
}

// 為單個單字創建題目
const createQuestionFromWord = (targetWord: WordData, allWords: WordData[]): QuestionFromWord | null => {
  try {
    // 創建干擾選項
    const distractors = allWords
      .filter(w => w.word !== targetWord.word && w.partOfSpeech === targetWord.partOfSpeech)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    if (distractors.length < 3) {
      // 如果同詞性的單字不夠，從所有單字中選擇
      const allDistractors = allWords
        .filter(w => w.word !== targetWord.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      
      if (allDistractors.length < 3) return null
      distractors.push(...allDistractors)
      distractors.splice(3)
    }
    
    const options = [targetWord.word, ...distractors.map(d => d.word)]
    // 打亂選項順序
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // 創建句子（使用例句或生成簡單句子）
    const sentence = createSentence(targetWord)
    
    return {
      sentence,
      correctAnswer: targetWord.word,
      options,
      wordInfo: {
        definition: targetWord.chineseMeaning,
        etymology: targetWord.root || '',
        example: targetWord.example1 || targetWord.example2 || ''
      }
    }
  } catch (error) {
    console.error('創建題目失敗:', error)
    return null
  }
}

// 創建句子
const createSentence = (word: WordData): string => {
  // 優先使用現成的例句，將目標單字替換為填空
  if (word.example1 && word.example1.includes(word.word)) {
    return word.example1.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '____')
  }
  
  if (word.example2 && word.example2.includes(word.word)) {
    return word.example2.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '____')
  }
  
  // 如果例句不包含單字，生成簡單句子
  const templates = [
    `Please fill in the blank with the correct word: ____`,
    `The ____ is an important concept to understand.`,
    `Students need to learn how to use this word: ____`,
    `In this sentence, you should use the word: ____`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)] || 'Please fill in the blank: ____'
}

// 獲取所有難度級別
export const getAvailableLevels = (): number[] => {
  return [1, 2, 3, 4, 5, 6]
}

// 獲取級別描述
export const getLevelDescription = (level: number): string => {
  const descriptions = {
    1: '基礎詞彙 (Basic Vocabulary)',
    2: '初級詞彙 (Elementary Vocabulary)',
    3: '中級詞彙 (Intermediate Vocabulary)',
    4: '中高級詞彙 (Upper-Intermediate Vocabulary)',
    5: '高級詞彙 (Advanced Vocabulary)',
    6: '學術詞彙 (Academic Vocabulary)'
  }
  return descriptions[level as keyof typeof descriptions] || `Level ${level}`
}