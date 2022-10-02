import { descriptionToParticle } from './utils'
import { Description, ParticleInfo } from './types'
export interface IOption {
  /** 描述 */
  description: Description | Description[]
  /** 描述控制器，在便利描述信息时，会调用该回调 */
  controller?: (descItem: IOption['description']) => void
}

class Particle {
  particle: ParticleInfo
  constructor(options: IOption) {
    const { description, controller } = options
    if (!description) {
      throw new Error(`Invaild description field, description is ${description}`)
    }
    console.time('Particle')
    this.particle = descriptionToParticle(description, controller)
    console.log('this.particle: ', this.particle)
    console.timeEnd('Particle')
  }
}

export default Particle
