export class HtmlRoot {
    public readonly root: Element

    public constructor(selector: string) {
        const root = document.querySelector(selector)
        if (root == null) {
            throw new Error(`Root element with selector ${selector} not found in the document`)
        }

        this.root = root
    }
}
