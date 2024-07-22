import { res } from "../../resource"
import { HtmlRoot } from "../resources"
import { query } from "../../query"
import { UiText } from "../components"

export function renderHtmlRoot(): void {
    const root = res(HtmlRoot)

    let htmlStr = ""

    for (const [text] of query(UiText)) {
        htmlStr += `<p>${text.value}</p>`
    }

    if (root.root.innerHTML !== htmlStr) {
        root.root.innerHTML = htmlStr
    }
}
