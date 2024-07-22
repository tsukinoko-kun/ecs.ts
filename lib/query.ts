import type { Component } from "./component"
import { useWorld } from "./world"
import { type Ident, identify } from "./identify"

export type QueryRule = (components: IterableIterator<Ident>) => boolean

export function queryAnd(...components: Component[]): QueryRule {
    const andComponentIdents = components.map(identify)

    return (test: IterableIterator<Ident>) => {
        for (const tc of test) {
            if (!andComponentIdents.includes(tc)) {
                return false
            }
        }

        return true
    }
}

// query([UiText], queryAnd(UiText, UiText))

/**
 * Get all entities with the specified components (children are included)
 */
export function* query<T extends any[]>(
    types: { [K in keyof T]: new (...arg: any[]) => T[K] },
    ...filter: QueryRule[]
): Generator<T> {
    const world = useWorld()

    // list of component names that are required
    const requiredComponents = new Array<Ident>(types.length)

    // fill the requiredComponents array with the names of the required components
    for (let i = 0; i < types.length; i++) {
        const t = types[i]
        if (t == undefined || t.name === "Entity") {
            continue
        }

        requiredComponents[i] = identify(t)
    }

    // find all entities with the required components
    entity_loop: for (const [e, c] of world.getComponents()) {
        for (const component of requiredComponents) {
            if (component == undefined) {
                continue
            }
            if (!c.has(component)) {
                continue entity_loop
            }
        }

        // apply filters
        for (const f of filter) {
            if (!f(c.keys())) {
                console.log("filter failed")
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

            if (t.name === "Entity") {
                x[i] = e
                continue
            }

            x[i] = c.get(identify(t))
        }

        yield x
    }
}

/**
 * Same as query, but only queries the root entities (entities without parents)
 */
export function* queryRoot<T extends any[]>(
    types: { [K in keyof T]: new (...arg: any[]) => T[K] },
    ...filter: QueryRule[]
): Generator<T> {
    const world = useWorld()

    // list of component names that are required
    const requiredComponents = new Array<Ident>(types.length)

    // fill the requiredComponents array with the names of the required components
    for (let i = 0; i < types.length; i++) {
        const t = types[i]
        if (t == undefined || t.name === "Entity") {
            continue
        }

        requiredComponents[i] = identify(t)
    }

    // find all entities with the required components
    entity_loop: for (const e of world.getEntities()) {
        const c = world.getEntityComponents(e)
        for (const component of requiredComponents) {
            if (component == undefined) {
                continue
            }
            if (!c.has(component)) {
                continue entity_loop
            }
        }

        // apply filters
        for (const f of filter) {
            if (!f(c.keys())) {
                console.log("filter failed")
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

            if (t.name === "Entity") {
                x[i] = e
                continue
            }

            x[i] = c.get(identify(t))
        }

        yield x
    }
}
