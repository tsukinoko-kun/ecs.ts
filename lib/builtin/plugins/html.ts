import type { Plugin } from "../../plugin"
import { HtmlRoot } from "../resources"
import { Schedule } from "../../schedule"
import { cleanupHtmlInteraction, htmlInteraction, renderHtmlRoot } from "../systems"
import { Commands } from "../../commands"

export function HtmlPlugin(rootSelector: string): Plugin
export function HtmlPlugin(rootElement: Element): Plugin
export function HtmlPlugin(root: string | Element): Plugin {
    return (app) => {
        Commands.insertResource(new HtmlRoot(root))
        app.addSystem(Schedule.Update, renderHtmlRoot)
        app.addSystem(Schedule.Startup, htmlInteraction)
        app.addSystem(Schedule.Last, cleanupHtmlInteraction)
    }
}
