class EventReceiver {
    constructor(type, callback) {
        document.addEventListener(type, (e) => callback(e.detail));
    }
}