import { App, DefaultPlugin, HtmlPlugin } from "@tsukinoko-kun/ecs.ts"
import { counterPlugin } from "./counter"

const app = new App()

app
    // the DefaultPlugin is for basic functionality like input handling
    .addPlugin(DefaultPlugin)
    // the HtmlPlugin is for rendering the UI to the DOM
    .addPlugin(HtmlPlugin("#app"))
    // the counterPlugin is our custom plugin
    .addPlugin(counterPlugin)

app.run()
