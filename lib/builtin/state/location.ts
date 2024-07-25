import type { Equals } from "../../traits"

export class Location implements Equals {
    private readonly path: string

    public constructor(path: string) {
        this.path = path
    }

    public static windowLocation(): Location {
        return new Location(window.location.pathname)
    }

    public equals(other: this): boolean {
        return this.path === other.path
    }
}
