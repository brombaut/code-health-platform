class NodeFileInformation {
    constructor() {

    }

    makeEl(node) {
        console.log()
        return this.makeNodeFileInformation(node);
    }

    makeNodeFileInformation(node) {
        const attributes = [
            {   
                "key": "code_lines",
                "label": "Code Lines",
                "parser": (v) => v,
            },
            {
                "key": "comment_lines",
                "label": "Comment Lines",
                "parser": (v) => v,
            },
            {
                "key": "blank_lines",
                "label": "Blank Lines",
                "parser": (v) => v,
            },
            {
                "key": "file_language",
                "label": "Language",
                "parser": (v) => v,
            },
            {
                "key": "normalized_weight",
                "label": "Hotspot Value",
                "parser": (v) => v.toFixed(2),
            }
        ]
        const el = document.createElement("table");
        el.setAttribute("id", "node-file-information")
        attributes.forEach((a) => {
            a.value = node.data[a.key];
            el.appendChild(this.makeTableRow(a))
        })
        return el;
    }

    makeTableRow(attribute) {
        const labelSpan = document.createElement("span");
        labelSpan.textContent = attribute.label;
        const labelTd = document.createElement("td");
        labelTd.appendChild(labelSpan);

        const valueSpan = document.createElement("span");
        valueSpan.textContent = attribute.parser(attribute.value);
        const valueTd = document.createElement("td");
        valueTd.appendChild(valueSpan);

        const tr = document.createElement("tr");
        tr.appendChild(labelTd);
        tr.appendChild(valueTd);
        return tr;
    }

}