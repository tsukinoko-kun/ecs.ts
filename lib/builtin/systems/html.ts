import { res } from "../../resource"
import { HtmlRoot } from "../resources"
import { query } from "../../query"
import { UiAnchor, UiButton, UiInteraction, UiNode, UiStyle, UiText } from "../components"
import { Entity } from "../../entity"
import { inWorld, useWorld } from "../../world"
import { Commands } from "../../commands"

export function htmlInteraction(): void {
    const root = res(HtmlRoot)
    const world = useWorld()

    ;(root.element as HTMLElement).addEventListener("mousedown", (ev) => {
        inWorld(world, () => {
            for (const e of elements(ev)) {
                for (const c of Commands.components(e)) {
                    if (c instanceof UiInteraction) {
                        c.triggerDown()
                    }
                }
            }
        })
        ;(root.element as HTMLElement).addEventListener("mouseup", (ev) => {
            inWorld(world, () => {
                for (const [interaction] of query([UiInteraction])) {
                    interaction.triggerUp()
                }
            })
        })
        ;(root.element as HTMLElement).addEventListener("click", (ev) => {
            inWorld(world, () => {
                for (const e of elements(ev)) {
                    for (const c of Commands.components(e)) {
                        if (c instanceof UiInteraction) {
                            c.triggerClick()
                        }
                    }
                }
            })
        })
    })
}

function* elements(ev: MouseEvent): Generator<Entity> {
    let target = ev.target as Node | null
    while (target && !(target instanceof HTMLElement)) {
        target = target.parentElement
    }
    while (target) {
        let id = (target as HTMLElement).dataset.entity
        if (!id) {
            target = target.parentElement
            continue
        }
        const e = Commands.getEntityById(id)
        yield e
        target = target.parentElement
    }
}

export function cleanupHtmlInteraction(): void {
    for (const [interaction] of query([UiInteraction])) {
        interaction.resetClick()
    }
}

export function renderHtmlRoot(): void {
    const root = res(HtmlRoot)

    let el = document.createElement("div") as HTMLElement

    function render(e: Entity, el: HTMLElement): void {
        const attr = new Map<string, string>()
        const textContent = new Array<string>()
        let tagName = ""

        for (const c of Commands.components(e)) {
            if (c instanceof UiNode) {
                tagName = c.type
            } else if (c instanceof UiText) {
                textContent.push(c.value)
            } else if (c instanceof UiStyle) {
                attr.set("style", c.css)
            } else if (c instanceof UiButton) {
                tagName = "button"
            } else if (c instanceof UiAnchor) {
                tagName = "a"
                attr.set("href", c.href)
                attr.set("target", c.target)
            }
        }

        const entityEl = document.createElement(tagName || "div") as HTMLElement
        entityEl.textContent = textContent.join(" ")
        for (const [k, v] of attr) {
            switch (k) {
                case "style":
                    entityEl.style.cssText = v
                    break
                case "class":
                    entityEl.className = v
                    break
                default:
                    entityEl.setAttribute(k, v)
            }
        }
        entityEl.dataset.entity = e.id.toString()

        el.appendChild(entityEl)

        for (const child of e.children) {
            render(child, entityEl)
        }
    }

    for (const [e] of query.root([Entity])) {
        render(e, el)
    }

    diffRender(root.element, el)
}

function diffRender(old: Element, next: HTMLElement) {
    if (old.childNodes.length !== next.childNodes.length) {
        old.innerHTML = next.innerHTML
        return
    }
    const l = old.childNodes.length

    if (l === 0) {
        old.innerHTML = next.innerHTML
        return
    }

    for (let i = 0; i < l; i++) {
        const oldNode = old.childNodes[i]!
        const nextNode = next.childNodes[i]!

        if (oldNode instanceof HTMLElement && nextNode instanceof HTMLElement) {
            diffRender(oldNode, nextNode)
        } else {
            if (oldNode.textContent !== nextNode.textContent) {
                oldNode.textContent = nextNode.textContent
            }
        }
    }
}
