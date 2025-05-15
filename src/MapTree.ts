/**
 * MapTree实现文件
 * 提供Map结构树数据的增删改查操作
 * @module MapTree
 */

import {
  TreeNode,
  FlatNode,
  ObjectTreeNode,
  MapTreeOptions,
  QueryCondition,
  UpdateOptions,
} from "./types";

/**
 * MapTree类 - 用于操作Map结构的树数据
 * 
 * 提供以下主要功能：
 * 1. 使用Map作为内部数据结构，实现高效的树形数据管理
 * 2. 提供丰富的实例方法，对树数据进行增删改查
 * 3. 支持平面化数据结构，方便快速查找节点
 * 4. 平面化数据与树数据之间存在引用关系，修改一处会同步更新
 * 5. 提供Map数据与对象数据之间的互相转换
 * 6. 支持传入对象格式数据，内部自动转换为Map结构维护
 * 
 * @template T 节点值的类型，默认为any
 */
class MapTree<T = any> {
  /**
   * 树的根节点
   * @private
   */
  private root: TreeNode<T>;

  /**
   * 平面化的节点Map，用于快速查找节点
   * 键为路径字符串，值为FlatNode对象
   * @private
   */
  private flatNodes: Map<string, FlatNode<T>> = new Map();

  /**
   * 构造函数
   * @param data 可以是Map树数据或普通对象树数据，用于初始化树结构
   * @param options 配置选项，如根节点的初始值
   */
  constructor(
    data?: TreeNode<T> | ObjectTreeNode<T>,
    options: MapTreeOptions<T> = {}
  ) {
    if (data) {
      if (this.isObjectTree(data)) {
        // 如果是对象格式的树，先转换为Map格式
        this.root = this.objectToMap(data as ObjectTreeNode<T>);
      } else {
        this.root = data as TreeNode<T>;
      }
    } else {
      // 创建空的根节点
      this.root = {
        value:
          options.rootValue !== undefined ? options.rootValue : (null as any),
        children: new Map(),
      };
    }

    // 初始化平面化数据
    this.rebuildFlatNodes();
  }

  /**
   * 判断是否为对象树
   * 用于区分传入的是Map格式树还是对象格式树
   * 
   * @param data 要判断的数据
   * @returns 如果是对象格式的树返回true，否则返回false
   * @private
   */
  private isObjectTree(data: any): boolean {
    return (
      data &&
      typeof data === "object" &&
      data.value !== undefined &&
      (!data.children || !(data.children instanceof Map))
    );
  }

  /**
   * 对象转Map树
   * 将普通对象格式的树结构转换为使用Map实现的树结构
   * 
   * @param objTree 对象格式的树节点
   * @returns 转换后的Map格式树节点
   * @public
   */
  public objectToMap(objTree: ObjectTreeNode<T>): TreeNode<T> {
    const mapNode: TreeNode<T> = {
      value: objTree.value,
      children: new Map(),
    };

    if (objTree.children) {
      for (const key in objTree.children) {
        if (Object.prototype.hasOwnProperty.call(objTree.children, key)) {
          mapNode.children!.set(key, this.objectToMap(objTree.children[key]));
        }
      }
    }

    return mapNode;
  }

  /**
   * Map树转对象
   * 将使用Map实现的树结构转换为普通对象格式
   * 
   * @param mapNode Map格式的树节点，默认为根节点
   * @returns 转换后的对象格式树节点
   * @public
   */
  public mapToObject(mapNode: TreeNode<T> = this.root): ObjectTreeNode<T> {
    const objNode: ObjectTreeNode<T> = {
      value: mapNode.value,
    };

    if (mapNode.children && mapNode.children.size > 0) {
      objNode.children = {};
      mapNode.children.forEach((childNode, key) => {
        objNode.children![key.toString()] = this.mapToObject(childNode);
      });
    }

    return objNode;
  }

  /**
   * 重建平面化节点缓存
   * 当树结构发生变化时调用此方法更新平面化数据
   * 
   * @private
   */
  private rebuildFlatNodes(): void {
    this.flatNodes.clear();
    this.flattenTree(this.root, []);
  }

  /**
   * 将树平面化处理
   * 递归遍历树结构，生成平面化的节点Map
   * 
   * @param node 当前处理的节点
   * @param path 从根到当前节点的路径数组
   * @private
   */
  private flattenTree(node: TreeNode<T>, path: (string | number)[]): void {
    // 生成路径字符串作为唯一键
    const pathStr = this.pathToString(path);

    // 添加到平面化缓存中
    this.flatNodes.set(pathStr, { value: node.value, path: [...path], node });

    // 递归处理子节点
    if (node.children) {
      node.children.forEach((childNode, key) => {
        this.flattenTree(childNode, [...path, key]);
      });
    }
  }

  /**
   * 将路径数组转为字符串（用于Map的键）
   * 例如：['users', 'user1'] => '/users/user1'
   * 
   * @param path 路径数组
   * @returns 格式化的路径字符串
   * @private
   */
  private pathToString(path: (string | number)[]): string {
    if (path.length === 0) return "/";
    return "/" + path.map((p) => encodeURIComponent(String(p))).join("/");
  }

  /**
   * 解析路径字符串为路径数组
   * 例如：'/users/user1' => ['users', 'user1']
   * 
   * @param pathStr 路径字符串
   * @returns 解析后的路径数组
   * @private
   */
  private parsePathString(pathStr: string): (string | number)[] {
    if (pathStr === "/" || pathStr === "") return [];
    return pathStr
      .split("/")
      .filter(Boolean)
      .map((p) => {
        const decoded = decodeURIComponent(p);
        // 如果是纯数字，转回数字类型
        return /^\d+$/.test(decoded) ? parseInt(decoded, 10) : decoded;
      });
  }

  /**
   * 根据路径获取节点
   * 支持使用路径数组或路径字符串
   * 
   * @param path 路径数组或路径字符串
   * @returns 找到的节点或undefined
   * @public
   */
  public getNode(path: (string | number)[] | string): TreeNode<T> | undefined {
    const pathArray =
      typeof path === "string" ? this.parsePathString(path) : path;
    const pathStr = this.pathToString(pathArray);
    const flatNode = this.flatNodes.get(pathStr);
    return flatNode?.node;
  }

  /**
   * 根据路径获取节点值
   * 支持使用路径数组或路径字符串
   * 
   * @param path 路径数组或路径字符串
   * @returns 找到的节点值或undefined
   * @public
   */
  public getValue(path: (string | number)[] | string): T | undefined {
    const node = this.getNode(path);
    return node?.value;
  }

  /**
   * 创建或更新节点
   * 如果路径对应的节点不存在且createIfNotExist为true，则创建新节点
   * 如果节点已存在，则更新其值
   * 
   * @param path 路径数组或路径字符串
   * @param value 新的节点值
   * @param options 更新选项
   * @returns 操作是否成功
   * @public
   */
  public setNode(
    path: (string | number)[] | string,
    value: T,
    options: UpdateOptions = { createIfNotExist: true }
  ): boolean {
    const pathArray =
      typeof path === "string" ? this.parsePathString(path) : path;

    if (pathArray.length === 0) {
      // 更新根节点
      this.root.value = value;
      this.rebuildFlatNodes();
      return true;
    }

    let current = this.root;
    const parentPath = pathArray.slice(0, -1);
    const key = pathArray[pathArray.length - 1];

    // 遍历路径到倒数第二个元素（父节点）
    for (let i = 0; i < parentPath.length; i++) {
      const segment = parentPath[i];
      if (!current.children) {
        if (options.createIfNotExist) {
          current.children = new Map();
        } else {
          return false;
        }
      }

      const next = current.children.get(segment);
      if (!next) {
        if (options.createIfNotExist) {
          const newNode: TreeNode<T> = {
            value: null as any,
            children: new Map(),
          };
          current.children.set(segment, newNode);
          current = newNode;
        } else {
          return false;
        }
      } else {
        current = next;
      }
    }

    // 确保父节点有children Map
    if (!current.children && options.createIfNotExist) {
      current.children = new Map();
    }

    if (!current.children) {
      return false;
    }

    // 更新或创建子节点
    const existingNode = current.children.get(key);
    if (existingNode) {
      // 更新现有节点的值
      existingNode.value = value;
    } else if (options.createIfNotExist) {
      // 创建新节点
      current.children.set(key, { value });
    } else {
      return false;
    }

    // 重建平面化缓存
    this.rebuildFlatNodes();
    return true;
  }

  /**
   * 添加子节点
   * 在指定的父节点下添加一个新的子节点
   * 
   * @param parentPath 父节点路径
   * @param key 子节点键
   * @param value 子节点值
   * @returns 操作是否成功
   * @public
   */
  public addChild(
    parentPath: (string | number)[] | string,
    key: string | number,
    value: T
  ): boolean {
    const parentPathArray =
      typeof parentPath === "string"
        ? this.parsePathString(parentPath)
        : parentPath;

    const fullPath = [...parentPathArray, key];
    return this.setNode(fullPath, value);
  }

  /**
   * 删除节点
   * 移除指定路径的节点及其所有子节点
   * 
   * @param path 要删除的节点路径
   * @returns 操作是否成功
   * @public
   */
  public removeNode(path: (string | number)[] | string): boolean {
    const pathArray =
      typeof path === "string" ? this.parsePathString(path) : path;

    if (pathArray.length === 0) {
      // 不允许删除根节点，但可以清空其子节点
      if (this.root.children) {
        this.root.children.clear();
        this.rebuildFlatNodes();
        return true;
      }
      return false;
    }

    const parentPath = pathArray.slice(0, -1);
    const key = pathArray[pathArray.length - 1];
    const parentNode = this.getNode(parentPath);

    if (!parentNode || !parentNode.children) {
      return false;
    }

    const result = parentNode.children.delete(key);
    if (result) {
      this.rebuildFlatNodes();
    }
    return result;
  }

  /**
   * 获取平面化的节点数据
   * 返回路径到节点的映射Map
   * 
   * @returns 平面化的节点Map（副本）
   * @public
   */
  public getFlatNodes(): Map<string, FlatNode<T>> {
    return new Map(this.flatNodes);
  }

  /**
   * 获取根节点
   * 
   * @returns 树的根节点
   * @public
   */
  public getRoot(): TreeNode<T> {
    return this.root;
  }

  /**
   * 根据条件查找节点
   * 遍历所有节点，返回符合条件的节点数组
   * 
   * @param condition 查询条件函数
   * @returns 符合条件的节点数组
   * @public
   */
  public findNodes(condition: QueryCondition<T>): FlatNode<T>[] {
    const results: FlatNode<T>[] = [];

    this.flatNodes.forEach((flatNode) => {
      if (condition(flatNode.node, flatNode.path)) {
        results.push(flatNode);
      }
    });

    return results;
  }

  /**
   * 从平面化节点数据更新树
   * 通过路径字符串直接更新节点值
   * 利用引用关系，同时更新树中的节点
   * 
   * @param pathStr 节点路径字符串
   * @param value 新值
   * @returns 更新是否成功
   * @public
   */
  public updateFromFlatNode(pathStr: string, value: T): boolean {
    const flatNode = this.flatNodes.get(pathStr);
    if (!flatNode) return false;

    // 更新节点值（引用关系会保证树中的节点也被更新）
    flatNode.value = value;
    flatNode.node.value = value;

    return true;
  }

  /**
   * 转换为对象格式
   * 将整个树转换为普通JavaScript对象
   * 
   * @returns 对象格式的树
   * @public
   */
  public toObject(): ObjectTreeNode<T> {
    return this.mapToObject();
  }

  /**
   * 从对象创建MapTree实例
   * 静态工厂方法，方便从对象创建MapTree实例
   * 
   * @param objTree 对象格式的树
   * @returns 新的MapTree实例
   * @public
   * @static
   */
  public static fromObject<T>(objTree: ObjectTreeNode<T>): MapTree<T> {
    return new MapTree<T>(objTree);
  }

  /**
   * 清空树
   * 保留根节点，但移除所有子节点
   * 
   * @public
   */
  public clear(): void {
    if (this.root.children) {
      this.root.children.clear();
    }
    this.rebuildFlatNodes();
  }
}

export default MapTree;
