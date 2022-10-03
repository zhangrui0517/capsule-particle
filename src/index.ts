import { descriptionToParticle, forFun, PARTICLE_FLAG, hasOwnProperty } from './utils'
import { Description, ParticleInfo, FlatParticle, ParticleItem } from './types'
import { cloneDeep } from 'lodash'
export interface IOption {
  /** 描述 */
  description: Description | Description[]
  /** 描述控制器，在便利描述信息时，会调用该回调 */
  controller?: (descItem: IOption['description']) => void
}

class Particle {
  #particle: ParticleInfo
  constructor(options: IOption) {
    const { description, controller } = options
    if (!description) {
      throw new Error(`Invaild description field, description is ${description}`)
    }
    this.#particle = descriptionToParticle(description, controller)
  }
  append(key: string, description: Description, direction: 'before' | 'after' = 'after') {
    const currentItem = this.#particle.flatParticle[key]
    if (currentItem) {
      const particleExtra = currentItem[PARTICLE_FLAG]
      const { parent, index, layer } = particleExtra
      const parentItem = this.#particle.flatParticle[parent]
      if (parentItem) {
        const cloneDescription = cloneDeep(description)
        cloneDescription[PARTICLE_FLAG] = {
          parent
        }
        parentItem.children!.splice(direction === 'after' ? index + 1 : index, 0, cloneDescription)
        forFun(parentItem.children!, (item, index) => {
          Object.assign(item[PARTICLE_FLAG], {
            index,
            layer: `${layer.slice(0, layer.length - 1)}${index}`
          })
        })
        this.#particle.flatParticle[description.key] = cloneDescription as ParticleItem
      }
    }
  }
  remove(keys: string[]) {
    forFun(keys, key => {
      const flatParticle = this.#particle.flatParticle
      const item = flatParticle[key]
      if (item) {
        const particleExtra = item[PARTICLE_FLAG]
        const { parent, index } = particleExtra
        const parentItem = flatParticle[parent]
        if (parentItem) {
          parentItem.children!.splice(index, 1)
          delete flatParticle[key]
          forFun(parentItem.children!, (item, index) => {
            const particleExtra = item[PARTICLE_FLAG]
            const { layer } = particleExtra
            item[PARTICLE_FLAG] = {
              ...particleExtra,
              index,
              layer: `${layer.slice(0, layer.length - 1)}${index}`
            }
          })
        }
      }
    })
  }
  setItem(key: string, data: Record<string, any>) {
    const item = this.#particle.flatParticle[key]
    if (item) {
      if (hasOwnProperty(data, 'key') || hasOwnProperty(data, 'children') || hasOwnProperty(data, PARTICLE_FLAG)) {
        console.error(`Setting key or children or ${PARTICLE_FLAG} is not allowed`)
        return false
      }
      const cloneData = cloneDeep(data)
      Object.assign(cloneData, data)
      return true
    } else {
      console.error(`Cannot find element to set, key is ${key}`)
      return false
    }
  }
  getItem(keys?: string[], dataType: 'object' | 'array' = 'object') {
    if (!keys) {
      return dataType === 'object' ? this.#particle.flatParticle : Object.values(this.#particle.flatParticle)
    }
    const result: FlatParticle | Record<string, undefined> = {}
    forFun(keys, key => {
      const item = this.#particle.flatParticle[key]
      if (item) {
        result[key] = item
      }
    })
    return dataType === 'object' ? result : Object.values(result)
  }
  getParticle() {
    return this.#particle.particleTree
  }
  replace(key: string, description: Description) {
    const replaceItem = this.#particle.flatParticle[key]
    if (replaceItem) {
      const { parent, index } = replaceItem[PARTICLE_FLAG]
      const parentItem = this.#particle.flatParticle[parent]
      const cloneDescription = cloneDeep(description)
      cloneDescription[PARTICLE_FLAG] = replaceItem[PARTICLE_FLAG]
      parentItem!.children!.splice(index, 1, cloneDescription)
      this.#particle.flatParticle[key] = cloneDescription as ParticleItem
    } else {
      throw new Error(`The element to be replaced does not exist, key is ${key}`)
    }
  }
}

export default Particle
