class EncNodeSelectedEvent extends NodeEvent {
    constructor(d) {
        super(EventTypes.ENC_NODE_SELECTED, d);
        return this;
    }
}