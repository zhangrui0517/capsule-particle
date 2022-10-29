<div align="center">
  <br>
  <h1>capsule-particle</h1>
  <p align="left">
    用于维护对象信息树，将对象拆解，注入层级关系，并将对象打平。
    提供打平、遍历顺序等信息，提供插入、删除、修改、替换、获取方法给外部使用；
  </p>
  <p align="left">
  </p>
</div>

## 目录
1. [安装](#install)
2. [使用](#usage)

<h2 align="center" id="install">安装</h2>
<br/>

Install with npm:

```bash
npm install capsule-particle --save
```

Install with yarn:

```bash
yarn add capsule-particle --save
```

<h2 align="center" id="usage">使用</h2>
<br/>


```javascript
 const particleObj = new Particle({
  // 要解析的对象，必须包含key；
  description,
  // 控制器，遍历每个对象都会调用该控制器，可在控制器中对对象进行修改或信息收集；
  controller
})
```

## Particle 调用参数

---

### description - `{key: string; children: description[]}`

必须包含key作为对象的唯一键，重复的key会被跳过；

(Note: description 也可以是个数组)

---

### controller - `(particleItem, status) => boolean | undefined`

遍历每个对象，或者调用操作方法时，都会调用controller；
particleItem 是注入层级信息的对象；
status 是此次调用的相关信息，会通过此对象告知此次调用的状态，例如初始化（init）、增加(append);

---

## Particle 实例方法

---

### append([key],[description])

增加指定数据到指定的对象节点中
#### key
Type string

#### description
Type description | description[]

---

### remove(keys)

根据key删除指定的节点及其子节点

#### keys
Type string[]

----

### setItem([key], [data])

设置指定key的信息

#### key
Type string

#### data
Type object

(Note: data中不可包含key、children和Particle注入字段__particle)

---

### getItem([keys],[retureDataType])

获取指定的对象信息，可指定返回的结构

#### keys
Type string[]

#### returnDataType
Type 'object' | 'array'

---

### getParticle()

获取完整的对象树

---

### replace([key],[description])
替换指定的元素

#### key
Type string

#### description
Type description


