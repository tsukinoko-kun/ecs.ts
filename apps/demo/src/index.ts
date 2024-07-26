import { App, DefaultPlugin, HtmlPlugin, RouterPlugin } from "@tsukinoko-kun/ecs.ts"
import { CounterPlugin } from "./counter"
import { MeepPlugin } from "./meep"

const app = new App()

app
    // the DefaultPlugin is for basic functionality like input handling
    .addPlugin(DefaultPlugin)
    // the HtmlPlugin is for rendering the UI to the DOM
    .addPlugin(HtmlPlugin("#app"))
    // the RouterPlugin is for working with the browser's location (URL)
    // use RouterPlugin for using it without a base path and RouterPlugin.withBasePath for using it with a base path
    .addPlugin(RouterPlugin.withSettings("/ecs.ts/", "trim", true))
    // user plugins
    .addPlugin(CounterPlugin)
    .addPlugin(MeepPlugin)

app.run()
