import { App, Commands, DefaultPlugin, HtmlPlugin, Schedule, UiNode, UiStyle, UiText } from "@tsukinoko-kun/ecs.ts"

const app = new App()

app.addPlugin(DefaultPlugin)
    .addPlugin(HtmlPlugin("#app"))
    .addPlugin((world) => {
        world.addSystem(Schedule.Start, () => {
            Commands.spawn(
                new UiNode(),
                new UiStyle()
                    .set("backgroundColor", "whitesmoke")
                    .set("border", "solid 1px gray")
                    .set("padding", "0.5rem 1rem")
                    .set("margin", "1rem 0"),
            ).withChildren((parent) => {
                parent.spawn(new UiText("a"), new UiStyle().set("color", "red"))
                parent.spawn(new UiText("b"), new UiStyle().set("color", "blue"))
                parent.spawn(new UiText("c"), new UiStyle().set("color", "green"))
            })

            Commands.spawn(new UiText("hello world"))
        })
    })

app.run()
