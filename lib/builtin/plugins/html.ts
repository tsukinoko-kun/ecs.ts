import type { Plugin } from "../../plugin"
import { HtmlRoot } from "../resources"
import { Schedule } from "../../schedule"
import { renderHtmlRoot } from "../systems"

export function HtmlPlugin(rootSelector: string): Plugin {
    return (world) => {
        world.insertResource(new HtmlRoot(rootSelector))
        world.addSystem(Schedule.PostStart, renderHtmlRoot)
    }
}
