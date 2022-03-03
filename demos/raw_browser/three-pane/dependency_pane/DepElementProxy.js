class DepElementProxy {
    constructor() {

    }

    container() {
        return document.querySelector("#tree-diagram");
    }
    
    containerWidth() {
        return this.container().getBoundingClientRect().width;
    }
    
    containerHeight() {
        return this.container().getBoundingClientRect().height;
    }
    
    margin() {
        return 100;
    }

    reset() {
        this.container().innerHTML = "";
    }
}