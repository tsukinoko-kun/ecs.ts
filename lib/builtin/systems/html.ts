import { res } from "../../resource"
import { HtmlRoot } from "../resources"
import { query } from "../../query"
import { UiAnchor, UiButton, UiInteraction, UiStyle, UiText } from "../components"
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
        let entityEl = document.createElement("div") as HTMLElement

        function changeTag(name: string) {
            const innerHtml = entityEl.innerHTML
            const css = entityEl.style.cssText
            entityEl = document.createElement(name)
            entityEl.innerHTML = innerHtml
            if (css) {
                entityEl.style.cssText = css
            }
        }

        for (const c of Commands.components(e)) {
            if (c instanceof UiText) {
                entityEl.innerText += c.value
            } else if (c instanceof UiStyle) {
                entityEl.style.cssText = c.css
            } else if (c instanceof UiButton) {
                changeTag("button")
            } else if (c instanceof UiAnchor) {
                changeTag("a")
                ;(entityEl as HTMLAnchorElement).href = c.href
                ;(entityEl as HTMLAnchorElement).target = c.target
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
