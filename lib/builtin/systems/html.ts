import { res } from "../../resource"
import { HtmlRoot } from "../resources"
import { query } from "../../query"
import { UiButton, UiStyle, UiText } from "../components"
import { Entity } from "../../entity"
import { Commands } from "../../commands"

export function renderHtmlRoot(): void {
    const root = res(HtmlRoot)

    let el = document.createElement("div")

    function render(e: Entity, el: HTMLElement): void {
        let entityEl = document.createElement("div") as HTMLElement

        for (const c of Commands.components(e)) {
            if (c instanceof UiText) {
                entityEl.innerText += c.value
            } else if (c instanceof UiStyle) {
                entityEl.style.cssText = c.css
            } else if (c instanceof UiButton) {
                const innerHtml = entityEl.innerHTML
                const css = entityEl.style.cssText
                entityEl = document.createElement("button")
                entityEl.innerHTML = innerHtml
                entityEl.style.cssText = css
            }
        }

        el.appendChild(entityEl)

        for (const child of e.children) {
            render(child, entityEl)
        }
    }

    for (const [e] of query.root([Entity])) {
        render(e, el)
    }

    const htmlStr = el.innerHTML
    if (root.element.innerHTML !== htmlStr) {
        root.element.innerHTML = htmlStr
    }
}
