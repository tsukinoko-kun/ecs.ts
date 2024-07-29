export class UiStyle {
    public readonly cssObject: CSSStyleDeclaration

    public constructor(cssObject?: Partial<CSSStyleDeclaration>) {
        this.cssObject = document.createElement("div").style
        if (cssObject) {
            for (const key in cssObject) {
                this.cssObject[key] = cssObject[key]!
            }
        }
    }

    public get css(): string {
        return this.cssObject.cssText
    }

    public set<K extends keyof CSSStyleDeclaration>(key: K, value: CSSStyleDeclaration[K]): this {
        this.cssObject[key] = value
        return this
    }

    public get<K extends keyof CSSStyleDeclaration>(key: K): CSSStyleDeclaration[K] {
        return this.cssObject[key]
    }
}
