import type { Plugin } from "../../plugin"
import { HtmlRoot } from "../resources"
import { Last, Startup, Update } from "../../schedule"
import { cleanupHtmlInteraction, htmlInteraction, renderHtmlRoot } from "../systems"
import { Commands } from "../../commands"
import { res } from "../../resource"

export function HtmlPlugin(rootSelector: string): Plugin
export function HtmlPlugin(rootElement: Element): Plugin
export function HtmlPlugin(root: string | Element): Plugin {
    return (app) => {
        Commands.insertResource(new HtmlRoot(root))
        const rootElement = res(HtmlRoot).element
        rootElement.innerHTML = ""
        app.addSystem(Update, renderHtmlRoot)
            .addSystem(Startup, htmlInteraction)
            .addSystem(Last, cleanupHtmlInteraction)
    }
}
