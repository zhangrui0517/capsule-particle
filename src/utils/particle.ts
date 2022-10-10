import { IOption } from '..'
import { Description, FlatParticle, ParticleInfo, ParticleItem } from '../types'
import { PARTICLE_FLAG, hasOwnProperty, PARTICLE_TOP } from '.'
import { cloneDeep } from 'lodash'

/**
 * 处理描述信息，建立父子级关系，并打平信息
 * @param description 描述信息
 * @param callback 回调处理
 */
export function descriptionToParticle(description: Description | Description[], callback?: IOption['controller']): ParticleInfo {
  const formatdescription = Array.isArray(description) ? cloneDeep(description) : [cloneDeep(description)]
  // 记录打平信息
  const flatParticle: FlatParticle = {}
  // 按顺序记录字段信息
  const particles: ParticleItem[] = []
  // 遍历队列
  let queue: Description[] = formatdescription.slice(0)
  // 辅助队列，用于记录队列中字段的额外数据
  let auxiliaryQueue: Array<Record<string, any>> = queue.map((_item, index, arr) => ({
    parent: PARTICLE_TOP,
    index,
    layer: arr.length === 1 ? '0' : `0-${index}`
  }))
  // 遍历次数
  let ergodicOrder = 0
  while (queue[0]) {
    const currentDesc = queue.shift() as Description
    const auxiliary = auxiliaryQueue.shift() || {}
    if (hasOwnProperty(flatParticle, currentDesc.key)) {
      console.error(`Repeat key, skip. key is ${currentDesc.key}`)
      break
    }
    const { parent, index, layer } = auxiliary
    currentDesc[PARTICLE_FLAG] = {
      parent,
      index,
      layer,
      order: ergodicOrder
    }
    const result = callback && callback(currentDesc as ParticleItem)
    if (result !== undefined && !result) {
      break
    }
    flatParticle[currentDesc.key] = currentDesc as ParticleItem
    particles.push(currentDesc as ParticleItem)
    ergodicOrder += 1
    if (currentDesc.children?.length) {
      queue = [...currentDesc.children, ...queue]
      const childrenAuxiliary = currentDesc.children.map((_childItem, index) => ({
        parent: currentDesc.key,
        index,
        layer: `${layer}-${index}`
      }))
      auxiliaryQueue = [...childrenAuxiliary, ...auxiliaryQueue]
    }
  }

  return {
    flatParticle,
    particleTree: formatdescription as ParticleInfo['particleTree'],
    particles
  }
}
