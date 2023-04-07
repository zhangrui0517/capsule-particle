export const PARTICLE_FLAG = '__particle'
export const PARTICLE_TOP = '__particleTop__'

export function hasOwnProperty(obj: Record<string, any>, key: string) {
	return Object.prototype.hasOwnProperty.call(obj, key)
}
