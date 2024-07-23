import type { Plugin } from "../../plugin"
import { HtmlRoot } from "../resources"
import { Schedule } from "../../schedule"
import { htmlInteraction, renderHtmlRoot } from "../systems"

export function HtmlPlugin(rootSelector: string): Plugin {
    return (world) => {
        world.insertResource(new HtmlRoot(rootSelector))
        world.addSystem(Schedule.Update, renderHtmlRoot)
        world.addSystem(Schedule.Start, htmlInteraction)
    }
}
