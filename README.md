# capsule-particle
Maintain an object data structure in a tree format, provide instance methods for performing CRUD operations on the data, and establish relationships between the data elements.
## Installation
```bash
npm install capsule-particle
```
or
```bash
yarn add capsule-particle
```
or
```bash
pnpm install capsule-particle
```
## Usage
```javascript
import { Particle } from 'capsule-particle';
const data = {
  name: 'example',
  children: [
    {
      name: 'child',
      children: [...]
    }
  ]
  [field: string]: any
}
const particleInstance = new Particle(data, (dataItem, index, data) => {
  ...
});
```
## Instance methods
### add
```javascript
particleInstance.add(data, targetName?: string, options?: {
  callback?: (dataItem, index, data) => void | boolean,
  order?: number
})
```
### remove
```javascript
particleInstance.remove(name: string | string[], callback?: (removeIndex: number, removeChildren, parentName) => void)
```
### update
```javascript
particleInstance.update(data, options?: {
  callback: (dataItem, index, data) => {
    ...
  }
})
```
### get
```javascript
particleInstance.get(name?: string)
```
### getParticles
```javascript
particleInstance.getParticles()
```
### getChildren
```javascript
particleInstance.getChildren(name: string)
```
