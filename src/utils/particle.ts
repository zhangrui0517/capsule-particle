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

/** 为每一级节点收集子级元素 */
export function _setParticleKeyToParent(
	currentParentItem: PartialParticleItem,
	flatPaticle: FlatParticleTreeMap,
	accKey?: string
) {
	const { __particle, key } = currentParentItem
	const { parent } = __particle
	if (parent !== PARTICLE_TOP) {
		const parentParticle = flatPaticle[parent!]!
		parentParticle.__particle.children = parentParticle.__particle.children || []
		if (accKey) {
			parentParticle.__particle.children.push(accKey)
		} else {
			parentParticle.__particle.children.push(key)
		}
		_setParticleKeyToParent(parentParticle, flatPaticle, accKey || key)
	}
}

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
	/** 记录每个元素的所有父级信息 */
	const flatParticleParents: Record<string, string[]> = {}
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
		const { __particle, key } = currentDesc
		__particle.order = traverseCount
		const { layer: particleLayer, parent } = __particle
		/** 遍历次数累计 */
		traverseCount += 1
		/** 保存数据到打平数据中 */
		flatParticleMap[currentDesc.key] = currentDesc as ParticleItem
		/** 按遍历顺序将数据保存到数组中 */
		flatParticleArr.push(currentDesc as ParticleItem)
		const parents = flatParticleParents[parent!]
		if (parents) {
			flatParticleParents[key] = parents.concat([parent!])
		} else {
			flatParticleParents[key] = parent !== PARTICLE_TOP ? [parent!] : []
		}
		forEach(flatParticleParents[key], (parent) => {
			flatParticleMap[parent]!.__particle.children = flatParticleMap[parent]!.__particle.children || []
			flatParticleMap[parent]!.__particle.children!.push(key)
		})
		// _setParticleKeyToParent(currentDesc, flatParticleMap)
		controller && controller(currentDesc as ParticleItem)
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
