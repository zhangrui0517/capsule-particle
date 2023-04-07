import Particle, { IOption } from '../src'
import { description } from './data'

function controller(descItem: IOption['description']) {
	// console.log('descItem: ', descItem)
	descItem
}

console.time('particleObj')
const particleObj = new Particle({
	description,
	controller
})
console.timeEnd('particleObj')

console.log('particleObj', particleObj)
