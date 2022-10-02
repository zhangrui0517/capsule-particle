import Particle, { IOption } from '../src'
import { description } from './data'

function controller(descItem: IOption['description']) {
  descItem
}

const particleObj = new Particle({
  description,
  controller
})

console.log('particleObj', particleObj)
