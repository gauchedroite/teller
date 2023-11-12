
import { Line } from "./line.js"


export class Response {
    private responses = Array<Line>();

    add(response: Line): Response {
        this.responses.push(response);
        return this;
    }

    selectOneLine(): Line | null {
        if (this.hasResponse == false)
            return null;
        return this.responses[Math.floor(Math.random() * this.responses.length)];
    }

    get hasResponse(): boolean {
        return (this.responses.length != 0);
    }
}
