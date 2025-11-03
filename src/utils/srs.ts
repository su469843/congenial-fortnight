import type { SRSItem } from '@/types'

/**
 * SM-2算法实现
 * 基于用户的回答质量调整单词复习间隔
 */
export class SM2Algorithm {
  // 默认参数
  private static readonly DEFAULT_EASE_FACTOR = 2.5
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly EASE_FACTOR_INCREASE = 0.1
  private static readonly EASE_FACTOR_DECREASE = 0.2

  /**
   * 计算下一次复习间隔
   * @param item 当前SRS项目
   * @param quality 回答质量 (0-5)
   * 0: 完全忘记, 1: 错误但有印象, 2: 错误但容易纠正, 3: 正确但困难, 4: 正确且有些犹豫, 5: 完美回忆
   * @returns 更新后的SRS项目
   */
  static calculateNextReview(item: SRSItem, quality: number): SRSItem {
    let { easeFactor, interval, repetitions, lastReviewDate } = item
    
    // 更新重复次数
    if (quality >= 3) {
      repetitions += 1
    } else {
      repetitions = 0
      interval = 1
    }

    // 更新难度因子
    easeFactor = Math.max(
      this.MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )

    // 计算新的间隔（天数）
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }

    // 计算下一次复习日期
    const now = new Date()
    const nextReviewDate = new Date(now)
    nextReviewDate.setDate(now.getDate() + interval)

    return {
      ...item,
      easeFactor,
      interval,
      repetitions,
      lastReviewDate: now,
      nextReviewDate
    }
  }

  /**
   * 创建新的SRS项目
   * @param id 单词ID
   * @returns 初始SRS项目
   */
  static createNewItem(id: number): SRSItem {
    const now = new Date()
    const nextReviewDate = new Date(now)
    nextReviewDate.setDate(now.getDate() + 1) // 第二天开始复习

    return {
      id,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      interval: 1,
      repetitions: 0,
      nextReviewDate,
      lastReviewDate: undefined
    }
  }

  /**
   * 检查单词是否需要复习
   * @param item SRS项目
   * @returns 是否需要复习
   */
  static needsReview(item: SRSItem): boolean {
    const now = new Date()
    return item.nextReviewDate <= now
  }

  /**
   * 根据回答质量获取经验值
   * @param quality 回答质量
   * @returns 经验值
   */
  static getExperienceGain(quality: number): number {
    const experienceMap = {
      0: 0,   // 完全忘记
      1: 5,   // 错误但有印象
      2: 10,  // 错误但容易纠正
      3: 15,  // 正确但困难
      4: 20,  // 正确且有些犹豫
      5: 25   // 完美回忆
    }
    return experienceMap[quality] || 0
  }

  /**
   * 将回答质量映射为简单的正确/错误判断
   * @param quality 回答质量
   * @returns 是否正确
   */
  static isCorrectAnswer(quality: number): boolean {
    return quality >= 3
  }
}

/**
 * SRS学习队列管理器
 */
export class SRSQueueManager {
  private srsData: Map<number, SRSItem> = new Map()

  /**
   * 添加或更新单词的SRS数据
   * @param wordId 单词ID
   * @param quality 回答质量
   */
  updateWordProgress(wordId: number, quality: number): void {
    const currentItem = this.srsData.get(wordId) || SM2Algorithm.createNewItem(wordId)
    const updatedItem = SM2Algorithm.calculateNextReview(currentItem, quality)
    this.srsData.set(wordId, updatedItem)
  }

  /**
   * 获取需要复习的单词ID列表
   * @returns 需要复习的单词ID数组
   */
  getWordsForReview(): number[] {
    const reviewWords: number[] = []
    for (const [id, item] of this.srsData) {
      if (SM2Algorithm.needsReview(item)) {
        reviewWords.push(id)
      }
    }
    return reviewWords.sort((a, b) => {
      // 按照复习日期排序，最早的优先
      const itemA = this.srsData.get(a)!
      const itemB = this.srsData.get(b)!
      return itemA.nextReviewDate.getTime() - itemB.nextReviewDate.getTime()
    })
  }

  /**
   * 获取单词的SRS数据
   * @param wordId 单词ID
   * @returns SRS项目或undefined
   */
  getSRSItem(wordId: number): SRSItem | undefined {
    return this.srsData.get(wordId)
  }

  /**
   * 获取所有SRS数据
   * @returns 所有SRS项目的Map
   */
  getAllSRSData(): Map<number, SRSItem> {
    return new Map(this.srsData)
  }

  /**
   * 从JSON数据加载SRS状态
   * @param data SRS数据的JSON表示
   */
  loadFromJSON(data: Record<number, SRSItem>): void {
    this.srsData = new Map()
    for (const [idStr, item] of Object.entries(data)) {
      const id = parseInt(idStr)
      this.srsData.set(id, {
        ...item,
        nextReviewDate: new Date(item.nextReviewDate),
        lastReviewDate: item.lastReviewDate ? new Date(item.lastReviewDate) : undefined
      })
    }
  }

  /**
   * 将SRS状态导出为JSON
   * @returns SRS数据的JSON表示
   */
  exportToJSON(): Record<number, SRSItem> {
    const result: Record<number, SRSItem> = {}
    for (const [id, item] of this.srsData) {
      result[id] = item
    }
    return result
  }
}