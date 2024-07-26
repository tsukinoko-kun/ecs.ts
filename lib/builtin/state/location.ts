import type { Equals } from "../../traits"
import { res } from "../../resource"
import { BasePath } from "../resources/basePath"

function trimBasePath(basePath: string, path: string): string {
    if (basePath === "/") {
        return path
    }
    if (path.startsWith(basePath)) {
        path = path.slice(basePath.length)
    }
    if (!path.startsWith("/")) {
        path = "/" + path
    }
    return path
}

const pathCache = new Map<string, Location>()

export class Location implements Equals {
    public path: string

    private constructor(path: string) {
        this.path = path
    }

    public static windowLocation(): Location {
        const pn = window.location.pathname
        if (pathCache.has(pn)) {
            return pathCache.get(pn)!
        }
        const bp = res(BasePath).basePath
        const l = new Location(trimBasePath(bp, pn))
        pathCache.set(pn, l)
        return l
    }

    /**
     * Create a Location from a path without trimming the base path
     */
    public static fromPath(path: string): Location {
        if (pathCache.has(path)) {
            return pathCache.get(path)!
        }
        const l = new Location(path)
        pathCache.set(path, l)
        return l
    }

    /**
     * Create a Location from a path, trimming the base path if it exists
     */
    public static fromPathTrimmed(path: string): Location {
        if (pathCache.has(path)) {
            return pathCache.get(path)!
        }
        const bp = res(BasePath).basePath
        const l = new Location(trimBasePath(bp, path))
        pathCache.set(path, l)
        return l
    }

    public equals(other: this): boolean {
        return this.path === other.path
    }
}
