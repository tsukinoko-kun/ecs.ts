import { res } from "../../resource"
import { HtmlRoot } from "../resources"
import { queryRoot } from "../../query"
import { UiStyle, UiText } from "../components"
import { Entity } from "../../entity"
import { Commands } from "../../commands"

export function renderHtmlRoot(): void {
    const root = res(HtmlRoot)

    let el = document.createElement("div")

    function render(e: Entity, el: HTMLElement): void {
        const entitiesHtml = document.createElement("div")
        el.appendChild(entitiesHtml)

        for (const c of Commands.components(e)) {
            if (c instanceof UiText) {
                entitiesHtml.innerText += c.value
            } else if (c instanceof UiStyle) {
                entitiesHtml.style.cssText = c.css
            }
        }

        for (const child of e.children) {
            render(child, entitiesHtml)
        }
    }

    for (const [e] of queryRoot([Entity])) {
        render(e, el)
    }

    const htmlStr = el.innerHTML
    if (root.root.innerHTML !== htmlStr) {
        root.root.innerHTML = htmlStr
    }
}
