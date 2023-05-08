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

declare class Particle {
	#private
	constructor(description: Description | Description[], controller?: Controller)
	getParticle(options?: { clone?: boolean }): any
	getItem(
		keys?: string | string[],
		options?: {
			clone?: boolean
		}
	): FlatParticleTreeMap | ParticleItem | null
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
	getAllChildren(
		key: string,
		options?: {
			clone?: boolean
		}
	): ParticleItem[] | null
	remove(
		key: string | string[],
		callback: (
			removeInfo: Array<{
				key: string
				parent: string
				children: string[]
				index: number
			}>
		) => void
	): void
	append(
		key: string,
		data: Description,
		options?: {
			order?: number
			controller?: Controller
		}
	): true | null
	replace(
		key: string,
		data: Description,
		options?: {
			controller?: Controller
		}
	): true | null
}

declare
const PARTICLE_TOP = '__particleTop__'

declare
const PARTICLE_TOP = '__particle'

export { PARTICLE_TOP, PARTICLE_TOP }

export default Particle
