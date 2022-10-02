// 描述信息
export type Description = {
  key: string
  children?: Array<Description>
} & Record<string, any>

// 扩展信息，注入到描述中，用于记录父级信息等
export type ParticleExtraInfo = {
  __particle: {
    parent: string
  }
}

//
export type ParticleItem = Description & ParticleExtraInfo

export type FlatParticle = Record<string, ParticleItem>

export type ParticleInfo = {
  flatParticle: FlatParticle
  particleTree: ParticleItem | ParticleItem[]
}