import { reactive } from "@vue/reactivity"
import { isPromise } from "../src/util"
import { forEachValue, partial } from "./util"




export function installModule(store, state, path, module) {
    const isRoot = !path.length
    const namespace = store._modules.getNamespace(path)

    if (module.namespaced) {
        store._modulesNamespaceMap[namespace] = module
    }

    if (!isRoot) {
        const parentState = getNestedState(state, path.slice(0, -1))
        const childModuleKey = path[path.length - 1]
        store._withCommit(() => {
            parentState[childModuleKey] = module.state
        })
    }


    const local = makeLocalContext(store, namespace, path)

    module.forEachMutations((mutation, key) => {
        const namespacedType = namespace + key
        registerMutations(store, namespacedType, mutation, local)
    })

    module.forEachActions((action, key) => {
        const type = action.root ? key : namespace + key
        const handle = action.handle || action
        registerActions(store, type, handle, local)
    })

    module.forEachGetters((getter, key) => {
        const namespacedType = namespace + key
        registerGetters(store, namespacedType, getter, local)
    })

    module.forEachChild((childModule, key) => {
        installModule(store, state, path.concat(key), childModule)
    })
}

export function resetStoreState(store, state) {
    const oldState = store._state

    store.getters = {}

    store._makeLocalGettersCache = Object.create(null)
    const wrappedGetters = store._wrappedGetters
    const computedObj = {}

    forEachValue(wrappedGetters, (fn, key) => {
        computedObj[key] = partial(fn, store)
        Object.defineProperty(store.getters, key, {
            get: () => computedObj[key](),
            enumerable: true
        })
    })

    store._state = reactive({ data: state })

    if (oldState) {
        store._withCommit(() => {
            oldState.data = null
        })
    }
}

function registerGetters(store, key, rawGetter, local) {
    if (store._wrappedGetters[key]) {
        return
    }
    store._wrappedGetters[key] = function (store) {
        return rawGetter(local.state, local.getters, store.state, store.getters)
    }
}

function registerMutations(store, type, handle, local) {
    const entry = store._mutations[type] || (store._mutations[type] = [])
    entry.push((payload) => {
        handle.call(store, local.state, payload)
    })
}

function registerActions(store, type, handle, local) {
    const entry = store._actions[type] || (store._actions[type] = [])
    entry.push((payload) => {
        let res = handle.call(store, local, payload)
        if (!isPromise(res)) {
            res = Promise.resolve(res)
        }
        return res
    })
}

function makeLocalContext(store, namespace, path) {
    const noNamespace = namespace === ''

    const local = {
        commit: noNamespace ? store.commit : (_type, _payload, _options) => {
            if (!_options || !_options.root) {
                _type = namespace + _type
                if (!store._mutations[_type]) {
                    // console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
                    debugger
                    return
                }
            }
            store.commit(_type, _payload, _options)
        },
        dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
            if (!_options || !_options.root) {
                _type = namespace + _type
                if (!store._mutations[_type]) {
                    // console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
                    debugger
                    return
                }
            }
            return store.dispatch(type, payload)
        }
    }

    Object.defineProperties(local, {
        getters: {
            get: noNamespace ? () => store.getters : () => makeLocalGetters(store, namespace)
        },
        state: {
            get: () => getNestedState(store.state, path)
        }
    })
    return local
}

function getNestedState(state, path) {
    return path.reduce((state, key) => state[key], state)
}

function makeLocalGetters(store, namespace) {
    if (!store._makeLocalGettersCache[namespace]) {
        const gettersProxy = {}
        const splitPos = namespace.length
        Object.keys(store.getters).forEach(type => {
            // skip if the target getter is not match this namespace
            if (type.slice(0, splitPos) !== namespace) return

            // extract local getter type
            const localType = type.slice(splitPos)

            // Add a port to the getters proxy.
            // Define as getter property because
            // we do not want to evaluate the getters in this time.
            Object.defineProperty(gettersProxy, localType, {
                get: () => store.getters[type],
                enumerable: true
            })
        })
        store._makeLocalGettersCache[namespace] = gettersProxy
    }

    return store._makeLocalGettersCache[namespace]
}
