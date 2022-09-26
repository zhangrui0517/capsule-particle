import { jsonClone, flatDescribe } from './utils'

export interface IOption {
  /** 描述 */
  describe: {
    $key: string
    $children?: Array<IOption['describe']>
  } & Record<string, any>
  /** 描述控制器，在便利描述信息时，会调用该回调 */
  controller?: (descItem: IOption['describe']) => void
  /** 对describe的字段类型映射表，用于提升深度克隆时的性能 */
  schema?: Record<string, any>
}

class Particle {
  flatDescribe: Record<string, IOption['describe']>
  constructor(options: IOption) {
    const { describe, schema, controller } = options
    if (!describe) {
      throw new Error(`Invaild describe field, describe is ${describe}`)
    }
    this.flatDescribe = flatDescribe(jsonClone(describe, schema), controller)
  }
}

export default Particle
