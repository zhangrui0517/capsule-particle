import { ParticleDataItem, ParamDataType, ParamDataItem, ParseDataToParticleCallback, FlatParticleData } from '../types'
import { forPro } from './common'

/** 解析数据 */
export function parseDataToParticle(
	data: ParamDataType,
	callback?: ParseDataToParticleCallback,
	options?: {
		/** 当前的打平数据，仅用于判断是否存在重复元素 */
		currentFlatParticleData?: FlatParticleData
	}
) {
	const { currentFlatParticleData } = options || {}
	const dataArr = Array.isArray(data) ? data : [data]
	/** 存储格式化数据 */
	const particleData: Array<ParticleDataItem> = []
	/** 存储格式化数据的映射 */
	const flatParticleData: FlatParticleData = {}
	traverseData(dataArr, (dataItem, index, arr) => {
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
export function traverseData(
	dataArr: ParamDataItem[],
	callback: ParseDataToParticleCallback,
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
			traverseData(children, callback, {
				parent: name
			})
		}
		return
	})
}
