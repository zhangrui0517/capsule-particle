import { Description, Controller, PartialParticleItem, ParticleItem } from '../../typings'
import { PARTICLE_TOP, PARTICLE_FLAG } from '.'
import { cloneDeep } from './'
import { forEach } from 'lodash-es'

export function descriptionToParticle(description: Description | Description[], controller?: Controller) {
	const cloneDescription = cloneDeep(description) as PartialParticleItem | PartialParticleItem[]
	const formatDescription = Array.isArray(cloneDescription) ? cloneDescription : [cloneDescription]
	const flatParticleMap: Record<string, ParticleItem> = {}
	const flatParticleArr: ParticleItem[] = []
	const queue = formatDescription.slice(0)
	/** 遍历次数 */
	let traverseCount = 0
	while (queue.length) {
		/** 如果为第一层 */
		if (traverseCount === 0) {
			flatParticleMap[PARTICLE_TOP] = {
				key: PARTICLE_TOP,
				children: formatDescription as ParticleItem[],
				[PARTICLE_FLAG]: null
			} as unknown as ParticleItem
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
		flatParticleMap[currentDesc.key] = currentDesc as ParticleItem
		flatParticleArr.push(currentDesc as ParticleItem)
		controller && controller(currentDesc as ParticleItem)
		if (currentDesc.children?.length) {
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
		particleTree: formatDescription as ParticleItem[],
		flatParticleMap,
		flatParticleArr
	}
}

export function getAllChildrenByParticleItem(particle: ParticleItem): ParticleItem[] {
	const result: ParticleItem[] = []
	const children = particle.children
	if (children?.length) {
		let formatChildren = children.slice()
		while (formatChildren.length) {
			const currentParticle = formatChildren.shift()!
			result.push(currentParticle)
			if (currentParticle.children?.length) {
				formatChildren = [...currentParticle.children, ...formatChildren]
			}
		}
	}
	return result
}
