export abstract class Component {
    public componentId(): string {
        return this.constructor.name
    }
}
