# ECS.ts

Strongly inspired by Bevy

## Installation

```shell
npm i @tsukinoko-kun/ecs.ts
```

```shell
pnpm add @tsukinoko-kun/ecs.ts
```

## Build

ECS.ts comes with a build script that is based on Vite and Playwright.  
You can of course use your own build system if you want.
Just keep in mind that ECS.ts is written in TypeScript and is not shipping any JavaScript files.

```json
{
    "dependencies": {
        "@tsukinoko-kun/ecs.ts": "^1.0.0"
    },
    "scripts": {
        "dev": "ecs dev",
        "build": "ecs build"
    }
}
```

## Concepts

### World

The world is the main container for all entities, components, resources, and systems.

Inside a system you can access the world through the `useWorld` function.
But you should only use it if you really need to.  
Use `Commands`, `query` and `res` to interact with the world.

### Entity

An entity is a unique identifier for a collection of components.
It doesn't have any data or logic, it is just an ID.

An entity can have multiple children.

To create an entity, use the `Commands.spawn` function and pass in the components you want to attach.

```ts
Commands.spawn(new MyComponent1(), new MyComponent2())
```

To create a child entity, use the `withChildren` function.

```ts
Commands.spawn(new MyComponent1()).withChildren((parent) => {
    parent.spawn(new MyComponent2())
})
```

### Component

A component is a piece of data that is associated with an entity.
It is just a plain data class with no logic.

Write your components as classes (not object notation `{}`), this is important for the ECS to work correctly.

A component instance can only be attached once per entity.
If you try to attach multiple instances of the same component to an entity,
the last one will overwrite the previous ones.  
Nothing stops you from attaching the same component to multiple entities,
but you really shouldn't do that.

### System

A system is the only place where you should put your logic.
It is just a function that gets called on a specified schedule.

To add a system to the world, use the `addSystem` function.

```ts
world.addSystem(Schedule.Update, mySystem)
```

### Schedule

When adding a system to the world, you can specify on which schedule it should run.

-   `Schedule.PreStartup` runs once and is the first system to run
-   `Schedule.Startup` runs once at the start of the application
-   `Schedule.PostStartup` runs once and is the last system to run during the startup phase
-   `Schedule.First` is the first system to run every frame
-   `Schedule.PreUpdate` runs every frame before the update systems
-   `Schedule.Update` runs every frame
-   `Schedule.PostUpdate` runs every frame after the update systems
-   `Schedule.Last` is the last schedule to run every frame and is meant for cleanup tasks

### Resource

A resource is a piece of data that is shared across all systems.
It is also persistent across the entire application lifetime.

Write your resources as classes (not object notation {}), this is important for the ECS to work correctly.

Accessing a resource is done through the `res` function.  
This function errors if the resource is not found.

```ts
const myResource = res(MyResource)
```

Register a resource with the world using the `insertResource` function.

```ts
Commands.insertResource(new MyResource())
```

### Query

A query is a way to filter entities based on their components.

The query takes a tuple of components (and optional filters) and returns an iterator over the entity component tuples
that match the query.

You can only use the query inside a system.

```ts
function mySystem() {
    for (const [comp1, comp2] of query([Component1, Component2])) {
        // do something with comp1 and comp2
    }

    // use filters to further narrow down the results
    for (const [comp1] of query([Component1], query.and(Component2, Component3))) {
        // do something with comp
    }

    // you can also exclude components from the query
    for (const [comp1] of query([Component1], query.not(Component2))) {
        // do something with comp
    }

    // you can also use a combination of filters
    for (const [comp1] of query([Component1], query.and(Component2), query.not(Component3))) {
        // do something with comp1
    }

    // it you need the entity itself, you can use the `Entity` type
    for (const [entity, comp1] of query([Entity, Component1])) {
        // do something with entity and comp1
    }
}
```

### Commands

The commands are used to interact with the world from within a system.

-   `Commands.spawn` creates a new entity with the specified components
-   `Commands.despawn` removes an entity and all its children
-   `Commands.addComponents` adds components to an existing entity
-   `Commands.insertResource` inserts a resource into the world
-   `Commands.getEntityById` gets an entity by its ID (numeric or string)
-   `Commands.components` gets all components of an entity

## Basic Example

Live at: https://tsukinoko-kun.github.io/ecs.ts/

Full source at: https://github.com/tsukinoko-kun/ecs.ts/tree/main/apps/demo

```ts
// index.ts
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
```

```ts
// counter.ts
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
```
