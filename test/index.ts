import { Particle } from '../src/index.ts'
import { description } from './data.ts'

console.time('particle')
const particleItem = new Particle(description)
console.timeEnd('particle')
console.log('#1 particleItem: ', particleItem)
