import {
	Description,
	Controller,
	PartialParticleItem,
	ParticleItem,
	FlatParticleTreeMap,
	FlatParticleTreeArr
} from '../../typings'
import { PARTICLE_TOP, PARTICLE_FLAG } from '.'
import { cloneDeep } from './'
import { forEach } from 'lodash-es'

export function descriptionToParticle(
	description: Description | Description[],
	controller?: Controller,
	options: {
		clone?: boolean
		startOrder?: number
	} = {
		clone: true
	}
) {
	const { clone, startOrder } = options
	const cloneDescription = (clone ? cloneDeep(description) : description) as PartialParticleItem | PartialParticleItem[]
	const formatDescription = Array.isArray(cloneDescription) ? cloneDescription : [cloneDescription]
	/** 打平树数据 */
	const flatParticleMap: FlatParticleTreeMap = {}
	/** 按遍历顺序排序的数据数组 */
	const flatParticleArr: FlatParticleTreeArr = []
	const queue = formatDescription.slice(0)
	/** 遍历次数 */
	let traverseCount = startOrder || 0
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
		/** 取出元素 */
		const currentDesc = queue.shift()!
		/** __particle会提前遍历父级并置入数据中 */
		const { __particle } = currentDesc
		__particle.order = traverseCount
		const { layer: particleLayer } = __particle
		/** 遍历次数累计 */
		traverseCount += 1
		/** 保存数据到打平数据中 */
		flatParticleMap[currentDesc.key] = currentDesc as ParticleItem
		/** 按遍历顺序将数据保存到数组中 */
		flatParticleArr.push(currentDesc as ParticleItem)
		/** 交给外部回调处理 */
		controller && controller(currentDesc as ParticleItem)
		/** 处理子级 */
		if (currentDesc.children?.length) {
			forEach(currentDesc.children, (item, index) => {
				item.__particle = {
					parent: currentDesc.key,
					index,
					layer: `${particleLayer}-${index}`
				}
				queue.splice(index, 0, item)
			})
		}
	}
	return {
		particleTree: formatDescription as ParticleItem[],
		flatParticleMap,
		flatParticleArr
	}
}

/** 获取元素的所有子级数据 */
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
