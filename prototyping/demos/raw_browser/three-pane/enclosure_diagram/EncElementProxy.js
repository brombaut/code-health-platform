

class EncElementProxy {
    constructor(d3) {
        this.d3R = d3;
        this.lColor = this.setColor();
    }

    setColor() {
        const result = this.d3R.scaleLinear()
            .domain([-1, 5])
            .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
            .interpolate(this.d3R.interpolateHcl);
        return (c) => result(c);
    }

    color(c) {
        return this.lColor(c);
    }

    container() {
        return document.querySelector("#enclosure-diagram");
    }
    
    containerWidth() {
        return this.container().getBoundingClientRect().width;
    }
    
    containerHeight() {
        return this.container().getBoundingClientRect().height;
    }
    
    margin() {
        return 200;
    }
    
    size() {
        const rawWidth = this.containerWidth() - this.margin();
        const rawHeight = this.containerHeight() - this.margin();
        return rawWidth < rawHeight ? rawWidth : rawHeight;
    }
}
