# vuex 学习笔记

```js

{
    state: {
        count: 0
    },
    modules: {
        moduleA: {
            namespace: true,
            state: {
                name: 'mdA'
            },
            getters:{},
            mutations: {

            },
            actions: {
                someModuleAction({ dispatch, commit, getters, state, rootGetters, rootState }, payload) {
                    dispatch('someAction', null, {root: true}) // root  someAction
                },
                someModuleOtherAction({dispatch}, payload){
                    dispatch('someModuleAction') // 当前 someModuleAction
                }
            },
        },
        moduleB: {
            state: {
                name: 'mdB'
            },
            getters:{},
            mutations: {

            },
            actions: {

            },
        }
    },
    getters: {
        //   local.state, // local state
        //   local.getters, // local getters
        //   store.state, // root state
        //   store.getters // root getters
        dbCount(state, getters, rootState, rootGetters) {
            return state.count * 2
        }
    },
    mutations: {
        // store.commit('setCount', 1)
        setCount(state, payload){
            state.count = payload
        },
        // store.commit({
        //    type: 'setCount2' ,
        //    value: 2
        // })
        setCount2(state, payload){
            state.count = payload.value
        },
    },
    actions: {
        someAction({ dispatch, commit, getters, state, rootGetters, rootState }, payload) {

        }
    },
    devtools: true,
    strict: true,
    plugins: [ function (store) {} ]
}




```
