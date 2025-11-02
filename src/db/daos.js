// PostgreSQL 数据访问对象 (DAO) 层
import { dbManager, dbUtils } from './database.js'
import { Word, Sentence, UserStudyRecord, User, GRADE_LEVELS } from './models.js'

/**
 * 单词数据访问对象
 */
export class WordDAO {
  constructor() {
    this.tableName = 'words_table'
  }

  // 创建单词
  async create(word) {
    const validation = word.validate()
    if (!validation.isValid) {
      throw new Error(`单词数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = word.toDatabaseFormat()
    const result = await dbUtils.add(this.tableName, data)
    return result.word_id
  }

  // 根据ID获取单词
  async findById(id) {
    const record = await dbUtils.getById(this.tableName, id, 'word_id')
    return record ? Word.fromDatabase(record) : null
  }

  // 根据单词获取单词（精确匹配）
  async findByWord(wordText) {
    const record = await dbUtils.getByField(this.tableName, 'word', wordText)
    return record ? Word.fromDatabase(record) : null
  }

  // 根据年级获取单词
  async findByGradeLevel(gradeLevel) {
    const records = await dbUtils.getAllByField(this.tableName, 'grade_level', gradeLevel)
    return records.map(record => Word.fromDatabase(record))
  }

  // 获取所有单词
  async findAll() {
    const records = await dbUtils.getAll(this.tableName)
    return records.map(record => Word.fromDatabase(record))
  }

  // 更新单词
  async update(word) {
    if (!word.word_id) {
      throw new Error('单词ID不能为空')
    }
    
    const validation = word.validate()
    if (!validation.isValid) {
      throw new Error(`单词数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = word.toDatabaseFormat()
    data.word_id = word.word_id
    await dbUtils.update(this.tableName, data, 'word_id')
  }

  // 删除单词
  async delete(id) {
    await dbUtils.delete(this.tableName, id, 'word_id')
  }

  // 批量创建单词
  async bulkCreate(words) {
    const errors = []
    const validWords = []

    // 验证所有单词
    words.forEach((word, index) => {
      const validation = word.validate()
      if (!validation.isValid) {
        errors.push(`第${index + 1}个单词: ${validation.errors.join(', ')}`)
      } else {
        validWords.push(word.toDatabaseFormat())
      }
    })

    if (errors.length > 0) {
      throw new Error(`批量创建单词失败: ${errors.join('; ')}`)
    }

    await dbUtils.bulkAdd(this.tableName, validWords)
    return validWords.length
  }

  // 根据关键词搜索单词
  async searchByKeyword(keyword) {
    const result = await dbManager.query(
      `SELECT * FROM ${this.tableName} 
       WHERE LOWER(word) LIKE LOWER($1) OR LOWER(meaning) LIKE LOWER($1)`,
      [`%${keyword}%`]
    )
    return result.rows.map(record => Word.fromDatabase(record))
  }

  // 获取单词统计信息
  async getStats() {
    const result = await dbManager.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN grade_level = $1 THEN 1 END) as primary_count,
         COUNT(CASE WHEN grade_level = $2 THEN 1 END) as junior_count,
         COUNT(CASE WHEN grade_level = $3 THEN 1 END) as senior_count
       FROM ${this.tableName}`,
      [GRADE_LEVELS.PRIMARY, GRADE_LEVELS.JUNIOR, GRADE_LEVELS.SENIOR]
    )
    
    const stats = result.rows[0]
    return {
      total: parseInt(stats.total),
      byGradeLevel: {
        [GRADE_LEVELS.PRIMARY]: parseInt(stats.primary_count),
        [GRADE_LEVELS.JUNIOR]: parseInt(stats.junior_count),
        [GRADE_LEVELS.SENIOR]: parseInt(stats.senior_count)
      }
    }
  }
}

/**
 * 句子数据访问对象
 */
export class SentenceDAO {
  constructor() {
    this.tableName = 'sentences_table'
  }

  // 创建句子
  async create(sentence) {
    const validation = sentence.validate()
    if (!validation.isValid) {
      throw new Error(`句子数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = sentence.toDatabaseFormat()
    const result = await dbUtils.add(this.tableName, data)
    return result.sentence_id
  }

  // 根据ID获取句子
  async findById(id) {
    const record = await dbUtils.getById(this.tableName, id, 'sentence_id')
    return record ? Sentence.fromDatabase(record) : null
  }

  // 根据年级获取句子
  async findByGradeLevel(gradeLevel) {
    const records = await dbUtils.getAllByField(this.tableName, 'grade_level', gradeLevel)
    return records.map(record => Sentence.fromDatabase(record))
  }

  // 根据关键词获取句子
  async findByKeywords(keyword) {
    const result = await dbManager.query(
      `SELECT * FROM ${this.tableName} WHERE keywords LIKE $1`,
      [`%${keyword}%`]
    )
    return result.rows.map(record => Sentence.fromDatabase(record))
  }

  // 获取所有句子
  async findAll() {
    const records = await dbUtils.getAll(this.tableName)
    return records.map(record => Sentence.fromDatabase(record))
  }

  // 更新句子
  async update(sentence) {
    if (!sentence.sentence_id) {
      throw new Error('句子ID不能为空')
    }
    
    const validation = sentence.validate()
    if (!validation.isValid) {
      throw new Error(`句子数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = sentence.toDatabaseFormat()
    data.sentence_id = sentence.sentence_id
    await dbUtils.update(this.tableName, data, 'sentence_id')
  }

  // 删除句子
  async delete(id) {
    await dbUtils.delete(this.tableName, id, 'sentence_id')
  }

  // 批量创建句子
  async bulkCreate(sentences) {
    const errors = []
    const validSentences = []

    // 验证所有句子
    sentences.forEach((sentence, index) => {
      const validation = sentence.validate()
      if (!validation.isValid) {
        errors.push(`第${index + 1}个句子: ${validation.errors.join(', ')}`)
      } else {
        validSentences.push(sentence.toDatabaseFormat())
      }
    })

    if (errors.length > 0) {
      throw new Error(`批量创建句子失败: ${errors.join('; ')}`)
    }

    await dbUtils.bulkAdd(this.tableName, validSentences)
    return validSentences.length
  }

  // 根据关键词搜索句子
  async searchByKeyword(keyword) {
    const result = await dbManager.query(
      `SELECT * FROM ${this.tableName} 
       WHERE LOWER(sentence) LIKE LOWER($1) 
          OR LOWER(translation) LIKE LOWER($1) 
          OR LOWER(keywords) LIKE LOWER($1)`,
      [`%${keyword}%`]
    )
    return result.rows.map(record => Sentence.fromDatabase(record))
  }

  // 获取句子统计信息
  async getStats() {
    const result = await dbManager.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(CASE WHEN grade_level = $1 THEN 1 END) as primary_count,
         COUNT(CASE WHEN grade_level = $2 THEN 1 END) as junior_count,
         COUNT(CASE WHEN grade_level = $3 THEN 1 END) as senior_count
       FROM ${this.tableName}`,
      [GRADE_LEVELS.PRIMARY, GRADE_LEVELS.JUNIOR, GRADE_LEVELS.SENIOR]
    )
    
    const stats = result.rows[0]
    return {
      total: parseInt(stats.total),
      byGradeLevel: {
        [GRADE_LEVELS.PRIMARY]: parseInt(stats.primary_count),
        [GRADE_LEVELS.JUNIOR]: parseInt(stats.junior_count),
        [GRADE_LEVELS.SENIOR]: parseInt(stats.senior_count)
      }
    }
  }
}

/**
 * 用户学习记录数据访问对象
 */
export class UserStudyRecordDAO {
  constructor() {
    this.tableName = 'user_study_records'
  }

  // 创建学习记录
  async create(record) {
    const validation = record.validate()
    if (!validation.isValid) {
      throw new Error(`学习记录数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = record.toDatabaseFormat()
    const result = await dbUtils.add(this.tableName, data)
    return result.record_id
  }

  // 根据ID获取学习记录
  async findById(id) {
    const record = await dbUtils.getById(this.tableName, id, 'record_id')
    return record ? UserStudyRecord.fromDatabase(record) : null
  }

  // 根据用户ID获取学习记录
  async findByUserId(userId) {
    const records = await dbUtils.getAllByField(this.tableName, 'user_id', userId)
    return records.map(record => UserStudyRecord.fromDatabase(record))
  }

  // 根据学习日期获取记录
  async findByDate(studyDate) {
    const records = await dbUtils.getAllByField(this.tableName, 'study_date', studyDate)
    return records.map(record => UserStudyRecord.fromDatabase(record))
  }

  // 获取用户的学习历史
  async getUserHistory(userId, startDate = null, endDate = null) {
    let query = `SELECT * FROM ${this.tableName} WHERE user_id = $1`
    const params = [userId]
    
    if (startDate) {
      query += ` AND study_date >= ${params.length + 1}`
      params.push(startDate)
    }
    
    if (endDate) {
      query += ` AND study_date <= ${params.length + 1}`
      params.push(endDate)
    }
    
    query += ` ORDER BY study_date ASC`
    
    const result = await dbManager.query(query, params)
    return result.rows.map(record => UserStudyRecord.fromDatabase(record))
  }

  // 获取用户今日学习记录
  async getTodayRecord(userId) {
    const today = new Date().toISOString().split('T')[0]
    const result = await dbManager.query(
      `SELECT * FROM ${this.tableName} WHERE user_id = $1 AND study_date = $2`,
      [userId, today]
    )
    const record = result.rows[0]
    return record ? UserStudyRecord.fromDatabase(record) : null
  }

  // 获取用户的学习统计
  async getUserStats(userId) {
    const result = await dbManager.query(
      `SELECT 
         SUM(words_learned) as total_words,
         SUM(sentences_learned) as total_sentences,
         COUNT(*) as total_days,
         MAX(continuous_days) as max_continuous_days
       FROM ${this.tableName}
       WHERE user_id = $1`,
      [userId]
    )
    
    const stats = result.rows[0]
    const totalWords = parseInt(stats.total_words) || 0
    const totalSentences = parseInt(stats.total_sentences) || 0
    const totalDays = parseInt(stats.total_days) || 0
    const maxContinuousDays = parseInt(stats.max_continuous_days) || 0

    return {
      totalWords,
      totalSentences,
      totalLearnings: totalWords + totalSentences,
      totalDays,
      maxContinuousDays,
      averagePerDay: totalDays > 0 ? Math.round((totalWords + totalSentences) / totalDays) : 0
    }
  }

  // 更新学习记录（累加学习数量）
  async updateLearningCount(userId, wordsCount = 0, sentencesCount = 0) {
    const todayRecord = await this.getTodayRecord(userId)
    
    return await dbManager.transaction(async (client) => {
      if (todayRecord) {
        // 更新现有记录
        const result = await client.query(
          `UPDATE ${this.tableName}
           SET words_learned = words_learned + $1,
               sentences_learned = sentences_learned + $2,
               continuous_days = CASE 
                 WHEN EXISTS (
                   SELECT 1 FROM ${this.tableName} 
                   WHERE user_id = $3 
                     AND study_date = CURRENT_DATE - INTERVAL '1 day'
                 ) THEN (
                   SELECT continuous_days + 1 
                   FROM ${this.tableName} 
                   WHERE user_id = $3 
                     AND study_date = CURRENT_DATE - INTERVAL '1 day'
                   LIMIT 1
                 )
                 ELSE 1
               END
           WHERE user_id = $3 AND study_date = CURRENT_DATE
           RETURNING *`,
          [wordsCount, sentencesCount, userId]
        )
        return UserStudyRecord.fromDatabase(result.rows[0])
      } else {
        // 创建新记录
        const result = await client.query(
          `INSERT INTO ${this.tableName} (user_id, study_date, words_learned, sentences_learned, continuous_days)
           VALUES ($1, CURRENT_DATE, $2, $3, 1)
           RETURNING *`,
          [userId, wordsCount, sentencesCount]
        )
        return UserStudyRecord.fromDatabase(result.rows[0])
      }
    })
  }

  // 更新学习记录
  async update(record) {
    if (!record.record_id) {
      throw new Error('学习记录ID不能为空')
    }
    
    const validation = record.validate()
    if (!validation.isValid) {
      throw new Error(`学习记录数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = record.toDatabaseFormat()
    data.record_id = record.record_id
    const result = await dbUtils.update(this.tableName, data, 'record_id')
    return result
  }

  // 删除学习记录
  async delete(id) {
    await dbUtils.delete(this.tableName, id, 'record_id')
  }
}

/**
 * 用户数据访问对象
 */
export class UserDAO {
  constructor() {
    this.tableName = 'users'
  }

  // 创建用户
  async create(user) {
    const validation = user.validate()
    if (!validation.isValid) {
      throw new Error(`用户数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = user.toSafeDatabaseFormat()
    const result = await dbUtils.add(this.tableName, data)
    return result.user_id
  }

  // 根据ID获取用户
  async findById(id) {
    const record = await dbUtils.getById(this.tableName, id, 'user_id')
    return record ? User.fromDatabase(record) : null
  }

  // 根据用户名获取用户
  async findByUsername(username) {
    const record = await dbUtils.getByField(this.tableName, 'username', username)
    return record ? User.fromDatabase(record) : null
  }

  // 根据邮箱获取用户
  async findByEmail(email) {
    const record = await dbUtils.getByField(this.tableName, 'email', email)
    return record ? User.fromDatabase(record) : null
  }

  // 获取所有用户
  async findAll() {
    const records = await dbUtils.getAll(this.tableName)
    return records.map(record => User.fromDatabase(record))
  }

  // 更新用户
  async update(user) {
    if (!user.user_id) {
      throw new Error('用户ID不能为空')
    }
    
    const validation = user.validate()
    if (!validation.isValid) {
      throw new Error(`用户数据验证失败: ${validation.errors.join(', ')}`)
    }

    const data = user.toSafeDatabaseFormat()
    data.user_id = user.user_id
    const result = await dbUtils.update(this.tableName, data, 'user_id')
    return result
  }

  // 删除用户
  async delete(id) {
    await dbUtils.delete(this.tableName, id, 'user_id')
  }

  // 更新最后登录时间
  async updateLastLogin(userId) {
    await dbManager.query(
      `UPDATE ${this.tableName} SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [userId]
    )
  }

  // 用户登录验证（简单版本）
  async authenticate(username, password) {
    const result = await dbManager.query(
      `SELECT * FROM ${this.tableName} WHERE username = $1 AND password = $2`,
      [username, password]
    )
    
    if (result.rows.length > 0) {
      const user = User.fromDatabase(result.rows[0])
      await this.updateLastLogin(user.user_id)
      return user
    }
    
    return null
  }
}

// 创建DAO实例
export const wordDAO = new WordDAO()
export const sentenceDAO = new SentenceDAO()
export const userStudyRecordDAO = new UserStudyRecordDAO()
export const userDAO = new UserDAO()