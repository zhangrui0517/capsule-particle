import Particle, { IOption } from '../src'

const describe: IOption['describe'] = {
  $key: 'a',
  $children: [
    {
      $key: 'b',
      $children: [
        {
          $key: 'c'
        }
      ],
    },
    {
      $key: 'd'
    }
  ]
}

function controller (descItem: IOption['describe']) {
  console.log('descItem: ',descItem)
}

const testParticle = new Particle({
  describe,
  controller
})
