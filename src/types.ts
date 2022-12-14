/** 描述信息 */
export type Description = {
  key: string
  children?: Array<Description>
} & Record<string, any>

/** 扩展信息，注入到描述中，用于记录父级信息等 */
export type ParticleExtraInfo = {
  __particle: {
    /** 父级的key */
    parent: string
    /** 在子元素中的位置 */
    index: number
    /** 层级记录 */
    layer: string
    /** 遍历顺序 */
    order: number
  }
}

/** 处理后的字段信息 */
export type ParticleItem = Description &
  ParticleExtraInfo & {
    children?: Array<ParticleItem>
  }

/** 字段信息映射表 */
export type FlatParticle = Record<string, ParticleItem>

/** 字段信息汇总表 */
export type ParticleInfo = {
  /** 字段信息映射表 */
  flatParticle: FlatParticle
  /** 处理后的字段树 */
  particleTree: ParticleItem[]
  /** 按遍历顺序的字段集合 */
  particles: ParticleItem[]
}

/** 回调函数状态 */
export type CallbackStatusParam = {
  /** 操作类型 */
  type: 'init' | 'append' | 'remove' | 'setItem' | 'replace'
  /** 操作的节点 */
  operationKey?: string[]
  /** 关联的节点 */
  relatKey?: string[]
  /** 操作/传入的数据 */
  data?: Record<string, any>
}
