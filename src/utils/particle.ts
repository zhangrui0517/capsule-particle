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
	controller?: Controller | null,
	options: {
		clone?: boolean
		isFirst?: boolean
	} = {
		clone: true
	}
) {
	const { clone, isFirst } = options
	const cloneDescription = (clone ? cloneDeep(description) : description) as PartialParticleItem | PartialParticleItem[]
	const formatDescription = Array.isArray(cloneDescription) ? cloneDescription : [cloneDescription]
	/** 打平树数据 */
	const flatParticleMap: FlatParticleTreeMap = {}
	/** 按遍历顺序排序的数据数组 */
	const flatParticleArr: FlatParticleTreeArr = []
	const queue = formatDescription.slice(0)
	/** 遍历次数 */
	let isInit = isFirst !== undefined ? isFirst : true
	while (queue.length) {
		/** 如果为第一层 */
		if (isInit) {
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
			isInit = false
		}
		/** 取出元素 */
		const currentDesc = queue.shift()!
		/** 检查是否有重复的元素 */
		if (flatParticleMap[currentDesc.key]) {
			try {
				console.error(
					'An element with the same key already exists, please change it. The current configuration has been skipped. The repeat element is ',
					JSON.stringify(currentDesc)
				)
			} catch (err) {
				console.error(
					'An element with the same key already exists, please change it. The current configuration has been skipped. The repeat element is ',
					currentDesc.key
				)
			}
			continue
		}
		/** __particle会提前遍历父级并置入数据中 */
		const { __particle } = currentDesc
		const { layer: particleLayer } = __particle
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
