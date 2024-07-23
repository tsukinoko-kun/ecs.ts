export class HtmlRoot {
    public readonly element: Element

    public constructor(selector: string) {
        const root = document.querySelector(selector)
        if (root == null) {
            throw new Error(`Root element with selector ${selector} not found in the document`)
        }

        this.element = root
    }
}
