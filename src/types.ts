/**
 * 传入的数据
 * name 唯一名称
 * children 子级元素
 */
export type ParamDataItem<T = Record<string, unknown>> = T & {
	name: string
	children?: Array<ParamDataItem<T>>
	[key: string]: unknown
}
export type ParamDataType<T = Record<string, unknown>> = Array<ParamDataItem<T>> | ParamDataItem<T>
export type ParamDatas<T = Record<string, unknown>> = Array<ParamDataItem<T>>
/**
 * 经过格式化的数据
 * $$parent 父级节点的name
 * $$hierarchy 当前所在的层级
 */
export type ParticleDataItem<T = Record<string, unknown>> = ParamDataItem<T> & {
	/** 父级name */
	$$parent?: string
}
/**
 * 打平的格式化数据
 */
export type FlatParticleData<T = Record<string, unknown>> = Record<string, ParticleDataItem<T>>
export type ParticleData<T = Record<string, unknown>> = Array<ParticleDataItem<T>>

/** 基础类型 */
export type BaseType = 'map' | 'string' | 'number' | 'array' | 'function' | 'boolean' | 'set' | 'object'

/** 遍历数据回调函数类型 */
export type ParseDataToParticleCallback<T = Record<string, unknown>> = (
	dataItem: ParticleDataItem<T>,
	index?: number,
	arr?: ParamDataItem<T>[]
) => boolean | void

/** 实例方法 */
export type ParticleInterface<T = Record<string, unknown>> = {
	add(
		data: ParamDataType<T>,
		targetKey?: string,
		options?: {
			callback?: ParseDataToParticleCallback<T>
			order?: number
		}
	): void
	remove(name: string | string[]): void
	update(
		data: Record<
			string,
			{
				children?: ParamDatas<T>
				[key: string]: unknown
			}
		>
	): void
	get(name?: string): ParticleDataItem<T> | FlatParticleData<T> | undefined
	getParticles(): ParticleDataItem<T>[]
	getChildren(name: string):
		| {
				children: string[]
				childrenMap: Record<string, ParticleDataItem<T>>
		  }
		| undefined
}

declare class Particle<T extends ParamDataType> {
	#private
	constructor(data: T)
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
	get(name?: string): ParticleDataItem<Record<string, unknown>> | FlatParticleData | undefined
	getParticles(): ParticleDataItem[]
	getChildren(name: string):
		| {
				children: string[]
				childrenMap: Record<string, ParticleDataItem>
		  }
		| undefined
}

export { Particle }
