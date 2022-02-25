class InfoNodeCallbacksMaker {
    constructor() {};

    makeSelected(d) {
        const callback = () => new InfoNodeSelectedEvent(d).dispatch();
        return () => callback();
    }

    makeMouseEnter(d) {
        const callback = () => new InfoNodeMouseEnterEvent(d).dispatch();
        return () => callback();
    }

    makeMouseLeave(d) {
        const callback = () => new InfoNodeMouseLeaveEvent(d).dispatch();
        return () => callback();
    }
}