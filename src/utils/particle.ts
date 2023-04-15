import { Description, Controller, PartialParticleItem, ParticleItem } from '../../typings'
import { PARTICLE_TOP, PARTICLE_FLAG } from '.'
import { cloneDeep } from './'
import { forEach } from 'lodash-es'

export function descriptionToParticle(
	description: Description | Description[],
	controller?: Controller
): {
	descTree: ParticleItem[]
	flatDescTree: Record<string, ParticleItem>
} {
	const cloneDescription = cloneDeep(description) as PartialParticleItem | PartialParticleItem[]
	const formatDescription = Array.isArray(cloneDescription) ? cloneDescription : [cloneDescription]
	const flatDescTree: Record<string, ParticleItem> = {}
	const queue = formatDescription.slice(0)
	/** 遍历次数 */
	let traverseCount = 0
	while (queue.length) {
		/** 如果为第一层 */
		if (traverseCount === 0) {
			forEach(formatDescription, (item, index) => {
				item[PARTICLE_FLAG] = {
					parent: PARTICLE_TOP,
					index,
					layer: '0'
				}
			})
		}
		const currentDesc = queue.shift()!
		const { __particle } = currentDesc
		__particle.order = traverseCount
		const { layer: particleLayer } = __particle
		traverseCount += 1
		flatDescTree[currentDesc.key] = currentDesc as ParticleItem
		controller && controller(currentDesc as ParticleItem)
		if (currentDesc.children) {
			forEach(currentDesc.children, (item, index) => {
				item.__particle = {
					parent: currentDesc.key,
					index,
					layer: `${particleLayer}-${index}`
				}
				queue.unshift(item)
			})
		}
	}
	return {
		descTree: formatDescription as ParticleItem[],
		flatDescTree
	}
}
