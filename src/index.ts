import type { Controller, Description, ParticleItem } from '../typings'
import { descriptionToParticle, cloneDeep, PARTICLE_FLAG } from './utils'
import { forEach, merge } from 'lodash-es'

class Particle {
	#particle: ParticleItem[]
	#flatParticle: Record<string, ParticleItem>
	constructor(description: Description | Description[], controller?: Controller) {
		if (!description) {
			throw new Error(`Invaild description field, description is ${description}`)
		}
		const { descTree, flatDescTree } = descriptionToParticle(description, controller)
		this.#particle = descTree
		this.#flatParticle = flatDescTree
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
	/** 单个查询或获取全部 */
	getItem(
		keys?: string | string[],
		options: {
			clone?: boolean
		} = {
			clone: false
		}
	) {
		const { clone } = options
		const flatParticle = this.#flatParticle
		if (!keys) {
			return clone ? cloneDeep(flatParticle) : flatParticle
		}
		const formatKeys = Array.isArray(keys) ? keys : [keys]
		const result: Record<string, ParticleItem> = {}
		forEach(formatKeys, (item) => {
			const currentParticle = flatParticle[item]
			if (currentParticle) {
				result[item] = currentParticle
			}
		})
		return clone ? cloneDeep(result) : result
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
		const flatParticle = this.#flatParticle
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
}

export { Controller, Description }
export default Particle
