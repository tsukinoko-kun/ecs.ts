export type Ident = symbol

const __identifier__ = Symbol("__identifier__")

export function identDisplay(symbol: Ident): string {
    return symbol.toString().replace(/^Symbol\((.*)\)$/, "$1")
}

export function identify<T extends Object>(o: T | (new (...arg: any[]) => T)): Ident {
    if (__identifier__ in o) {
        return o[__identifier__] as Ident
    }
    if (o instanceof Function) {
        if ("name" in o) {
            // @ts-ignore
            return (o[__identifier__] = Symbol.for(o.name))
        }
        // @ts-ignore
        return (o[__identifier__] = Symbol.for(String(o)))
    }

    if (o.constructor.name !== "Object") {
        // @ts-ignore
        return (o[__identifier__] = Symbol.for(String(o.constructor.name)))
    } else {
        console.warn("please use classes for components and resources")

        // all objects are considered the same use content to differentiate
        // @ts-ignore
        return (o[__identifier__] = Symbol.for(JSON.stringify(Object.keys(o).sort())))
    }
}
