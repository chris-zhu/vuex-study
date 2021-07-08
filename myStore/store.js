import ModuleCollection from './module/module-collection'
import { storeKey } from './injectkey'
import { installModule, resetStoreState } from './store-util'

export class Store {



    constructor(options) {
        const { plugins = [], strict = false, devtools } = options

        this._committing = false
        this._actions = Object.create(null)
        this._actionSubscribers = []
        this._mutations = Object.create(null)
        this._wrappedGetters = Object.create(null)
        this._modules = new ModuleCollection(options)
        this._modulesNamespaceMap = Object.create(null)
        this._subscribers = []
        this._makeLocalGettersCache = Object.create(null)
        this._devtools = devtools

        const store = this
        const { dispatch, commit } = this

        this.dispatch = function (type, payload) {
            return dispatch.call(store, type, payload)
        }

        this.commit = function (type, payload, options) {
            return commit.call(store, type, payload, options)
        }


        this.strict = strict
        const state = this._modules.root.state

        installModule(this, state, [], this._modules.root)

        resetStoreState(this, state)

        plugins.forEach(plugin => plugin(this))

    }

    _withCommit(fn) {
        const commiting = this._committing
        this.commiting = true
        fn()
        this._committing = commiting
    }

    replaceState(state) {
        this._withCommit(() => {
            this._state.data = state
        })
    }

    install(app, injectKey) {
        app.provide(injectKey || storeKey, this)
        app.config.globalProperties.$store = this
    }

    commit(_type, _payload, _options) {
        const entry = this._mutations[_type]
        if (!entry) {
            return
        }
        this._withCommit(() => {
            entry.forEach((mutation) => mutation(_payload))
        })
    }

    dispatch(_type, _payload) {

        const entry = this._actions[_type]
        if (!entry) {
            return
        }

        const result = entry.length > 1 ? Promise.all(entry.map(action => action(_payload))) : entry[0](_payload)

        return new Promise((resolve, reject) => {
            result.then(res => {
                resolve(res)
            }, error => {
                reject(error)
            })
        })
    }

    get state() {
        return this._state.data
    }


}

export function createStore(option) {
    return new Store(option)
}


