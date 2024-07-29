import type { ParticleDataItem, ParseDataToParticleCallback, ParamDatas, ParticleData, RemoveCallback } from './types'
import { forPro, parseDataToParticle, traverseData } from './utils'

class Particle<T extends ParamDatas = ParamDatas> {
	/** 完整的格式化数据 */
	#particleData: ParticleData
	/** 打平的数据 */
	#flatParticleData: Record<string, ParticleDataItem>
	constructor(data: T, callback?: ParseDataToParticleCallback<T[0]>) {
		const { particleData, flatParticleData } = parseDataToParticle(data, callback)
		this.#particleData = particleData
		this.#flatParticleData = flatParticleData
	}
	add(
		data: T | T[0],
		targetName?: string,
		options?: {
			// 格式化回调
			callback?: ParseDataToParticleCallback<T[0]>
			// 添加元素的位置
			order?: number
		}
	) {
		const targetParticleItem = targetName ? this.#flatParticleData[targetName] : null
		// 找不到目标节点，中断添加字段
		if (targetParticleItem !== null && !targetParticleItem) {
			console.error(`The target node cannot be found, please check! The current target key is ${targetName}`)
			return
		}
		const { callback } = options || {}
		let { order } = options || {}
		const formatData = Array.isArray(data) ? data : [data]
		const { flatParticleData: addFlatParticleData } = parseDataToParticle(
			formatData,
			(dataItem, index, arr) => {
				const { $$parent } = dataItem
				if (!$$parent && targetParticleItem) {
					// 矫正新增数据的父级节点
					dataItem.$$parent = targetName
				}
				const result = callback && callback(dataItem, index, arr)
				if (result !== undefined) {
					return result
				}
				if (!$$parent) {
					if (targetParticleItem) {
						// 存在目标节点，将新增数据推入目标节点子级中
						targetParticleItem.children = targetParticleItem.children || []
						if (order !== undefined) {
							targetParticleItem.children.splice(order, 0, dataItem)
							order += 1
						} else {
							targetParticleItem.children.push(dataItem)
						}
					} else {
						// 不存在目标节点，直接推送到根节点中
						this.#particleData.push(dataItem)
					}
				}
				return
			},
			{
				currentFlatParticleData: this.#flatParticleData
			}
		)
		Object.assign(this.#flatParticleData, addFlatParticleData)
	}
	remove(name: string | string[], callback?: RemoveCallback) {
		const names = Array.isArray(name) ? name : [name]
		try {
			forPro(names, (name) => {
				const delParticleItem = this.#flatParticleData[name]
				if (!delParticleItem) {
					console.warn(`The element to be deleted does not exist. The name to be deleted is ${name}`)
					return true
				}
				const { children: removeChildren } = this.getChildren(name)!
				const { $$parent } = delParticleItem
				if ($$parent) {
					const parentParticleItem = this.#flatParticleData[$$parent]!
					const removeIndex = parentParticleItem.children!.indexOf(delParticleItem)
					parentParticleItem.children!.splice(removeIndex, 1)
					callback && callback(removeIndex, removeChildren, $$parent)
				} else {
					const removeIndex = this.#particleData.indexOf(delParticleItem)
					this.#particleData.splice(removeIndex, 1)
					callback && callback(removeIndex, removeChildren, undefined)
				}
				delete this.#flatParticleData[name]
				removeChildren.length &&
					forPro(removeChildren, (childKey) => {
						delete this.#flatParticleData[childKey]
					})
				return
			})
			return true
		} catch (err) {
			console.error(err)
			return false
		}
	}
	update(
		data: Record<
			string,
			{
				children?: T
				[key: string]: unknown
			}
		>,
		options?: {
			callback?: ParseDataToParticleCallback<T[0]>
		}
	) {
		const { callback } = options || {}
		forPro(Object.entries(data), ([name, value]) => {
			const updateParticleItem = this.#flatParticleData[name]
			if (!updateParticleItem) {
				console.warn(`There is no node to be updated. The updated name is ${name}`)
				return true
			}
			const { children: updateChildren, name: updateName, ...otherValue } = value
			if (updateName) {
				console.warn('In the update data, "name" cannot exist, name has been ignore')
			}
			Object.assign(updateParticleItem, otherValue)
			const { children: currentUpdateChildren } = this.getChildren(name)!
			if (updateChildren) {
				const { name } = updateParticleItem
				const { particleData: updateParticleData, flatParticleData: updateFlatParticleData } = parseDataToParticle(
					updateChildren,
					(childItem, childIndex, children) => {
						const { name: childName, $$parent } = childItem
						if (!$$parent) {
							childItem.$$parent = name
						}
						callback && callback(childItem, childIndex, children)
						const updateParticleChildItem = this.#flatParticleData[childName]
						// 檢查更新的子級中，是否存在非当前节点子级元素，且重复的元素
						if (updateParticleChildItem) {
							if (!currentUpdateChildren.includes(childName)) {
								// 如果更新的子级，与当前存在的元素重复，并且非当前更新节点的子级，则不允许更新
								console.error(`Cannot add an existing element, skip the element, the name is ${childName}`)
								return true
							}
						}
						return
					}
				)
				// 删除旧子级数据
				currentUpdateChildren?.length &&
					forPro(currentUpdateChildren, (oldChildName) => {
						delete this.#flatParticleData[oldChildName]
					})
				// 合并新子级数据
				updateParticleItem.children = updateParticleData
				Object.assign(this.#flatParticleData, updateFlatParticleData)
			}
			return
		})
	}
	get(name?: string) {
		return name ? this.#flatParticleData[name] : this.#flatParticleData
	}
	getParticles() {
		return this.#particleData
	}
	getChildren(name: string) {
		const parentParticleItem = this.#flatParticleData[name]
		if (!parentParticleItem) {
			console.error(`The target node cannot be found, please check! The current name key is ${name}`)
			return
		}
		const result: {
			children: string[]
			childrenMap: Record<string, ParticleDataItem<T[0]>>
		} = {
			children: [],
			childrenMap: {}
		}
		if (parentParticleItem.children?.length) {
			traverseData(parentParticleItem.children, (dataItem) => {
				const { name } = dataItem
				result.children.push(name)
				result.childrenMap[name] = dataItem
			})
		}
		return result
	}
}

export { Particle }
