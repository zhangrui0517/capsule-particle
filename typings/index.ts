declare global {
	interface Function {
		toJSON?: () => any
	}
}

export type particleData = {
	/** 父级的key */
	parent: string
	/** 在子元素中的位置 */
	index: number
	/** 层级记录 */
	layer: string
}

/** 描述信息 */
export type ParticleItem<T extends object> = {
	key: string
	__particle__?: particleData
	children?: Array<ParticleItem<T>>
} & T

export type ParticleItemPlus<T extends object> = Omit<ParticleItem<T>, 'children' | '__particle__'> & {
	__particle__: particleData
	children?: Array<ParticleItemPlus<T>>
}

/** 描述控制器，在遍历描述信息时，会调用该回调 */
export type Controller<T extends object> = (ParticleItem: ParticleItemPlus<T>) => void | false

export type ParticleTree<T extends object> = ParticleItemPlus<T>

export type FlatParticleTreeMap<T extends object> = Record<string, ParticleItemPlus<T>>

export type FlatParticleTreeArr<T extends object> = Array<ParticleItemPlus<T> | null>

/** 实例方法-删除 */
export type removeCallbackParams = Array<{
	key: string
	parent: string
	children: string[]
	index: number
	removeKeys: string[]
}>

export type removeCallback = (removeInfo: removeCallbackParams) => void

declare class Particle<T extends object> {
	#private
	constructor(particleItem: ParticleItem<T> | ParticleItem<T>[], controller?: Controller<T>)
	/** 获取完整的对象 */
	getParticle(options?: { clone?: boolean }): ParticleItemPlus<T>
	/** 获取指定的数据或打平的全部数据 */
	getItem(
		keys?: string | string[],
		options?: {
			clone?: boolean
		}
	): FlatParticleTreeMap<T> | ParticleItemPlus<T> | null
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
	): ParticleItemPlus<T>[] | null
	/** 移除指定的元素和它的全部子元素 */
	remove(key: string | string[], callback: removeCallback): removeCallbackParams | undefined
	/** 添加元素到指定的元素中 */
	append(
		key: string,
		data: ParticleItem<T>,
		options?: {
			order?: number
			controller?: Controller<T>
		}
	): ParticleItemPlus<T> | null
	/** 替换指定的元素 */
	replace(
		key: string,
		data: ParticleItem<T>,
		options?: {
			controller?: Controller<T>
		}
	): {
		removeInfos: removeCallbackParams
		appendInfos: ParticleItemPlus<T>
	} | null
}

export const PARTICLE_TOP = '__particleTop__' as const

export const PARTICLE_FLAG = '__particle__' as const

export default Particle
