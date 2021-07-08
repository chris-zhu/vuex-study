import { forEachValue } from "../util"


export default class Module {
    constructor(rawModule) {
        this._children = Object.create(null)
        this._rawModule = rawModule
        const rawState = rawModule.state
        this.state = rawState || {}
    }

    get namespaced () {
        return !!this._rawModule.namespaced
      }

    hasChild(key) {
        return key in this._children
    }

    getChild(key) {
        return this._children[key]
    }

    addChild(key, childModule) {
        this._children[key] = childModule
    }

    removeChild(key) {
        delete this._children[key]
    }

    forEachMutations(fn) {
        if (this._rawModule.mutations) {
            forEachValue(this._rawModule.mutations, fn)
        }
    }

    forEachActions(fn) {
        if (this._rawModule.actions) {
            forEachValue(this._rawModule.actions, fn)
        }
    }

    forEachGetters(fn) {
        if (this._rawModule.getters) {
            forEachValue(this._rawModule.getters, fn)
        }
    }

    forEachChild(fn) {
        forEachValue(this._children, fn)
    }
}

