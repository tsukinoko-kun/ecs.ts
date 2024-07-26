import type { Plugin } from "../../plugin"
import { HtmlRoot } from "../resources"
import { Last, Startup, Update } from "../../schedule"
import { cleanupHtmlInteraction, htmlInteraction, renderHtmlRoot } from "../systems"
import { Commands } from "../../commands"

export function HtmlPlugin(rootSelector: string): Plugin
export function HtmlPlugin(rootElement: Element): Plugin
export function HtmlPlugin(root: string | Element): Plugin {
    return (app) => {
        Commands.insertResource(new HtmlRoot(root))
        app.addSystem(Update, renderHtmlRoot)
        app.addSystem(Startup, htmlInteraction)
        app.addSystem(Last, cleanupHtmlInteraction)
    }
}
