import { IOption } from '..'
import { Description, ParticleExtraInfo, FlatParticle, ParticleInfo, ParticleItem } from '../types'
import { forFun, PARTICLE_FLAG, hasOwnProperty } from '.'
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
  // 遍历容器
  let container: Array<Description[]> = [formatdescription]
  // 扩展信息
  let particleInfo: Partial<ParticleExtraInfo['__particle']>[] = []

  while (container.length) {
    const newContainer: Array<Description[]> = []
    const newParticleInfo: Partial<ParticleExtraInfo['__particle']>[] = []
    forFun(container, (containerItem, index) => {
      const extra = particleInfo[index]
      forFun(containerItem, (descriptionItem, index) => {
        if (!hasOwnProperty(flatParticle, descriptionItem.key)) {
          descriptionItem[PARTICLE_FLAG] = {
            ...extra,
            index
          }
          flatParticle[descriptionItem.key] = descriptionItem as ParticleItem
          if (descriptionItem.children?.length) {
            newContainer.push(descriptionItem.children)
            newParticleInfo.push({
              parent: descriptionItem.key
            })
          }
          callback && callback(descriptionItem)
        } else {
          console.warn(`Repeat key, skip. key is ${descriptionItem.key}`)
        }
      })
    })
    container = newContainer
    particleInfo = newParticleInfo
  }

  return {
    flatParticle,
    particleTree: formatdescription as ParticleInfo['particleTree']
  }
}
