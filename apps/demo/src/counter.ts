import {
    type App,
    Commands,
    Entity,
    inState,
    OnEnter,
    OnExit,
    query,
    res,
    UiAnchor,
    UiButton,
    UiInteraction,
    UiNode,
    UiStyle,
    UiText,
    Update,
} from "@tsukinoko-kun/ecs.ts"
import { Location } from "../../../lib/builtin/state"

// this resource is used to store the counter value
class Counter {
    public value = 0
}

// this component is used to mark the button for the counter
class CounterButtonMarker {}

class CounterPageMarker {}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(
        new CounterPageMarker(),
        new UiNode("div"),
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
        parent.spawn(new UiNode("h1"), new UiText("Counter example"), new UiStyle().set("fontSize", "1.5rem"))
        parent.spawn(new UiNode("p"), new UiText("This is a simple counter example using the ECS.ts library."))
        parent.spawn(
            new UiAnchor("https://github.com/tsukinoko-kun/ecs.ts"),
            new UiText("ECS.ts on GitHub"),
            new UiStyle().set("display", "block"),
        )
        parent.spawn(new UiAnchor("./meep"), new UiText("Meep"))
        parent.spawn(
            new UiButton(),
            new UiText("Click me!"),
            new UiInteraction(),
            new UiStyle().set("maxWidth", "16rem").set("padding", "0.5rem 1rem").set("border", "solid 1px #202020"),
            new CounterButtonMarker(),
        )
    })
}

// this system is used to increment the counter value on button click
function incrementCounter() {
    for (const [btn] of query([UiInteraction], query.and(CounterButtonMarker))) {
        if (btn.clicked) {
            const counter = res(Counter)
            counter.value++
        }
    }
}

// this system is used to update the button text based on the current counter value
function updateButtonText() {
    const counter = res(Counter)
    for (const [text] of query([UiText], query.and(CounterButtonMarker))) {
        if (counter.value === 0) {
            text.value = "Click to start the counter!"
        } else {
            text.value = `Counter: ${counter.value}\nClick to increment further!`
        }
    }
}

function despawnUi() {
    for (const [entity] of query.root([Entity], query.and(CounterPageMarker))) {
        Commands.despawn(entity)
    }
}

// this plugin bundles everything that is needed for this counter example to work
export function CounterPlugin(app: App) {
    Commands.insertResource(new Counter())

    app
        // this system should run when the location changes to "/"
        .addSystem(OnEnter(Location.fromPath("/")), spawnUi)
        // this systems should only run if the current location is "/"
        .addSystem(Update, incrementCounter.runIf(inState(Location.fromPath("/"))))
        .addSystem(Update, updateButtonText.runIf(inState(Location.fromPath("/"))))
        // this system should run when the location changes from "/" to something else
        .addSystem(OnExit(Location.fromPath("/")), despawnUi)
}
