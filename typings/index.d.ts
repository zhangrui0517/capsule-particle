declare global {
	interface Function {
		toJSON?: () => any
	}
}

/** 描述 */
export type Description = {
	key: string
	children?: Array<Description>
	[key: string]: any
}

/** 格式化后的元素 */
export interface ParticleItem extends Description {
	__particle: {
		/** 父级的key */
		parent: string
		/** 在子元素中的位置 */
		index: number
		/** 层级记录 */
		layer: string
	}
	children?: Array<ParticleItem>
}

/** 用于descriptionToParticle转换时的数据类型 */
export type PartialParticleItem = Description & {
	__particle: {
		/** 父级的key */
		parent?: string
		/** 在子元素中的位置 */
		index?: number
		/** 层级记录 */
		layer?: string
	}
	children?: Array<PartialParticleItem>
}

/** 描述控制器，在遍历描述信息时，会调用该回调 */
export type Controller = (ParticleItem: ParticleItem) => void | false

export type ParticleTree = ParticleItem

export type FlatParticleTreeMap = Record<string, ParticleItem>

export type FlatParticleTreeArr = Array<ParticleItem | null>

/** 实例方法-删除 */
export type removeCallbackParams = Array<{
	key: string
	parent: string
	children: string[]
	index: number
	removeKeys: string[]
}>

export type removeCallback = (removeInfo: removeCallbackParams) => void

declare class Particle {
	#private
	constructor(description: Description | Description[], controller?: Controller)
	/** 获取完整的对象 */
	getParticle(options?: { clone?: boolean }): ParticleItem
	/** 获取指定的数据或打平的全部数据 */
	getItem(
		keys?: string | string[],
		options?: {
			clone?: boolean
		}
	): FlatParticleTreeMap | ParticleItem | null
	/** 设置指定的数据项 */
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
		options?: {
			merge?: boolean
			excludeKeys?: string[]
		}
	): string[]
	/** 获取指定元素的所有子级节点 */
	getAllChildren(
		key: string,
		options?: {
			clone?: boolean
		}
	): ParticleItem[] | null
	/** 移除指定的元素和它的全部子元素 */
	remove(key: string | string[], callback: removeCallback): removeCallbackParams | undefined
	/** 添加元素到指定的元素中 */
	append(
		key: string,
		data: Description,
		options?: {
			order?: number
			controller?: Controller
		}
	): ParticleItem | null
	/** 替换指定的元素 */
	replace(
		key: string,
		data: Description,
		options?: {
			controller?: Controller
		}
	): {
		removeInfos: removeCallbackParams
		appendInfos: ParticleItem
	} | null
}

export const PARTICLE_TOP: '__particleTop__'

export const PARTICLE_FLAG: '__particle'

export default Particle
