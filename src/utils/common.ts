import { BaseType } from '../types'

export function getType(value: unknown): BaseType {
	const type = Object.prototype.toString.call(value)
	return type.replace(/(\[object\s)|\]/g, '').toLowerCase() as BaseType
}

export function forPro<T extends Array<unknown>>(
	data: T,
	callback: (item: T[0], index: number, data: T) => boolean | void
) {
	const dataLength = data.length
	for (let index = 0; index < dataLength; index++) {
		const item = data[index]
		const result = callback(item, index, data)
		if (result === false) {
			break
		}
		if (result === true) {
			continue
		}
	}
}
