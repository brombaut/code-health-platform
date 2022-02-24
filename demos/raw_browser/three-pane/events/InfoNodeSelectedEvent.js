class InfoNodeSelectedEvent extends NodeEvent {
    constructor(d) {
        super(EventTypes.INFO_NODE_SELECTED, d);
        return this;
    }
}