export class Errors {
    public readonly message: string
    public readonly reason?: Errors

    public constructor(message: string, reason?: Errors) {
        this.message = message
        this.reason = reason
    }

    public static join(
        ...errors: [Errors | string, ...Array<Errors | string>]
    ): typeof errors extends [] ? never : Errors {
        let e: Errors | undefined = undefined
        for (let i = errors.length - 1; i >= 0; i--) {
            const error = errors[i]!
            if (typeof error === "string") {
                e = new Errors(error, e)
            } else {
                e = new Errors(error.message, e)
            }
        }
        return e!
    }

    public panic(): never {
        throw new Error(this.toString())
    }

    public toString(): string {
        return this.reason ? `${this.message}:\n${this.reason.toString()}` : this.message
    }
}

export type ErrorTuple<T> = [never, Errors] | [T, never]

export function err<T>(error: Errors | string): ErrorTuple<T> {
    if (typeof error === "string") {
        return [undefined as never, new Errors(error)]
    } else {
        return [undefined as never, error]
    }
}

export function ok<T>(value: T): ErrorTuple<T> {
    return [value, undefined as never]
}

export function panic(message?: string | Errors): never {
    if (!message) {
        throw new Error("panic")
    }

    if (message instanceof Errors) {
        throw new Error(message.toString())
    } else {
        throw new Error(message)
    }
}
