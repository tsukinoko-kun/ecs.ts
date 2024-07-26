import { nextState } from "../../state"
import { Location } from "../state"
import { inWorld, useWorld } from "../../world"

export function updateLocationState() {
    const origin = window.location.origin
    const world = useWorld()

    window.addEventListener("popstate", (ev) => {
        ev.preventDefault()
        inWorld(world, () => {
            nextState(Location.windowLocation())
        })
    })

    window.addEventListener("click", (ev) => {
        let ns: string | null = null

        for (const el of parentChain(ev.target as Element)) {
            if (el.tagName === "A") {
                const url = new URL((el as HTMLAnchorElement).href)
                if (url.origin !== origin) {
                    return
                }
                ev.preventDefault()
                history.pushState({}, "", (el as HTMLAnchorElement).href)
                ns = url.pathname
                break
            }
        }

        if (ns) {
            inWorld(world, () => {
                nextState(Location.fromPathTrimmed(ns))
            })
        }
    })
}

function* parentChain(el: Element): IterableIterator<Element> {
    yield el
    let p = el.parentElement
    while (p) {
        yield p
        p = p.parentElement
    }
}
