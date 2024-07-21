import { ParticleDataItem, ParseDataToParticleCallback, FlatParticleData, ParamDatas } from '../types'
import { forPro } from './common'

/** 解析数据 */
export function parseDataToParticle<T extends ParamDatas = ParamDatas>(
	data: T,
	callback?: ParseDataToParticleCallback,
	options?: {
		/** 当前的打平数据，仅用于判断是否存在重复元素 */
		currentFlatParticleData?: FlatParticleData
	}
) {
	const { currentFlatParticleData } = options || {}
	/** 存储格式化数据 */
	const particleData: Array<ParticleDataItem> = []
	/** 存储格式化数据的映射 */
	const flatParticleData: FlatParticleData = {}
	traverseData(data, (dataItem, index, arr) => {
		const { name, $$parent } = dataItem
		if (flatParticleData[name] || currentFlatParticleData?.[name]) {
			// 不可添加已存在的元素，跳过该元素
			console.error(`Cannot add an existing element, skip the element, the name is ${name}`)
			return true
		}
		const result = callback && callback(dataItem, index, arr)
		if (result !== undefined) {
			return result
		}
		/** 不存在父级则为顶层数据 */
		if (!$$parent) {
			particleData.push(dataItem)
		}
		flatParticleData[name] = dataItem
		return
	})
	return {
		particleData,
		flatParticleData
	}
}

/** 遍历树型数据 */
export function traverseData<T extends ParamDatas = ParamDatas>(
	dataArr: T,
	callback: ParseDataToParticleCallback<T[0]>,
	params?: {
		parent: string
	}
) {
	const { parent } = params || {}
	forPro(dataArr, (dataItem, index) => {
		const newDataItem: ParticleDataItem = Object.assign(dataItem, {
			$$parent: parent
		})
		const result = callback(newDataItem, index, dataArr)
		if (result !== undefined) {
			return result
		}
		const { children, name } = newDataItem
		if (children?.length) {
			traverseData(children as T, callback, {
				parent: name
			})
		}
		return
	})
}
