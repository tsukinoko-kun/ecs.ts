import type { Plugin } from "../../plugin"
import { HtmlRoot } from "../resources"
import { Schedule } from "../../schedule"
import { cleanupHtmlInteraction, htmlInteraction, renderHtmlRoot } from "../systems"
import { Commands } from "../../commands"

export function HtmlPlugin(rootSelector: string): Plugin {
    return (app) => {
        Commands.insertResource(new HtmlRoot(rootSelector))
        app.addSystem(Schedule.Update, renderHtmlRoot)
        app.addSystem(Schedule.Startup, htmlInteraction)
        app.addSystem(Schedule.Last, cleanupHtmlInteraction)
    }
}
