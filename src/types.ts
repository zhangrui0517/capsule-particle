/**
 * 类型定义文件
 * 包含MapTree库中使用的所有类型接口
 * @module types
 */

/**
 * 树节点数据结构的接口定义
 * 表示树中的单个节点，包含值和可选的子节点Map
 * @template T 节点值的类型，默认为any
 */
export interface TreeNode<T = any> {
  /** 节点存储的数据值 */
  value: T;
  /** 
   * 子节点Map集合
   * 键为字符串或数字，值为TreeNode对象
   */
  children?: Map<string | number, TreeNode<T>>;
}

/**
 * 平面化节点结构的接口定义
 * 用于在平面化表示中存储节点信息，保持与树节点的引用关系
 * @template T 节点值的类型，默认为any
 */
export interface FlatNode<T = any> {
  /** 节点值，与对应树节点的value相同 */
  value: T;
  /** 从根节点到当前节点的完整路径数组 */
  path: (string | number)[];
  /** 原始树节点的引用，修改此引用会影响原树 */
  node: TreeNode<T>;
}

/**
 * 对象树节点接口定义（用于转换）
 * 表示使用普通JavaScript对象表示的树节点
 * 用于与Map格式的树节点相互转换
 * @template T 节点值的类型，默认为any
 */
export interface ObjectTreeNode<T = any> {
  /** 节点存储的数据值 */
  value: T;
  /** 
   * 子节点对象集合
   * 键为字符串，值为ObjectTreeNode对象
   */
  children?: {
    [key: string]: ObjectTreeNode<T>;
  };
}

/**
 * MapTree构造函数参数接口
 * 定义创建MapTree实例时的配置选项
 * @template T 根节点值的类型，默认为any
 */
export interface MapTreeOptions<T = any> {
  /** 
   * 根节点的初始值
   * 如果不提供，将使用null作为默认值
   */
  rootValue?: T;
}

/**
 * MapTree查询条件接口
 * 用于findNodes方法，定义节点查询的条件函数
 * @template T 节点值的类型，默认为any
 */
export interface QueryCondition<T = any> {
  /**
   * 条件判断函数
   * @param node 当前遍历到的树节点
   * @param path 当前节点的路径数组
   * @returns 如果节点满足条件返回true，否则返回false
   */
  (node: TreeNode<T>, path: (string | number)[]): boolean;
}

/**
 * MapTree更新选项接口
 * 定义节点更新时的行为选项
 */
export interface UpdateOptions {
  /** 
   * 如果路径中的节点不存在，是否创建新节点
   * 默认为true
   */
  createIfNotExist?: boolean;
} 