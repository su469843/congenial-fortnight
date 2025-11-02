// PostgreSQL 数据库配置文件和连接管理
import { Pool } from 'pg'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

class DatabaseManager {
  constructor() {
    this.pool = null
    this.initialized = false
  }

  // 初始化数据库连接池
  async init() {
    try {
      // 从环境变量获取数据库连接配置
      const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=${process.env.DB_SSL === 'true' ? 'require' : 'disable'}`

      this.pool = new Pool({
        connectionString,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 5, // 最大连接数
        min: 1, // 最小连接数
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 10000, // 增加连接超时时间
        statement_timeout: 30000,
        query_timeout: 30000,
      })

      // 测试连接
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()

      this.initialized = true
      console.log('PostgreSQL 数据库连接成功')
      return true
    } catch (error) {
      console.error('PostgreSQL 数据库连接失败:', error)
      this.initialized = false
      return false
    }
  }

  // 获取数据库连接池
  getPool() {
    if (!this.initialized || !this.pool) {
      throw new Error('数据库未初始化，请先调用 init() 方法')
    }
    return this.pool
  }

  // 执行SQL查询
  async query(text, params = []) {
    const pool = this.getPool()
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  // 执行事务
  async transaction(callback) {
    const pool = this.getPool()
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // 关闭数据库连接池
  async close() {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      this.initialized = false
    }
  }

  // 检查表是否存在
  async tableExists(tableName) {
    const result = await this.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )`,
      [tableName]
    )
    return result.rows[0].exists
  }

  // 创建表（如果不存在）
  async createTable(tableName, createSQL) {
    const exists = await this.tableExists(tableName)
    if (!exists) {
      await this.query(createSQL)
      console.log(`表 ${tableName} 创建成功`)
    }
  }

  // 初始化所有表
  async initTables() {
    // 单词表
    await this.createTable('words_table', `
      CREATE TABLE words_table (
        word_id SERIAL PRIMARY KEY,
        word VARCHAR(50) NOT NULL UNIQUE,
        phonetic VARCHAR(100),
        meaning VARCHAR(255) NOT NULL,
        grade_level SMALLINT,
        example_sentence VARCHAR(500),
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 句子表
    await this.createTable('sentences_table', `
      CREATE TABLE sentences_table (
        sentence_id SERIAL PRIMARY KEY,
        sentence VARCHAR(500) NOT NULL,
        translation VARCHAR(500) NOT NULL,
        grade_level SMALLINT,
        keywords VARCHAR(255),
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 用户学习记录表
    await this.createTable('user_study_records', `
      CREATE TABLE user_study_records (
        record_id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        study_date DATE NOT NULL,
        words_learned INTEGER DEFAULT 0,
        sentences_learned INTEGER DEFAULT 0,
        continuous_days SMALLINT DEFAULT 0,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, study_date)
      )
    `)

    // 用户表
    await this.createTable('users', `
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `)

    // 创建索引
    await this.query(`CREATE INDEX IF NOT EXISTS idx_words_word ON words_table(word)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_words_grade ON words_table(grade_level)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_sentences_grade ON sentences_table(grade_level)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_sentences_keywords ON sentences_table(keywords)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_study_records_user ON user_study_records(user_id)`)
    await this.query(`CREATE INDEX IF NOT EXISTS idx_study_records_date ON user_study_records(study_date)`)
  }
}

// 创建数据库管理器实例
export const dbManager = new DatabaseManager()

// 数据库操作工具函数
export const dbUtils = {
  // 获取所有记录
  async getAll(tableName) {
    const result = await dbManager.query(`SELECT * FROM ${tableName}`)
    return result.rows
  },

  // 根据ID获取记录
  async getById(tableName, id, idField = 'id') {
    const result = await dbManager.query(
      `SELECT * FROM ${tableName} WHERE ${idField} = $1`,
      [id]
    )
    return result.rows[0] || null
  },

  // 根据字段值获取记录（单个）
  async getByField(tableName, fieldName, value) {
    const result = await dbManager.query(
      `SELECT * FROM ${tableName} WHERE ${fieldName} = $1`,
      [value]
    )
    return result.rows[0] || null
  },

  // 根据字段值获取记录（多个）
  async getAllByField(tableName, fieldName, value) {
    const result = await dbManager.query(
      `SELECT * FROM ${tableName} WHERE ${fieldName} = $1`,
      [value]
    )
    return result.rows
  },

  // 添加记录
  async add(tableName, data) {
    const fields = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, index) => `${index + 1}`)
    
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `
    
    const result = await dbManager.query(query, values)
    return result.rows[0]
  },

  // 更新记录
  async update(tableName, data, idField = 'id') {
    const fields = Object.keys(data)
    const values = Object.values(data)
    
    const setClause = fields.map((field, index) => `${field} = ${index + 1}`).join(', ')
    const id = data[idField] || values.pop()
    
    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE ${idField} = ${fields.length + 1}
      RETURNING *
    `
    
    const result = await dbManager.query(query, [...values, id])
    return result.rows[0]
  },

  // 删除记录
  async delete(tableName, id, idField = 'id') {
    const result = await dbManager.query(
      `DELETE FROM ${tableName} WHERE ${idField} = $1 RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  // 清空表
  async clear(tableName) {
    await dbManager.query(`TRUNCATE TABLE ${tableName}`)
  },

  // 批量添加数据
  async bulkAdd(tableName, dataArray) {
    if (dataArray.length === 0) return 0
    
    const fields = Object.keys(dataArray[0])
    const values = dataArray.flatMap(obj => Object.values(obj))
    const placeholderGroups = []
    
    for (let i = 0; i < dataArray.length; i++) {
      const start = i * fields.length + 1
      const placeholders = fields.map((_, j) => `${start + j}`)
      placeholderGroups.push(`(${placeholders.join(', ')})`)
    }
    
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES ${placeholderGroups.join(', ')}
      RETURNING *
    `
    
    const result = await dbManager.query(query, values)
    return result.rows.length
  },

  // 按条件查询
  async query(tableName, conditions = {}, orderBy = '', limit = '') {
    let query = `SELECT * FROM ${tableName}`
    const params = []
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map((key, index) => {
        params.push(conditions[key])
        return `${key} = ${index + 1}`
      }).join(' AND ')
      query += ` WHERE ${whereClause}`
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`
    }
    
    if (limit) {
      query += ` LIMIT ${limit}`
    }
    
    const result = await dbManager.query(query, params)
    return result.rows
  },

  // 获取记录数量
  async count(tableName, conditions = {}) {
    let query = `SELECT COUNT(*) FROM ${tableName}`
    const params = []
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map((key, index) => {
        params.push(conditions[key])
        return `${key} = ${index + 1}`
      }).join(' AND ')
      query += ` WHERE ${whereClause}`
    }
    
    const result = await dbManager.query(query, params)
    return parseInt(result.rows[0].count)
  }
}

export default dbManager