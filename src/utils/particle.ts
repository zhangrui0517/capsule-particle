import { IOption } from '..'
import { Description, FlatParticle, ParticleInfo, ParticleItem, CallbackStatusParam } from '../types'
import { PARTICLE_FLAG, hasOwnProperty, PARTICLE_TOP, forFun } from '.'
import Particle from '../'
import { cloneDeep } from 'lodash-es'

/**
 * 处理描述信息，建立父子级关系，并打平信息
 * @param description 描述信息
 * @param callback 回调处理
 */
export function descriptionToParticle(
	description: Description | Description[],
	options: {
		Particle: Particle
		callback?: IOption['controller']
		callbackStatus?: CallbackStatusParam
		bindOperationWithParticle?: IOption['bindOperationWithParticle']
		cloneDeepDesc: IOption['cloneDeepDesc']
	}
): ParticleInfo {
	const { callback, callbackStatus, Particle, bindOperationWithParticle, cloneDeepDesc } = options || {}
	const cloneDeepDescription = cloneDeepDesc ? cloneDeep(description) : description
	const formatDescription = Array.isArray(cloneDeepDescription) ? cloneDeepDescription : [cloneDeepDescription]
	// 记录打平信息
	const flatParticle: FlatParticle = (Particle.getItem() as FlatParticle) || {}
	// 按顺序记录字段信息
	const particles: ParticleItem[] = []
	// 遍历队列
	let queue: Description[] = formatDescription.slice(0)
	// 辅助队列，用于记录队列中字段的额外数据
	let auxiliaryQueue: Array<Record<string, any>> = queue.map((_item, index, arr) => ({
		parent: PARTICLE_TOP,
		index,
		layer: arr.length === 1 ? '0' : `0-${index}`
	}))
	// 遍历次数
	let ergodicOrder = 0
	while (queue[0]) {
		const currentDesc = queue.shift() as Description
		const auxiliary = auxiliaryQueue.shift() || {}
		if (hasOwnProperty(flatParticle, currentDesc.key)) {
			console.error(`Repeat key, skip. key is ${currentDesc.key}`)
			break
		}
		const { parent, index, layer } = auxiliary
		currentDesc[PARTICLE_FLAG] = {
			parent,
			index,
			layer,
			order: ergodicOrder
		}
		bindOperationWithParticle && bindParticleFunToDesc(currentDesc as ParticleItem, Particle)
		flatParticle[currentDesc.key] = currentDesc as ParticleItem
		particles.push(currentDesc as ParticleItem)
		const result = callback && callback(currentDesc as ParticleItem, callbackStatus)
		if (result !== undefined && !result) {
			break
		}
		ergodicOrder += 1
		if (currentDesc.children?.length) {
			queue = [...currentDesc.children, ...queue]
			const childrenAuxiliary = currentDesc.children.map((_childItem, index) => ({
				parent: currentDesc.key,
				index,
				layer: `${layer}-${index}`
			}))
			auxiliaryQueue = [...childrenAuxiliary, ...auxiliaryQueue]
		}
	}

	return {
		flatParticle,
		particleTree: formatDescription as ParticleInfo['particleTree'],
		particles
	}
}

/** 将Particle实例的方法，绑定到每个字段上，预先填充部分调用信息 */
export function bindParticleFunToDesc(desc: ParticleItem, Particle: Particle) {
	const particleFuns = ['append', 'remove', 'replace', 'setItem']
	forFun(particleFuns, (funName) => {
		let descFun
		switch (funName) {
			case 'append':
				descFun = (description: Description, order?: number) => {
					return Particle[funName](desc.key, description, { order })
				}
				break
			case 'remove':
				descFun = () => {
					return Particle[funName]([desc.key])
				}
				break
			case 'replace':
				descFun = (description: Description) => {
					return Particle[funName](desc.key, description)
				}
				break
			case 'setItem':
				descFun = (data: Record<string, any>) => {
					return Particle[funName](desc.key, data)
				}
				break
		}
		Object.defineProperty(desc, funName, {
			writable: false,
			enumerable: false,
			configurable: false,
			value: descFun
		})
	})
}

/** 获取指定配置中最后一个遍历的节点 */
export function getLastParticleOrder(particleItem: ParticleItem, limit?: number) {
	const children = particleItem.children
	if (!children?.length) {
		return particleItem[PARTICLE_FLAG].order
	}
	const limitChildren = children[limit || children.length - 1]
	const checkQuoto = [limitChildren]
	let order = -1
	while (checkQuoto[0]) {
		const item = checkQuoto.shift() as ParticleItem
		if (item.children?.length) {
			checkQuoto[0] = item.children[item.children.length - 1]
		} else {
			order = item[PARTICLE_FLAG].order
		}
	}
	return order
}

/** 获取指定key及其子集key的集合 */
export function getAllKeyByFlatParticle(keys: string[] | string, flatPartilce: FlatParticle) {
	const formatKey = Array.isArray(keys) ? keys : [keys]
	const result: string[] = []
	const quoto = formatKey.slice()
	while (quoto[0]) {
		const key = quoto.shift() as string
		const particleItem = flatPartilce[key]!
		const children = particleItem.children
		if (children?.length) {
			quoto.push(...children.map((item) => item.key))
		}
		result.push(key)
	}
	return result
}
