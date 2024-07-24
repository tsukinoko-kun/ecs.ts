export class HtmlRoot {
    public readonly element: Element

    public constructor(rootSelector: string)
    public constructor(rootElement: Element)
    public constructor(root: string | Element)
    public constructor(root: string | Element) {
        if (typeof root === "string") {
            const el = document.querySelector(root)
            if (el == null) {
                throw new Error(`Root element with selector ${root} not found in the document`)
            }
            this.element = el
        } else {
            this.element = root
        }
    }
}
