export class UiAnchor {
    public readonly href: string
    public readonly target: string

    constructor(href: string) {
        this.href = href
        this.target = href.startsWith("http") ? "_blank" : "_self"
    }
}
