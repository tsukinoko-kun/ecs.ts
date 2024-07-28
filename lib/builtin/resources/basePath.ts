export class BasePath {
    public readonly basePath: string

    public constructor(basePath: string) {
        this.basePath = basePath
    }

    public toString(): string {
        return this.basePath
    }

    public valueOf(): string {
        return this.basePath
    }
}
