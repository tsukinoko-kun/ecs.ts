export class UiStyle {
    public readonly cssObject: CSSStyleDeclaration

    constructor() {
        this.cssObject = document.createElement("div").style
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
