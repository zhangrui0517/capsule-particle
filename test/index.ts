import { Particle } from '../dist'
import { description } from './data'

console.time('particle')
const particleItem = new Particle(description)
console.timeEnd('particle')
console.log('#1 particleItem: ', particleItem)
