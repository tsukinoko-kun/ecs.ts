export type Ident = symbol

const __identifier__ = Symbol("__identifier__")

export function identify<T extends Object>(o: T | (new (...arg: any[]) => T)): Ident {
    if (o instanceof Function) {
        return Symbol.for(String(o))
    }
    if (__identifier__ in o) {
        return o[__identifier__] as Ident
    }

    if (o.constructor.name !== "Object") {
        // @ts-ignore
        return (o[__identifier__] = Symbol.for(String(o.constructor)))
    } else {
        console.warn("please use classes for components and resources")

        // all objects are considered the same use content to differentiate
        // @ts-ignore
        return (o[__identifier__] = Symbol.for(JSON.stringify(Object.keys(o).sort())))
    }
}
