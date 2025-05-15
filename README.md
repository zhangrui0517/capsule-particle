# MapTree

一个用于操作Map树数据结构的JavaScript库，支持浏览器和Node.js环境。

## 特性

- 使用Map作为内部数据结构，实现高效的树形数据管理
- 提供丰富的实例方法，对树数据进行增删改查
- 支持平面化数据结构，方便快速查找节点
- 平面化数据与树数据之间存在引用关系，修改平面化数据时树数据也会同步更新
- 提供Map数据与对象数据之间的互相转换
- 支持传入对象格式数据，内部自动转换为Map结构维护
- 同时支持Node.js和浏览器环境

## 安装

```bash
npm install map-tree
```

## 开发与构建

```bash
# 安装依赖
npm install

# 开发模式，启动开发服务器
npm run dev

# 构建库
npm run build

# 预览示例
npm run preview
```

项目使用Vite进行构建，支持生成ESM、CommonJS和UMD格式的输出。

## 使用方法

### Node.js环境

```javascript
const { MapTree } = require('map-tree');

// 创建一个空的树
const tree = new MapTree();

// 添加节点
tree.setNode(['users'], { count: 2 });
tree.setNode(['users', 'user1'], { name: '张三', age: 30 });
tree.setNode(['users', 'user2'], { name: '李四', age: 25 });

// 也可以使用路径字符串
tree.setNode('/categories/tech', { name: '技术' });
```

### 浏览器环境

```html
<!-- 引入UMD格式的库 -->
<script src="dist/map-tree.umd.js"></script>

<script>
  // 全局变量 MapTree 可用
  const tree = new MapTree.MapTree();
  
  // 添加节点
  tree.setNode(['department'], { name: '公司部门' });
  tree.setNode(['department', 'dev'], { name: '研发部', headcount: 50 });
</script>
```

### ESM方式引入

```javascript
import { MapTree } from 'map-tree';

const tree = new MapTree();
```

## API文档

### 创建实例

```javascript
// 创建空树
const tree = new MapTree();

// 创建带有初始根节点值的树
const tree = new MapTree(null, { rootValue: { name: 'root' } });

// 使用Map格式的树数据创建
const mapTreeData = {
  value: { name: 'root' },
  children: new Map([
    ['child1', { value: { name: 'child1' } }]
  ])
};
const tree = new MapTree(mapTreeData);

// 使用对象格式的树数据创建
const objTreeData = {
  value: { name: 'root' },
  children: {
    'child1': { value: { name: 'child1' } }
  }
};
const tree = new MapTree(objTreeData);

// 使用静态方法从对象创建
const tree = MapTree.fromObject(objTreeData);
```

### 节点操作

```javascript
// 添加/更新节点
tree.setNode(['parent', 'child'], { name: 'child' });
tree.setNode('/parent/child', { name: 'updated child' });

// 不创建路径中不存在的节点
tree.setNode(['a', 'b', 'c'], { test: 123 }, { createIfNotExist: false });

// 添加子节点
tree.addChild(['parent'], 'newChild', { name: 'new child' });

// 获取节点
const node = tree.getNode(['parent', 'child']);
const node = tree.getNode('/parent/child');

// 获取节点值
const value = tree.getValue(['parent', 'child']);
const value = tree.getValue('/parent/child');

// 删除节点
tree.removeNode(['parent', 'child']);
tree.removeNode('/parent/child');

// 清空树
tree.clear();
```

### 转换功能

```javascript
// 获取树的对象形式
const objTree = tree.toObject();

// 对象转Map
const mapTreeNode = tree.objectToMap(objTreeNode);

// Map转对象
const objTreeNode = tree.mapToObject(mapTreeNode);
```

### 平面化数据操作

```javascript
// 获取平面化节点数据
const flatNodes = tree.getFlatNodes();

// 从平面化数据更新树
tree.updateFromFlatNode('/users/user1', { name: '张三(已更新)', age: 31 });

// 根据条件查找节点
const youngUsers = tree.findNodes((node, path) => {
  return path[0] === 'users' && 
         path.length === 2 && 
         node.value && 
         node.value.age < 30;
});
```

## 示例

完整示例请查看 [examples](./examples) 目录。

## 许可证

MIT
