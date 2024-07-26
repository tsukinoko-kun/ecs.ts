export interface Equals {
    equals(other: this): boolean
}

export interface Comparable {
    compare(other: this): number
}

export type Eq = Equals | Comparable | string | number | boolean

export function eq<T extends Eq>(a: T, b: T): boolean {
    if (a === b) {
        return true
    }
    if (typeof a === "object" && typeof b === "object") {
        if ("equals" in a) {
            return a.equals(b as Equals)
        } else if ("compare" in a) {
            return a.compare(b as Comparable) === 0
        }
        // @ts-ignore
        return a.valueOf() === b.valueOf() || a.toString() === b.toString()
    }
    return false
}

export type DeepReadonly<T> = T extends (infer R)[]
    ? DeepReadonlyArray<R>
    : T extends object
      ? DeepReadonlyObject<T>
      : T

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}
