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
		/** 修改标记，如果有效果，需要将flatParticleArr中的无效数据剔除 */
		let hasChange = false
		forEach(keys, (keyItem) => {
			const deleteItem = this.getItem(keyItem)
			if (deleteItem) {
				hasChange = true
				const { __particle } = deleteItem || {}
				const { parent, index } = __particle
				/** 获取父级 */
				const currentParentItem = this.getItem(parent)!
				const { children, __particle: __parentPaticle } = currentParentItem
				/** 从父级的children中删除 */
				children!.splice(index, 1)
				/** 顶层的children都是树的起点，无需重置index、layer */
				if (parent !== PARTICLE_TOP) {
					const { layer } = __parentPaticle
					forEach(currentParentItem.children, (item, index) => {
						Object.assign(item.__particle, {
							index,
							layer: `${layer}-${index}`
						})
					})
				}
				/** 删除指定元素的所有子级 */
				const allChildren = this.getAllChildren(keyItem)!
				allChildren.push(deleteItem)
				forEach(allChildren, (particle) => {
					const { key } = particle
					const index = this.#flatParticleArr.indexOf(particle)
					delete this.#flatParticleMap[key]
					this.#flatParticleArr[index] = null
				})
			}
		})
		if (hasChange) {
			/** 清除无效的数据 */
			this.#flatParticleArr = this.#flatParticleArr.filter((item) => item)
		}
	}
	/**
	 * 添加元素到指定位置
	 */
	append(
		key: string,
		data: Description,
		options?: {
			order?: number
			controller?: Controller
		}
	) {
		const appendKey = data.key
		if (!appendKey) {
			console.error('Missing key, append data is "', JSON.stringify(data), '"')
			return null
		}
		if (this.#flatParticleMap[appendKey]) {
			console.error(
				`The key already exists. If you need to modify it, please use “setItem”, append key is "${appendKey}"`
			)
			return null
		}
		const { order, controller } = options || {}
		const cloneData = cloneDeep(data)
		const parentParticle = this.getItem(key)
		if (parentParticle) {
			/** 新增到顶层节点中 */
			if (key === PARTICLE_TOP) {
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
				const { flatParticleArr, flatParticleMap } = descriptionToParticle(cloneData, controller || this.#controller, {
					clone: false
				})
				/** 去除顶层信息后，合并到当前打平信息中 */
				delete flatParticleMap[PARTICLE_TOP]
				Object.assign(this.#flatParticleMap, flatParticleMap)
				/** 将新增到数据，按顺序增加到flatParticleArr */
				if (order === 0) {
					/** 如果在顶层元素的首位，则直接插入到头部即可 */
					this.#flatParticleArr.splice(0, 0, ...flatParticleArr)
					return true
				}
				if (order === undefined) {
					/** 如果在顶层元素的末位，则直接插入到尾部即可 */
					this.#flatParticleArr.push(...flatParticleArr)
					return true
				}
				const prevParticle = children[order - 1]!
				const prevParticleChildren = this.getAllChildren(prevParticle.key)!
				this.#flatParticleArr.splice(prevParticleChildren.length + 1, 0, ...flatParticleArr)
				return true
			} else {
				/** 新增到非顶层节点 */
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
				/** 将指定的子树重新格式化 */
				const { flatParticleArr, flatParticleMap } = descriptionToParticle(
					parentParticle,
					controller || this.#controller,
					{
						clone: false,
						isFirst: false
					}
				)
				Object.assign(this.#flatParticleMap, flatParticleMap)
				const partentIndex = this.#flatParticleArr.indexOf(parentParticle)
				/** 将新增的数据添加到flatParticleArr中 */
				this.#flatParticleArr.splice(partentIndex, oldParentParticleChildren.length + 1, ...flatParticleArr)
				return true
			}
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
			parentParticle.children![replaceIndex] = data as ParticleItem
			const { flatParticleArr, flatParticleMap } = descriptionToParticle(
				parentParticle,
				controller || this.#controller,
				{
					clone: false,
					isFirst: false
				}
			)
			Object.assign(this.#flatParticleMap, flatParticleMap)
			const parentIndex = this.#flatParticleArr.indexOf(parentParticle)
			this.#flatParticleArr = this.#flatParticleArr
				.slice(0, parentIndex)
				.concat(flatParticleArr)
				.concat(this.#flatParticleArr.slice(parentIndex + 1))
			return true
		} else {
			console.error('The specified particle does not exist, key is ', key)
			return null
		}
	}
}

export { Controller, Description }
export default Particle
