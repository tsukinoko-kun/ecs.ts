import type { Equals } from "../../traits"
import { res } from "../../resource"
import { BasePath } from "../resources"
import { insertDebugObject } from "../../debug"
import { panic } from "../../err"

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

const [pathCache, err] = insertDebugObject("location.pathCache", new Map<string, Location>())
if (err) {
    panic(err)
}

export type TrainingSlash = "add" | "trim" | "keep"

export class Location implements Equals {
    public static trimIndexHtml = false
    public static trailingSlash: TrainingSlash = "keep"
    public path: string

    private constructor(path: string, trim: boolean = false) {
        if (trim) {
            if (Location.trimIndexHtml && path.endsWith("/index.html")) {
                path = path.slice(0, -10)
            }
            switch (Location.trailingSlash) {
                case "add":
                    if (!path.endsWith("/")) {
                        path += "/"
                    }
                    break
                case "trim":
                    if (path.endsWith("/")) {
                        path = path.slice(0, -1)
                    }
                    break
            }
        }

        if (path === "") {
            path = "/"
        }

        this.path = path
    }

    public static windowLocation(): Location {
        const pn = Location.trimBasePath(window.location.pathname)
        if (pathCache.has(pn)) {
            return pathCache.get(pn)!
        }
        const l = new Location(pn, true)
        pathCache.set(pn, l)
        return l
    }

    /**
     * Create a Location from a path without trimming anything
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
     * Create a Location from a path, with trimming options applied
     */
    public static fromPathTrimmed(path: string): Location {
        path = Location.trimBasePath(path)

        if (pathCache.has(path)) {
            return pathCache.get(path)!
        }
        const l = new Location(path, true)
        pathCache.set(path, l)
        return l
    }

    private static trimBasePath(path: string): string {
        const bp = res(BasePath).basePath
        if (bp === "/") {
            return path
        }
        if (path.startsWith(bp)) {
            path = path.slice(bp.length)
        }
        if (!path.startsWith("/")) {
            path = "/" + path
        }
        return path
    }

    public equals(other: this): boolean {
        return this.path === other.path
    }

    public toString(): string {
        return this.path
    }

    public valueOf(): string {
        return this.path
    }
}
