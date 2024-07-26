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

export type TrainingSlash = "add" | "trim" | "keep"

export class Location implements Equals {
    public static trimIndexHtml = false
    public static trailingSlash: TrainingSlash = "keep"
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
        let tp = trimBasePath(bp, pn)
        if (Location.trimIndexHtml && tp.endsWith("/index.html")) {
            tp = tp.slice(0, -10)
        }
        switch (Location.trailingSlash) {
            case "add":
                if (!tp.endsWith("/")) {
                    tp += "/"
                }
                break
            case "trim":
                if (tp.endsWith("/")) {
                    tp = tp.slice(0, -1)
                }
                break
        }
        if (tp === "") {
            tp = "/"
        }
        const l = new Location(tp)
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
        if (pathCache.has(path)) {
            return pathCache.get(path)!
        }
        const bp = res(BasePath).basePath
        let tp = trimBasePath(bp, path)
        if (Location.trimIndexHtml && tp.endsWith("/index.html")) {
            tp = tp.slice(0, -10)
        }
        switch (Location.trailingSlash) {
            case "add":
                if (!tp.endsWith("/")) {
                    tp += "/"
                }
                break
            case "trim":
                if (tp.endsWith("/")) {
                    tp = tp.slice(0, -1)
                }
                break
        }
        if (tp === "") {
            tp = "/"
        }
        const l = new Location(tp)
        pathCache.set(path, l)
        return l
    }

    public equals(other: this): boolean {
        return this.path === other.path
    }
}
