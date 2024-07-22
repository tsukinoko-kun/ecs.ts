import { App, Commands, DefaultPlugin, HtmlPlugin, Schedule, UiNode, UiStyle, UiText } from "@tsukinoko-kun/ecs.ts"

const app = new App()

app.addPlugin(DefaultPlugin)
    .addPlugin(HtmlPlugin("#app"))
    .addPlugin((world) => {
        world.addSystem(Schedule.Start, () => {
            Commands.spawn(new UiNode(), new UiStyle().set("backgroundColor", "red")).withChildren((parent) => {
                parent.spawn(new UiText("meep"))
            })

            Commands.spawn(new UiText("hello world"))
        })
    })

app.run()
