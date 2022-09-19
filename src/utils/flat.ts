import { IOption } from '../'
export function flatDescribe (describe: IOption['describe'], callback?: IOption['controller']) {
  console.log('describe: ',describe)
  return {}
}