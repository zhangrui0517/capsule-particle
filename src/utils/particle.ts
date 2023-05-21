import { Controller, ParticleItem, ParticleItemPlus, FlatParticleTreeMap, FlatParticleTreeArr } from '../../typings'
import { PARTICLE_TOP, PARTICLE_FLAG } from '.'
import { cloneDeep } from './'
import { forEach } from 'lodash-es'

export function normalizeParticle<T extends object>(
	particleItem: ParticleItem<T> | ParticleItem<T>[] | ParticleItemPlus<T> | ParticleItemPlus<T>[],
	controller?: Controller<T> | null,
	options: {
		clone?: boolean
		isFirst?: boolean
	} = {
		clone: true
	}
) {
	const { clone, isFirst } = options
	const cloneParticleItem = clone ? cloneDeep(particleItem) : particleItem
	const formatParticleItem = Array.isArray(cloneParticleItem) ? cloneParticleItem : [cloneParticleItem]
	/** 打平树数据 */
	const flatParticleMap: FlatParticleTreeMap<T> = {}
	/** 按遍历顺序排序的数据数组 */
	const flatParticleArr: FlatParticleTreeArr<T> = []
	const queue: ParticleItem<T>[] | ParticleItemPlus<T>[] = formatParticleItem.slice(0) as
		| ParticleItem<T>[]
		| ParticleItemPlus<T>[]
	/** 遍历次数 */
	let isInit = isFirst !== undefined ? isFirst : true
	while (queue.length) {
		/** 如果为第一层 */
		if (isInit) {
			flatParticleMap[PARTICLE_TOP] = {
				key: PARTICLE_TOP,
				children: formatParticleItem as ParticleItem<T>[],
				[PARTICLE_FLAG]: null
			} as unknown as ParticleItemPlus<T>
			forEach(formatParticleItem, (item, index) => {
				item[PARTICLE_FLAG] = {
					parent: PARTICLE_TOP,
					index,
					layer: '0'
				}
			})
			isInit = false
		}
		/** 取出元素 */
		const currentParticle = queue.shift()! as ParticleItemPlus<T>
		/** 检查是否有重复的元素 */
		if (flatParticleMap[currentParticle.key]) {
			try {
				console.error(
					'An element with the same key already exists, please change it. The current configuration has been skipped. The repeat element is ',
					JSON.stringify(currentParticle)
				)
			} catch (err) {
				console.error(
					'An element with the same key already exists, please change it. The current configuration has been skipped. The repeat element is ',
					currentParticle.key
				)
			}
			continue
		}
		/** __particle会提前遍历父级并置入数据中 */
		const __particle__ = currentParticle[PARTICLE_FLAG]
		const { layer: particleLayer } = __particle__!
		/** 保存数据到打平数据中 */
		flatParticleMap[currentParticle.key] = currentParticle
		/** 按遍历顺序将数据保存到数组中 */
		flatParticleArr.push(currentParticle)
		/** 交给外部回调处理 */
		controller && controller(currentParticle)
		/** 处理子级 */
		if (currentParticle.children?.length) {
			forEach(currentParticle.children, (item, index) => {
				item[PARTICLE_FLAG] = {
					parent: currentParticle.key,
					index,
					layer: `${particleLayer}-${index}`
				}
				queue.splice(index, 0, item)
			})
		}
	}
	return {
		particleTree: formatParticleItem as ParticleItem<T>[],
		flatParticleMap,
		flatParticleArr
	}
}
