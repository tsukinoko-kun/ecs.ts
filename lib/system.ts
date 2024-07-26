export type System = () => void | Promise<void>

declare global {
    interface Function {
        runIf<T extends Function>(this: T, condition: () => boolean): T
    }
}

Function.prototype.runIf = function <T extends Function>(this: T, condition: () => boolean): T {
    const fn = (...args: any[]) => {
        if (condition()) {
            return this(...args)
        }
    }

    return fn as unknown as T
}

function fn(x: string): number {
    return x.length
}
