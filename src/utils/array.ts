export function forFun<T>(
  data: Array<T>,
  callback: (item: T, index: number, arr: Array<T>) => void | boolean,
  options: {
    start?: number
  } = {}
) {
  const { start = 0 } = options
  for (let i = start, len = data.length; i < len; i++) {
    const item = data[i] as T
    const result = callback(item, i, data)
    if (result) {
      break
    }
  }
}
