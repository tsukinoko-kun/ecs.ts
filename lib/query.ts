import type { Component } from "./component"
import { useWorld } from "./world"
import { type Ident, identify } from "./identify"

export type QueryRule = (components: Array<Ident>) => boolean

type Q = (<T extends any[]>(
    types: { [K in keyof T]: new (...arg: any[]) => T[K] },
    ...filter: QueryRule[]
) => Generator<T>) & {
    /**
     * Query filter function that requires more components to be present then on the query itself
     */
    and: (...components: Component[]) => QueryRule
    /**
     * Query filter function that requires components to **not** be present
     */
    not: (...components: Component[]) => QueryRule
    /**
     * Same as query, but only queries the root entities (entities without parents)
     */
    root: <T extends any[]>(
        types: { [K in keyof T]: new (...arg: any[]) => T[K] },
        ...filter: QueryRule[]
    ) => Generator<T>
}

function queryAnd(...components: Component[]): QueryRule {
    const andComponentIdents = components.map(identify)

    return (test: Array<Ident>) => {
        for (const ident of andComponentIdents) {
            if (!test.includes(ident)) {
                return false
            }
        }

        return true
    }
}

export function queryNot(...components: Component[]): QueryRule {
    const notComponentIdents = components.map(identify)

    return (test: Array<Ident>) => {
        for (const ident of notComponentIdents) {
            if (test.includes(ident)) {
                return false
            }
        }

        return true
    }
}

function* normalQuery<T extends any[]>(
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
            if (!f(Array.from(c.keys()))) {
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

function* queryRoot<T extends any[]>(
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
            if (!f(Array.from(c.keys()))) {
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
 * Get all entities with the specified components (children are included)
 */
export const query = normalQuery as Q
query.and = queryAnd
query.not = queryNot
query.root = queryRoot
