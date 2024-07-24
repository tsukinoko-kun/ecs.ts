import {
    type App,
    Commands,
    query,
    res,
    Schedule,
    UiAnchor,
    UiButton,
    UiInteraction,
    UiNode,
    UiStyle,
    UiText,
} from "@tsukinoko-kun/ecs.ts"

// this resource is used to store the counter value
class Counter {
    public value = 0
}

// this component is used to mark the button for the counter
class CounterMarker {}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(
        new UiNode(),
        new UiStyle()
            .set("backgroundColor", "#f5f5f540")
            .set("border", "solid 1px #202020")
            .set("padding", "0.5rem 1rem")
            .set("maxWidth", "64rem")
            .set("margin", "4rem auto")
            .set("display", "flex")
            .set("flexDirection", "column")
            .set("alignItems", "center")
            .set("gap", "0.5rem"),
    ).withChildren((parent) => {
        parent.spawn(new UiText("Counter example"), new UiStyle().set("fontSize", "1.5rem").set("display", "block"))
        parent.spawn(
            new UiText("This is a simple counter example using the ECS.ts library."),
            new UiStyle().set("display", "block"),
        )
        parent.spawn(
            new UiAnchor("https://github.com/tsukinoko-kun/ecs.ts"),
            new UiText("ECS.ts on GitHub"),
            new UiStyle().set("display", "block"),
        )
        parent.spawn(
            new CounterMarker(),
            new UiButton(),
            new UiText("Click me!"),
            new UiInteraction(),
            new UiStyle().set("maxWidth", "16rem").set("padding", "0.5rem 1rem").set("border", "solid 1px #202020"),
        )
    })
}

// this system is used to increment the counter value on button click
function incrementCounter() {
    for (const [btn] of query([UiInteraction], query.and(CounterMarker))) {
        if (btn.clicked) {
            const counter = res(Counter)
            counter.value++
        }
    }
}

// this system is used to update the button text based on the current counter value
function updateButtonText() {
    const counter = res(Counter)
    for (const [text] of query([UiText], query.and(CounterMarker))) {
        if (counter.value === 0) {
            text.value = "Click to start the counter!"
        } else {
            text.value = `Counter: ${counter.value}\nClick to increment further!`
        }
    }
}

// this plugin bundles everything that is needed for this counter example to work
export function counterPlugin(app: App) {
    Commands.insertResource(new Counter())
    app.addSystem(Schedule.Startup, spawnUi)
        .addSystem(Schedule.Update, incrementCounter)
        .addSystem(Schedule.Update, updateButtonText)
}
