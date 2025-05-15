/**
 * MapTree 基础使用示例
 * 展示了库的主要功能和API用法
 */

// 引入MapTree类
const { MapTree } = require('../dist/map-tree.js');

//======================
// 创建和填充树
//======================

// 创建一个空的树实例
const tree = new MapTree();

// 使用路径数组添加节点
// 添加根级别的'users'节点
tree.setNode(['users'], { count: 2 });
// 添加二级节点'user1'和'user2'
tree.setNode(['users', 'user1'], { name: '张三', age: 30 });
tree.setNode(['users', 'user2'], { name: '李四', age: 25 });
// 使用addChild方法添加子节点
tree.addChild(['users', 'user1'], 'posts', [{ id: 1, title: '第一篇文章' }]);

// 使用路径字符串添加节点（另一种表示方式）
tree.setNode('/categories/tech', { name: '技术' });
tree.setNode('/categories/life', { name: '生活' });

//======================
// 获取节点数据
//======================

// 使用路径数组获取节点
const user1 = tree.getNode(['users', 'user1']);
console.log('用户1:', user1.value);

// 使用路径字符串获取节点值
const techCategory = tree.getValue('/categories/tech');
console.log('技术分类:', techCategory);

//======================
// 使用平面化数据
//======================

// 获取平面化数据结构
const flatNodes = tree.getFlatNodes();
console.log('平面化节点数量:', flatNodes.size);

// 从平面化数据更新树 - 直接通过路径字符串更新
tree.updateFromFlatNode('/users/user1', { name: '张三(已更新)', age: 31 });
console.log('更新后的用户1:', tree.getValue(['users', 'user1']));

//======================
// 查询和筛选
//======================

// 使用条件函数查找符合条件的节点
const youngUsers = tree.findNodes((node, path) => {
  return path[0] === 'users' && 
         path.length === 2 && 
         node.value && 
         node.value.age < 30;
});
console.log('年轻用户:', youngUsers.map(n => n.value.name));

//======================
// 删除节点
//======================

// 删除一个节点及其所有子节点
tree.removeNode(['users', 'user2']);
// 检查删除后的状态
console.log('删除后用户数量:', tree.getNode(['users']).children.size);

//======================
// 格式转换
//======================

// 将树转换为对象格式
const treeObject = tree.toObject();
console.log('树对象:', JSON.stringify(treeObject, null, 2));

//======================
// 从对象创建树
//======================

// 准备对象格式的树数据
const objData = {
  value: { name: 'root' },
  children: {
    'branch1': {
      value: { name: 'branch1' },
      children: {
        'leaf1': { value: { name: 'leaf1' } }
      }
    }
  }
};

// 使用静态方法从对象创建新的树实例
const newTree = MapTree.fromObject(objData);
// 验证新树的数据
console.log('从对象创建的树:', newTree.getValue(['branch1', 'leaf1'])); 