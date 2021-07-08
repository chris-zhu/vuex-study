import {inject} from 'vue'

export const storeKey = Symbol('store')

export function useStore(key = null) {
    return inject(key !== null ? key : storeKey)
}