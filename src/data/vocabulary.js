// 词汇数据访问层 - 基于数据库实现
import { wordDAO } from '@/db/daos.js'
import { GRADE_LEVELS } from '@/db/models.js'

// 预定义词书结构
export const vocabularyBooks = {
  primary: {
    id: 1,
    name: '小学英语词汇',
    level: 'primary',
    description: '适合小学生的基础英语词汇',
    totalWords: 200,
    gradeLevel: GRADE_LEVELS.PRIMARY,
    words: []
  },
  junior: {
    id: 2,
    name: '初中英语词汇',
    level: 'junior',
    description: '适合初中生的中级英语词汇',
    totalWords: 150,
    gradeLevel: GRADE_LEVELS.JUNIOR,
    words: []
  },
  senior: {
    id: 3,
    name: '高中英语词汇',
    level: 'senior',
    description: '适合高中生的高级英语词汇',
    totalWords: 300,
    gradeLevel: GRADE_LEVELS.SENIOR,
    words: []
  }
}

// 获取指定级别的单词
export const getWordsByLevel = async (level) => {
  try {
    const book = vocabularyBooks[level]
    if (!book) return []
    
    const words = await wordDAO.findByGradeLevel(book.gradeLevel)
    return words.map(word => convertWordToLegacyFormat(word))
  } catch (error) {
    console.error('获取级别单词失败:', error)
    return []
  }
}

// 获取指定ID的单词
export const getWordById = async (wordId) => {
  try {
    const word = await wordDAO.findById(parseInt(wordId))
    return word ? convertWordToLegacyFormat(word) : null
  } catch (error) {
    console.error('获取单词失败:', error)
    return null
  }
}

// 获取所有单词
export const getAllWords = async () => {
  try {
    const words = await wordDAO.findAll()
    return words.map(word => convertWordToLegacyFormat(word))
  } catch (error) {
    console.error('获取所有单词失败:', error)
    return []
  }
}

// 根据难度范围获取单词
export const getWordsByDifficulty = async (minDifficulty, maxDifficulty) => {
  try {
    const allWords = await getAllWords()
    return allWords.filter(word => 
      word.difficulty >= minDifficulty && word.difficulty <= maxDifficulty
    )
  } catch (error) {
    console.error('按难度获取单词失败:', error)
    return []
  }
}

// 获取指定词书的所有单词（兼容原有API）
export const getWordsByBookId = async (bookId) => {
  try {
    const level = getBookLevelById(bookId)
    return await getWordsByLevel(level)
  } catch (error) {
    console.error('获取词书单词失败:', error)
    return []
  }
}

// 根据词书ID获取级别
const getBookLevelById = (bookId) => {
  const levelMap = {
    1: 'primary',
    2: 'junior', 
    3: 'senior'
  }
  return levelMap[bookId] || 'primary'
}

// 转换数据库单词格式为原有格式
const convertWordToLegacyFormat = (word) => {
  return {
    id: word.word_id,
    word: word.word,
    meaning: word.meaning,
    phonetic: word.phonetic || '',
    partOfSpeech: '', // 原数据中没有此字段
    example: word.example_sentence || '',
    difficulty: calculateDifficulty(word.grade_level)
  }
}

// 根据年级计算难度
const calculateDifficulty = (gradeLevel) => {
  switch (gradeLevel) {
    case GRADE_LEVELS.PRIMARY:
      return 1
    case GRADE_LEVELS.JUNIOR:
      return 3
    case GRADE_LEVELS.SENIOR:
      return 4
    default:
      return 1
  }
}

// 初始化词汇数据（从原有数据迁移到数据库）
export const initializeVocabularyData = async () => {
  try {
    // 检查是否已有数据
    const existingWords = await wordDAO.findAll()
    if (existingWords.length > 0) {
      console.log('数据库中已有词汇数据，跳过初始化')
      return
    }

    // 原有的词汇数据
    const legacyWords = [
      // 小学词汇
      {
        word: 'apple',
        meaning: '苹果',
        phonetic: '/ˈæpəl/',
        example_sentence: 'I eat an apple every day.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'banana',
        meaning: '香蕉',
        phonetic: '/bəˈnænə/',
        example_sentence: 'Monkeys like bananas.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'orange',
        meaning: '橙子',
        phonetic: '/ˈɔːrɪndʒ/',
        example_sentence: 'This orange is very sweet.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'milk',
        meaning: '牛奶',
        phonetic: '/mɪlk/',
        example_sentence: 'I drink milk for breakfast.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'cat',
        meaning: '猫',
        phonetic: '/kæt/',
        example_sentence: 'The cat is sleeping.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'dog',
        meaning: '狗',
        phonetic: '/dɔːɡ/',
        example_sentence: 'My dog is very friendly.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'bird',
        meaning: '鸟',
        phonetic: '/bɜːrd/',
        example_sentence: 'The bird is singing beautifully.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'fish',
        meaning: '鱼',
        phonetic: '/fɪʃ/',
        example_sentence: 'I saw many fish in the pond.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'red',
        meaning: '红色',
        phonetic: '/red/',
        example_sentence: 'The apple is red.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'blue',
        meaning: '蓝色',
        phonetic: '/bluː/',
        example_sentence: 'The sky is blue today.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'green',
        meaning: '绿色',
        phonetic: '/ɡriːn/',
        example_sentence: 'Grass is green.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'yellow',
        meaning: '黄色',
        phonetic: '/ˈjeloʊ/',
        example_sentence: 'The sun is yellow.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'father',
        meaning: '父亲',
        phonetic: '/ˈfɑːðər/',
        example_sentence: 'My father works in an office.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'mother',
        meaning: '母亲',
        phonetic: '/ˈmʌðər/',
        example_sentence: 'My mother cooks delicious food.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'brother',
        meaning: '兄弟',
        phonetic: '/ˈbrʌðər/',
        example_sentence: 'I have an older brother.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      {
        word: 'sister',
        meaning: '姐妹',
        phonetic: '/ˈsɪstər/',
        example_sentence: 'My sister is very smart.',
        grade_level: GRADE_LEVELS.PRIMARY
      },
      // 初中词汇
      {
        word: 'achievement',
        meaning: '成就',
        phonetic: '/əˈtʃiːvmənt/',
        example_sentence: 'Graduating from university was a great achievement.',
        grade_level: GRADE_LEVELS.JUNIOR
      },
      {
        word: 'beautiful',
        meaning: '美丽的',
        phonetic: '/ˈbjuːtɪfəl/',
        example_sentence: 'The sunset is beautiful tonight.',
        grade_level: GRADE_LEVELS.JUNIOR
      },
      {
        word: 'develop',
        meaning: '发展',
        phonetic: '/dɪˈveləp/',
        example_sentence: 'Children develop quickly.',
        grade_level: GRADE_LEVELS.JUNIOR
      },
      {
        word: 'environment',
        meaning: '环境',
        phonetic: '/ɪnˈvaɪrənmənt/',
        example_sentence: 'We need to protect our environment.',
        grade_level: GRADE_LEVELS.JUNIOR
      },
      {
        word: 'fantastic',
        meaning: '极好的',
        phonetic: '/fænˈtæstɪk/',
        example_sentence: 'The movie was fantastic!',
        grade_level: GRADE_LEVELS.JUNIOR
      },
      // 高中词汇
      {
        word: 'accommodate',
        meaning: '容纳；适应',
        phonetic: '/əˈkɑːmədeɪt/',
        example_sentence: 'The hotel can accommodate 200 guests.',
        grade_level: GRADE_LEVELS.SENIOR
      },
      {
        word: 'comprehensive',
        meaning: '全面的',
        phonetic: '/ˌkɑːmprɪˈhensɪv/',
        example_sentence: 'We need a comprehensive solution.',
        grade_level: GRADE_LEVELS.SENIOR
      },
      {
        word: 'demonstrate',
        meaning: '证明；演示',
        phonetic: '/ˈdemənstreɪt/',
        example_sentence: 'The teacher will demonstrate the experiment.',
        grade_level: GRADE_LEVELS.SENIOR
      },
      {
        word: 'illustrate',
        meaning: '说明；举例',
        phonetic: '/ˈɪləstreɪt/',
        example_sentence: 'The diagram illustrates the process.',
        grade_level: GRADE_LEVELS.SENIOR
      },
      {
        word: 'predominant',
        meaning: '主要的；占主导地位的',
        phonetic: '/prɪˈdɑːmɪnənt/',
        example_sentence: 'English is the predominant language in business.',
        grade_level: GRADE_LEVELS.SENIOR
      }
    ]

    // 创建单词对象并插入数据库
    for (const wordData of legacyWords) {
      const word = new (await import('@/db/models.js')).Word(wordData)
      await wordDAO.create(word)
    }

    console.log('词汇数据初始化完成')
  } catch (error) {
    console.error('初始化词汇数据失败:', error)
    throw error
  }
}