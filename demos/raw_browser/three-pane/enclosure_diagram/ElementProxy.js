

class ElementProxy {
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

// const color = ((d3) => {
//     const result = d3.scaleLinear()
//         .domain([-1, 5])
//         .range(["hsl(185,60%,99%)", "hsl(187,40%,70%)"])
//         .interpolate(d3.interpolateHcl);
//     return (c) => result(c);
// })(d3);

// function enc_container() {
//     return document.querySelector("#enclosure-diagram");
// }

// function enc_containerWidth() {
//     return enc_container().getBoundingClientRect().width;
// }

// function enc_containerHeight() {
//     return enc_container().getBoundingClientRect().height;
// }

// function enc_margin() {
//     return 200;
// }

// function enc_size() {
//     const rawWidth = enc_containerWidth() - enc_margin();
//     const rawHeight = enc_containerHeight() - enc_margin();
//     return rawWidth < rawHeight ? rawWidth : rawHeight;
// }

