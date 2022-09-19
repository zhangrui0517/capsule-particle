import { IOption } from '..'
/** 使用定制化的json.parse和json.stringify来做深度克隆 */
export function jsonClone (data: Array<any> | Record<string, any>, schema?: IOption['schema']) {
  return JSON.parse(JSON.stringify(data))
}