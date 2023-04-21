import type { Controller, Description, ParticleItem, FlatParticleTreeMap, FlatParticleTreeArr } from '../typings'
import { descriptionToParticle, cloneDeep, PARTICLE_FLAG, getAllChildrenByParticleItem, PARTICLE_TOP } from './utils'
import { forEach, merge } from 'lodash-es'

class Particle {
	#particle: ParticleItem[]
	#flatParticleMap: FlatParticleTreeMap
	#flatParticleArr: FlatParticleTreeArr
	#controller?: Controller
	constructor(description: Description | Description[], controller?: Controller) {
		if (!description) {
			throw new Error(`Invaild description field, description is ${description}`)
		}
		const { particleTree, flatParticleArr, flatParticleMap } = descriptionToParticle(description, controller)
		this.#particle = particleTree
		this.#flatParticleMap = flatParticleMap
		this.#flatParticleArr = flatParticleArr
		this.#controller = controller
	}
	/** 获取整棵树 */
	getParticle(
		options: {
			clone?: boolean
		} = {
			clone: false
		}
	) {
		const { clone } = options
		return clone ? cloneDeep(this.#particle) : this.#particle
	}
	/** 单个/多个查询或获取全部 */
	getItem(keys?: string[], options?: { clone?: boolean }): FlatParticleTreeMap | null
	getItem(keys?: string, options?: { clone?: boolean }): ParticleItem | null
	getItem(
		keys?: string | string[],
		options: {
			clone?: boolean
		} = {
			clone: false
		}
	) {
		const { clone } = options
		const flatParticle = this.#flatParticleMap
		if (!keys) {
			return clone ? cloneDeep(flatParticle) : flatParticle
		}
		if (Array.isArray(keys)) {
			const result: Record<string, ParticleItem> = {}
			let hasChange = false
			forEach(keys, (item) => {
				const currentParticle = flatParticle[item]
				if (currentParticle) {
					hasChange = true
					result[item] = currentParticle
				}
			})
			if (!hasChange) {
				return null
			}
			return clone ? cloneDeep(result) : result
		} else {
			const particleItem = flatParticle[keys]
			if (!particleItem) {
				return null
			}
			return clone ? cloneDeep(particleItem) : particleItem
		}
	}
	/** 设置元素 */
	setItem(
		setData:
			| {
					key: string
					data: Record<string, any>
			  }
			| Array<{
					key: string
					data: Record<string, any>
			  }>,
		options: {
			merge?: boolean
		} = {
			merge: false
		}
	) {
		const { merge: optionMerge } = options
		const flatParticle = this.#flatParticleMap
		const setDatas = Array.isArray(setData) ? setData : [setData]
		forEach(setDatas, (item) => {
			const { key, data } = item
			const currentParticle = flatParticle[key]
			if (currentParticle) {
				if (data[PARTICLE_FLAG] || data['children']) {
					console.error(
						'"children" and "__particle" cannot be modified in setItem! If you want to modify "children", please use replace, append, or remove'
					)
					return
				}
				if (data['key']) {
					console.error('Not allowed to modify key！')
					return
				}
				optionMerge ? merge(flatParticle[key]!, data) : Object.assign(flatParticle[key]!, data)
			}
		})
	}
	/** 获取指定元素的所有children */
	getAllChildren(
		key: string,
		options: {
			clone?: boolean
		} = {}
	): ParticleItem[] | null {
		const { clone } = options
		const currentParticle = this.#flatParticleMap[key]
		if (currentParticle) {
			const allChildren = getAllChildrenByParticleItem(currentParticle)
			return clone ? cloneDeep(allChildren) : allChildren
		} else {
			console.log('Unable to find the particle data, current key is ' + key)
			return null
		}
	}
	/** 删除元素 */
	remove(key: string | string[]) {
		const keys = Array.isArray(key) ? key : [key]
		let hasChange = false
		forEach(keys, (keyItem) => {
			const deleteItem = this.getItem(keyItem)
			if (deleteItem) {
				hasChange = true
				const { __particle } = deleteItem || {}
				const { parent, index } = __particle
				const currentParentItem = this.getItem(parent)!
				const { children, __particle: __parentPaticle } = currentParentItem
				children!.splice(index, 1)
				if (parent !== PARTICLE_TOP) {
					const { layer } = __parentPaticle
					forEach(currentParentItem.children, (item, index) => {
						Object.assign(item.__particle, {
							index,
							layer: `${layer}-${index}`
						})
					})
				}
				const allChildren = this.getAllChildren(keyItem)!
				allChildren.push(deleteItem)
				forEach(allChildren, (particle) => {
					const { key, __particle } = particle
					const { order } = __particle
					delete this.#flatParticleMap[key]
					this.#flatParticleArr[order] = null
				})
			}
		})
		if (hasChange) {
			this.#flatParticleArr = this.#flatParticleArr.filter((item) => item)
			forEach(this.#flatParticleArr, (item, index) => {
				item!.__particle.order = index
			})
		}
	}
	/**
	 * 添加元素到指定位置
	 * todo 添加到顶层
	 */
	append(
		key: string,
		data: Description,
		options?: {
			order?: number
			controller?: Controller
		}
	) {
		const { order, controller } = options || {}
		const cloneData = cloneDeep(data)
		const parentParticle = this.getItem(key)
		if (parentParticle) {
			const {
				key,
				__particle: { order: parentOrder }
			} = parentParticle
			const oldParentParticleChildren = this.getAllChildren(key)!
			const children = parentParticle.children!
			parentParticle.children = parentParticle.children || []
			if (order !== undefined) {
				if (children[order]) {
					children.splice(order, 0, cloneData)
				} else {
					children[order] = cloneData
				}
			} else {
				children.push(cloneData)
			}
			const { flatParticleArr, flatParticleMap } = descriptionToParticle(
				parentParticle,
				controller || this.#controller,
				{
					clone: false,
					startOrder: parentOrder
				}
			)
			Object.assign(this.#flatParticleMap, flatParticleMap)
			this.#flatParticleArr = this.#flatParticleArr
				.slice(0, parentOrder)
				.concat(flatParticleArr)
				.concat(this.#flatParticleArr.slice(oldParentParticleChildren.length + 2))
			forEach(this.#flatParticleArr, (item, index) => {
				item!.__particle.order = index
			})
			return true
		}
		console.error('The specified particle does not exist, key is ', key)
		return null
	}
	/**
	 * 替换元素
	 * todo 替换到顶层
	 */
	replace(
		key: string,
		data: Description,
		options?: {
			controller?: Controller
		}
	) {
		const replaceParticleItem = this.getItem(key)
		if (replaceParticleItem) {
			this.remove(key)
			const { controller } = options || {}
			const {
				__particle: { parent: replaceItemParent, index: replaceIndex }
			} = replaceParticleItem
			const parentParticle = this.getItem(replaceItemParent)!
			const {
				__particle: { order: parentOrder }
			} = parentParticle
			parentParticle.children![replaceIndex] = data as ParticleItem
			const { flatParticleArr, flatParticleMap } = descriptionToParticle(
				parentParticle,
				controller || this.#controller,
				{
					clone: false,
					startOrder: parentOrder
				}
			)
			Object.assign(this.#flatParticleMap, flatParticleMap)
			this.#flatParticleArr = this.#flatParticleArr
				.slice(0, parentOrder)
				.concat(flatParticleArr)
				.concat(this.#flatParticleArr.slice(parentOrder + 1))
			forEach(this.#flatParticleArr, (item, index) => {
				item!.__particle.order = index
			})
			return true
		} else {
			console.error('The specified particle does not exist, key is ', key)
			return null
		}
	}
}

export { Controller, Description }
export default Particle
