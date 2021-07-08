
import { forEachValue } from '../util'
import Module from './module'


export default class ModuleCollection {
    /**
     * 
     * @param {*} rawRootModule 原始的配置
     */
    constructor(rawRootModule) {
        this.register([], rawRootModule)
    }

    register(path, rawModule) {
        const newModule = new Module(rawModule)
        if (path.length === 0) { // root module
            this.root = newModule
        } else { // has child
            // path ['a','b'] => parent: a
            const parent = this.get(path.slice(0, -1))
            const childkey = path[path.length - 1]
            parent.addChild(childkey, newModule)
        }

        // 注册子模块
        if (rawModule.modules) {
            forEachValue(rawModule.modules, (rawChildModule, key) => {
                this.register(path.concat(key), rawChildModule)
            })
        }
    }

    unRegister(path) {
        const parent = this.get(path.slice(0, -1))
        const childkey = path[path.length - 1]
        const child = parent.getChild(key)
        if (child) {
            parent.removeChild(childkey)
        }
    }

    isRegister(path) {
        const parent = this.get(path.slice(0, -1))
        const childkey = path[path.length - 1]
        return parent.hasChild(childkey)
    }

    get(path) {
        return path.reduce((rawModule, key) => {
            return rawModule.getChild(key)
        }, this.root)
    }

    getNamespace(path){
        let module = this.root
        return path.reduce((namespace, key)=>{
            module = module.getChild(key)
            return namespace + (module.namespaced ? key + '/' : '')
        }, '')
    }
}