/**
 * Check if a key is currently pressed.
 * Key names are case-sensitive and equivalent to the key values of the KeyboardEvent interface.
 */
export class LogicalButtonInput {
    private readonly downKeys = new Array<string>()
    private readonly upKeys = new Array<string>()
    private readonly pressedKeys = new Array<string>()

    public constructor() {
        document.documentElement.addEventListener("keydown", (ev) => {
            this.downKeys.push(ev.key)
        })
        document.documentElement.addEventListener("keyup", (ev) => {
            this.upKeys.push(ev.key)
        })
        document.documentElement.addEventListener("keypress", (ev) => {
            this.pressedKeys.push(ev.key)
        })
    }

    /** @internal */
    public clear(): void {
        this.downKeys.length = 0
        this.upKeys.length = 0
        this.pressedKeys.length = 0
    }

    public pressed(key: string): boolean {
        return this.pressedKeys.includes(key)
    }

    public anyPressed(...keys: string[]): boolean {
        for (const key of keys) {
            if (this.pressed(key)) {
                return true
            }
        }
        return false
    }

    public down(key: string): boolean {
        return this.downKeys.includes(key)
    }

    public anyDown(...keys: string[]): boolean {
        for (const key of keys) {
            if (this.down(key)) {
                return true
            }
        }
        return false
    }

    public up(key: string): boolean {
        return this.upKeys.includes(key)
    }

    public anyUp(...keys: string[]): boolean {
        for (const key of keys) {
            if (this.up(key)) {
                return true
            }
        }
        return false
    }
}

/**
 * Check if a key is currently pressed.
 * Key names are case-sensitive and equivalent to the code values of the KeyboardEvent interface.
 */
export class PhysicalButtonInput {
    private readonly downKeys = new Array<string>()
    private readonly upKeys = new Array<string>()
    private readonly pressedKeys = new Array<string>()

    public constructor() {
        document.documentElement.addEventListener("keydown", (ev) => {
            this.downKeys.push(ev.code)
        })
        document.documentElement.addEventListener("keyup", (ev) => {
            this.upKeys.push(ev.code)
        })
        document.documentElement.addEventListener("keypress", (ev) => {
            this.pressedKeys.push(ev.code)
        })
    }

    /** @internal */
    public clear(): void {
        this.downKeys.length = 0
        this.upKeys.length = 0
        this.pressedKeys.length = 0
    }

    public pressed(key: string): boolean {
        return this.pressedKeys.includes(key)
    }

    public anyPressed(...keys: string[]): boolean {
        for (const key of keys) {
            if (this.pressed(key)) {
                return true
            }
        }
        return false
    }

    public down(key: string): boolean {
        return this.downKeys.includes(key)
    }

    public anyDown(...keys: string[]): boolean {
        for (const key of keys) {
            if (this.down(key)) {
                return true
            }
        }
        return false
    }

    public up(key: string): boolean {
        return this.upKeys.includes(key)
    }

    public anyUp(...keys: string[]): boolean {
        for (const key of keys) {
            if (this.up(key)) {
                return true
            }
        }
        return false
    }
}
