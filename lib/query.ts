import { Component } from "./component"
import { useWorld } from "./world"

/**
 * Get all entities with the specified components (children are included)
 */
export function* query<T extends any[]>(...types: { [K in keyof T]: new (...arg: any[]) => T[K] }): Generator<T> {
    const world = useWorld()

    const requiredComponents = new Array<string>(types.length)

    for (let i = 0; i < types.length; i++) {
        const t = types[i]
        if (t == undefined) {
            continue
        }

        if (t.prototype instanceof Component) {
            requiredComponents[i] = t.prototype.constructor.name
        }
    }

    entity_loop: for (const [e, c] of world.getComponents()) {
        for (const component of requiredComponents) {
            if (!c.has(component)) {
                continue entity_loop
            }
        }

        const x = new Array<any>(types.length) as T
        for (let i = 0; i < types.length; i++) {
            const t = types[i]
            if (t == undefined) {
                x[i] = undefined
                continue
            }

            x[i] = c.get(t.prototype.constructor.name)!
        }

        yield x
    }
}

/**
 * Same as query, but only queries the root entities (entities without parents)
 */
export function* queryRoot<T extends any[]>(...types: { [K in keyof T]: new (...arg: any[]) => T[K] }): Generator<T> {
    const world = useWorld()

    const requiredComponents = new Array<string>(types.length)

    for (let i = 0; i < types.length; i++) {
        const t = types[i]
        if (t == undefined) {
            continue
        }

        if (t.prototype instanceof Component) {
            requiredComponents[i] = t.prototype.constructor.name
        }
    }

    entity_loop: for (const e of world.getEntities()) {
        const c = world.getEntityComponents(e)
        for (const component of requiredComponents) {
            if (!c.has(component)) {
                continue entity_loop
            }
        }

        const x = new Array<any>(types.length) as T
        for (let i = 0; i < types.length; i++) {
            const t = types[i]
            if (t == undefined) {
                x[i] = undefined
                continue
            }

            x[i] = c.get(t.prototype.constructor.name)!
        }

        yield x
    }
}
