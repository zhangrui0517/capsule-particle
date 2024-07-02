/**
 * 传入的数据
 * name 唯一名称
 * children 子级元素
 */
export type ParamDataItem = {
	name: string
	children?: Array<ParamDataItem>
	[key: string]: unknown
}
export type ParamDataType = Array<ParamDataItem> | ParamDataItem
export type ParamDatas = Array<ParamDataItem>
/**
 * 经过格式化的数据
 * $$parent 父级节点的name
 * $$hierarchy 当前所在的层级
 */
export type ParticleDataItem = ParamDataItem & {
	/** 父级name */
	$$parent?: string
}
/**
 * 打平的格式化数据
 */
export type FlatParticleData = Record<string, ParticleDataItem>
export type ParticleData = Array<ParticleDataItem>

/** 基础类型 */
export type BaseType = 'map' | 'string' | 'number' | 'array' | 'function' | 'boolean' | 'set' | 'object'

/** 遍历数据回调函数类型 */
export type ParseDataToParticleCallback = (
	dataItem: ParticleDataItem,
	index?: number,
	arr?: ParamDataItem[]
) => boolean | void

/** 实例方法 */
export type Particle = {
	add(
		data: ParamDataType,
		targetKey?: string,
		options?: {
			callback?: ParseDataToParticleCallback
			order?: number
		}
	): void
	remove(name: string | string[]): void
	update(
		data: Record<
			string,
			{
				children?: ParamDatas
				[key: string]: unknown
			}
		>
	): void
	get(name?: string): ParticleDataItem | FlatParticleData | undefined
	getParticles(): ParticleDataItem[]
	getChildren(name: string):
		| {
				children: string[]
				childrenMap: Record<string, ParticleDataItem>
		  }
		| undefined
}
