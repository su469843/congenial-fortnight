// 数据实体模型定义

/**
 * 单词实体
 * 对应数据库中的 words_table
 */
export class Word {
  constructor({
    word_id = null,
    word = '',
    phonetic = '',
    meaning = '',
    grade_level = null,
    example_sentence = '',
    create_time = null
  }) {
    this.word_id = word_id
    this.word = word
    this.phonetic = phonetic
    this.meaning = meaning
    this.grade_level = grade_level // 3, 4, 5 对应小学、初中、高中
    this.example_sentence = example_sentence
    this.create_time = create_time || new Date().toISOString()
  }

  // 验证单词数据
  validate() {
    const errors = []
    
    if (!this.word || this.word.trim() === '') {
      errors.push('单词不能为空')
    }
    
    if (!this.meaning || this.meaning.trim() === '') {
      errors.push('中文意思不能为空')
    }
    
    if (this.word && this.word.length > 50) {
      errors.push('单词长度不能超过50个字符')
    }
    
    if (this.meaning && this.meaning.length > 255) {
      errors.push('中文意思长度不能超过255个字符')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 转换为数据库格式
  toDatabaseFormat() {
    return {
      word: this.word,
      phonetic: this.phonetic,
      meaning: this.meaning,
      grade_level: this.grade_level,
      example_sentence: this.example_sentence,
      create_time: this.create_time
    }
  }

  // 从数据库记录创建实例
  static fromDatabase(record) {
    return new Word({
      word_id: record.word_id,
      word: record.word,
      phonetic: record.phonetic,
      meaning: record.meaning,
      grade_level: record.grade_level,
      example_sentence: record.example_sentence,
      create_time: record.create_time
    })
  }
}

/**
 * 句子实体
 * 对应数据库中的 sentences_table
 */
export class Sentence {
  constructor({
    sentence_id = null,
    sentence = '',
    translation = '',
    grade_level = null,
    keywords = '',
    create_time = null
  }) {
    this.sentence_id = sentence_id
    this.sentence = sentence
    this.translation = translation
    this.grade_level = grade_level // 3, 4, 5 对应小学、初中、高中
    this.keywords = keywords // 关键词列表，用逗号分隔
    this.create_time = create_time || new Date().toISOString()
  }

  // 验证句子数据
  validate() {
    const errors = []
    
    if (!this.sentence || this.sentence.trim() === '') {
      errors.push('英文句子不能为空')
    }
    
    if (!this.translation || this.translation.trim() === '') {
      errors.push('中文翻译不能为空')
    }
    
    if (this.sentence && this.sentence.length > 500) {
      errors.push('英文句子长度不能超过500个字符')
    }
    
    if (this.translation && this.translation.length > 500) {
      errors.push('中文翻译长度不能超过500个字符')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 转换为数据库格式
  toDatabaseFormat() {
    return {
      sentence: this.sentence,
      translation: this.translation,
      grade_level: this.grade_level,
      keywords: this.keywords,
      create_time: this.create_time
    }
  }

  // 从数据库记录创建实例
  static fromDatabase(record) {
    return new Sentence({
      sentence_id: record.sentence_id,
      sentence: record.sentence,
      translation: record.translation,
      grade_level: record.grade_level,
      keywords: record.keywords,
      create_time: record.create_time
    })
  }

  // 获取关键词数组
  getKeywordsArray() {
    if (!this.keywords) return []
    return this.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean)
  }

  // 设置关键词数组
  setKeywordsArray(keywordsArray) {
    this.keywords = keywordsArray.join(', ')
  }
}

/**
 * 用户学习记录实体
 * 对应数据库中的 user_study_records
 */
export class UserStudyRecord {
  constructor({
    record_id = null,
    user_id = null,
    study_date = null,
    words_learned = 0,
    sentences_learned = 0,
    continuous_days = 0
  }) {
    this.record_id = record_id
    this.user_id = user_id
    this.study_date = study_date || new Date().toISOString().split('T')[0] // YYYY-MM-DD 格式
    this.words_learned = words_learned
    this.sentences_learned = sentences_learned
    this.continuous_days = continuous_days
  }

  // 验证学习记录数据
  validate() {
    const errors = []
    
    if (!this.user_id) {
      errors.push('用户ID不能为空')
    }
    
    if (!this.study_date) {
      errors.push('学习日期不能为空')
    }

    // 验证日期格式
    if (this.study_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(this.study_date)) {
        errors.push('日期格式不正确，应为 YYYY-MM-DD')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 转换为数据库格式
  toDatabaseFormat() {
    return {
      user_id: this.user_id,
      study_date: this.study_date,
      words_learned: this.words_learned,
      sentences_learned: this.sentences_learned,
      continuous_days: this.continuous_days
    }
  }

  // 从数据库记录创建实例
  static fromDatabase(record) {
    return new UserStudyRecord({
      record_id: record.record_id,
      user_id: record.user_id,
      study_date: record.study_date,
      words_learned: record.words_learned,
      sentences_learned: record.sentences_learned,
      continuous_days: record.continuous_days
    })
  }

  // 获取今日学习总数
  getTotalLearnings() {
    return this.words_learned + this.sentences_learned
  }

  // 更新连续天数
  updateContinuousDays(lastStudyDate) {
    const currentDate = new Date(this.study_date)
    const lastDate = new Date(lastStudyDate)
    const oneDay = 24 * 60 * 60 * 1000
    
    const diffDays = Math.floor((currentDate - lastDate) / oneDay)
    
    if (diffDays === 1) {
      // 连续学习
      this.continuous_days += 1
    } else if (diffDays > 1) {
      // 中断了连续
      this.continuous_days = 1
    } else {
      // 同一天或日期异常，不更新
      if (this.continuous_days === 0) {
        this.continuous_days = 1
      }
    }
  }
}

/**
 * 用户实体
 * 对应用户表
 */
export class User {
  constructor({
    user_id = null,
    username = '',
    email = '',
    password = '',
    nickname = '',
    created_at = null,
    last_login = null
  }) {
    this.user_id = user_id
    this.username = username
    this.email = email
    this.password = password
    this.nickname = nickname
    this.created_at = created_at || new Date().toISOString()
    this.last_login = last_login
  }

  // 验证用户数据
  validate() {
    const errors = []
    
    if (!this.username || this.username.trim() === '') {
      errors.push('用户名不能为空')
    }
    
    if (!this.email || this.email.trim() === '') {
      errors.push('邮箱不能为空')
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (this.email && !emailRegex.test(this.email)) {
      errors.push('邮箱格式不正确')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 转换为数据库格式（不含密码）
  toSafeDatabaseFormat() {
    return {
      username: this.username,
      email: this.email,
      nickname: this.nickname,
      created_at: this.created_at,
      last_login: this.last_login
    }
  }

  // 从数据库记录创建实例
  static fromDatabase(record) {
    return new User({
      user_id: record.user_id,
      username: record.username,
      email: record.email,
      nickname: record.nickname,
      created_at: record.created_at,
      last_login: record.last_login
    })
  }
}

// 枚举和常量
export const GRADE_LEVELS = {
  PRIMARY: 3,    // 小学
  JUNIOR: 4,     // 初中  
  SENIOR: 5      // 高中
}

export const DIFFICULTY_LEVELS = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  VERY_HARD: 4,
  EXPERT: 5
}