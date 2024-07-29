/**
 * 传入的数据
 * name 唯一名称
 * children 子级元素
 */
export type ParamDataItem = {
	name: string
	children?: ParamDatas
	[key: string]: unknown
}
export type ParamDatas = Array<ParamDataItem>
/**
 * 经过格式化的数据
 * $$parent 父级节点的name
 * $$hierarchy 当前所在的层级
 */
export type ParticleDataItem<T extends ParamDataItem = ParamDataItem> = ParamDataItem & {
	/** 父级name */
	$$parent?: string
} & T
/**
 * 打平的格式化数据
 */
export type FlatParticleData = Record<string, ParticleDataItem>
export type ParticleData = Array<ParticleDataItem>

/** 基础类型 */
export type BaseType = 'map' | 'string' | 'number' | 'array' | 'function' | 'boolean' | 'set' | 'object'

/** 遍历数据回调函数类型 */
export type ParseDataToParticleCallback<T extends ParamDataItem = ParamDataItem> = (
	dataItem: ParticleDataItem<T>,
	index?: number,
	arr?: Array<T>
) => boolean | void

export type RemoveCallback = (removeIndex: number, removeChildren: string[], parent?: string) => void

export declare class Particle<T extends ParamDatas = ParamDatas> {
	#private
	constructor(data: T, callback?: ParseDataToParticleCallback<T[0]>)
	add(
		data: T | T[0],
		targetName?: string,
		options?: {
			callback?: ParseDataToParticleCallback<T[0]>
			order?: number
		}
	): void
	remove(name: string | string[], callback?: RemoveCallback): boolean
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
	): void
	get(name?: string): Record<string, ParticleDataItem<T[0]>> | ParticleDataItem<T[0]> | undefined
	getParticles(): ParticleData
	getChildren(name: string):
		| {
				children: string[]
				childrenMap: Record<string, ParticleDataItem<T[0]>>
		  }
		| undefined
}
