import type { Plugin } from "../../plugin"
import { HtmlRoot, HtmlTitle } from "../resources"
import { Last, PreStartup, Startup, Update } from "../../schedule"
import { cleanupHtmlInteraction, clearHtmlRoot, htmlInteraction, renderHtmlRoot } from "../systems"

export function HtmlPlugin(rootSelector: string): Plugin
export function HtmlPlugin(rootElement: Element): Plugin
export function HtmlPlugin(root: string | Element): Plugin {
    return (app) => {
        app.insertResource(new HtmlRoot(root))
            .insertResource(new HtmlTitle())
            .addSystem(PreStartup, clearHtmlRoot)
            .addSystem(Update, renderHtmlRoot)
            .addSystem(Startup, htmlInteraction)
            .addSystem(Last, cleanupHtmlInteraction)
    }
}
