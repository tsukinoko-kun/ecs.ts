export class UiNode {
    public readonly type: string

    public constructor(type: keyof HTMLElementTagNameMap) {
        this.type = type
    }
}
