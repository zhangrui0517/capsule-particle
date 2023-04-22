export function hasOwnProperty(obj: Record<string, any>, key: string) {
	return Object.prototype.hasOwnProperty.call(obj, key)
}

export type CloneMatchType = '$date$/' | '$function$/' | undefined

export function cloneDeep(data: object) {
	const saveDateToJSON = Date.prototype.toJSON
	Date.prototype.toJSON = function () {
		return `$date$/${this.getTime()}`
	}
	Function.prototype.toJSON = function () {
		return `$function$/${this.toString()}`
	}
	const result = JSON.parse(JSON.stringify(data), (_key, value) => {
		if (typeof value === 'string' && value.charAt(0) === '$') {
			let matchType: CloneMatchType = undefined
			const newValue: string = value.replace(/\$(\d|\w)+\$\//, (match) => {
				matchType = match as CloneMatchType
				return ''
			})
			if (matchType === '$date$/') {
				return parseInt(newValue)
			}
			if (matchType === '$function$/') {
				return new Function(`return ${newValue}`)()
			}
			return newValue
		}
		return value
	})
	Date.prototype.toJSON = saveDateToJSON
	Function.prototype.toJSON = undefined
	return result
}

/** 获取树元素的所有子级数据 */
export function getAllChildren<
	T extends {
		key: string
		children?: T[]
	}
>(
	treeElement: T,
	options?: {
		includeRoot?: boolean
	}
): T[] {
	const { includeRoot } = options || {}
	const result: T[] = includeRoot ? [treeElement] : []
	const children = treeElement.children
	if (children?.length) {
		let formatChildren = children.slice()
		while (formatChildren.length) {
			const currentParticle = formatChildren.shift()!
			result.push(currentParticle)
			if (currentParticle.children?.length) {
				formatChildren = [...currentParticle.children, ...formatChildren]
			}
		}
	}
	return result
}
