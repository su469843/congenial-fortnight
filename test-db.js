// 数据库连接测试脚本
import { dbManager } from './src/db/database.js'
import { wordDAO, sentenceDAO, userStudyRecordDAO, userDAO } from './src/db/daos.js'
import { Word, Sentence, UserStudyRecord, User } from './src/db/models.js'

async function testDatabase() {
  console.log('🚀 开始测试 PostgreSQL 数据库连接...')

  try {
    // 1. 初始化数据库连接
    console.log('1. 初始化数据库连接...')
    const initSuccess = await dbManager.init()
    if (!initSuccess) {
      throw new Error('数据库连接初始化失败')
    }
    console.log('✅ 数据库连接成功')

    // 2. 初始化表结构
    console.log('2. 初始化表结构...')
    await dbManager.initTables()
    console.log('✅ 表结构初始化完成')

    // 3. 测试创建单词
    console.log('3. 测试创建单词...')
    const testWord = new Word({
      word: 'apple',
      phonetic: '/ˈæpl/',
      meaning: '苹果',
      grade_level: 3,
      example_sentence: 'I like to eat an apple every day.'
    })
    const wordId = await wordDAO.create(testWord)
    console.log(`✅ 单词创建成功，ID: ${wordId}`)

    // 4. 测试查询单词
    console.log('4. 测试查询单词...')
    const foundWord = await wordDAO.findById(wordId)
    console.log(`✅ 单词查询成功: ${foundWord.word} - ${foundWord.meaning}`)

    // 5. 测试创建句子
    console.log('5. 测试创建句子...')
    const testSentence = new Sentence({
      sentence: 'The cat is sleeping on the sofa.',
      translation: '猫在沙发上睡觉。',
      grade_level: 4,
      keywords: 'cat, sleeping, sofa'
    })
    const sentenceId = await sentenceDAO.create(testSentence)
    console.log(`✅ 句子创建成功，ID: ${sentenceId}`)

    // 6. 测试创建用户
    console.log('6. 测试创建用户...')
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      nickname: '测试用户'
    })
    const userId = await userDAO.create(testUser)
    console.log(`✅ 用户创建成功，ID: ${userId}`)

    // 7. 测试创建学习记录
    console.log('7. 测试创建学习记录...')
    const testRecord = new UserStudyRecord({
      user_id: userId,
      words_learned: 5,
      sentences_learned: 3,
      continuous_days: 1
    })
    const recordId = await userStudyRecordDAO.create(testRecord)
    console.log(`✅ 学习记录创建成功，ID: ${recordId}`)

    // 8. 测试更新学习记录
    console.log('8. 测试更新学习记录...')
    await userStudyRecordDAO.updateLearningCount(userId, 2, 1)
    console.log('✅ 学习记录更新成功')

    // 9. 测试统计查询
    console.log('9. 测试统计查询...')
    const wordStats = await wordDAO.getStats()
    console.log('✅ 单词统计:', wordStats)

    const userStats = await userStudyRecordDAO.getUserStats(userId)
    console.log('✅ 用户学习统计:', userStats)

    console.log('🎉 所有测试通过！数据库连接正常。')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error('详细错误:', error)
  } finally {
    // 关闭数据库连接
    await dbManager.close()
    console.log('🔚 数据库连接已关闭')
  }
}

// 运行测试
testDatabase()