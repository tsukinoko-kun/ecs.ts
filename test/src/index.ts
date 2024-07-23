import { App, DefaultPlugin, HtmlPlugin } from "@tsukinoko-kun/ecs.ts"
import { counterPlugin } from "./counter"

const app = new App()

app.addPlugin(DefaultPlugin).addPlugin(HtmlPlugin("#app")).addPlugin(counterPlugin)

app.run()
