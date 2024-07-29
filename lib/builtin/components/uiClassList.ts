export class UiClassList {
    private _classList: Set<string>

    public constructor(...classList: string[]) {
        this._classList = new Set(classList)
    }

    public add(className: string): void {
        this._classList.add(className)
    }

    public remove(className: string): void {
        this._classList.delete(className)
    }

    public has(className: string): boolean {
        return this._classList.has(className)
    }

    public toggle(className: string): void {
        if (this.has(className)) {
            this.remove(className)
        } else {
            this.add(className)
        }
    }

    public clear(): void {
        this._classList.clear()
    }

    public toArray(): string[] {
        return Array.from(this._classList)
    }

    public toString(): string {
        return Array.from(this._classList).join(" ")
    }
}
