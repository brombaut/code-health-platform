class NodeEvent {
    constructor(type, d) {
        const payload = {
            detail: { node: d }
        }
        this.eToSend = new CustomEvent(type, payload);
        return this;
    }

    dispatch() {
        document.dispatchEvent(this.eToSend);
    }
}