export class HtmlTitle {
    public get title(): string {
        return document.title
    }

    public set title(value: string) {
        document.title = value
    }
}
