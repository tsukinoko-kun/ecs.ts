import { Component } from "../../component"

export class UiText extends Component {
    public value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}
