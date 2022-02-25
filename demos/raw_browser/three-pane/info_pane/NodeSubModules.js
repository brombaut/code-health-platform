class NodeSubModules {
    constructor() {
        this.callbacks = new InfoNodeCallbacksMaker();
        this.nodeIdMaker = new NodeIdMaker();


    }

    makeEl(node) {
        return this.makeSelectedNodeSubModules(node);
    }

    makeSelectedNodeSubModules(node) {
        const ulEl = document.createElement("ul");
        ulEl.setAttribute("id", "module-children");
        if (node.children) {
            node.children.sort((a, b) => {
                if (a.children && !b.children) return -1;
                if (!a.children && b.children) return 1;
                if ((a.children && b.children) || (!a.children && !b.children)) {
                    // Both directories or both files, sort by name
                    return a.data.name.localeCompare(b.data.name, 'en', { sensitivity: 'base' })
                }
            }).forEach((d) => {
                ulEl.appendChild(this.selectedNodeSubModuleEl(d));
            });
        }
        return ulEl
    }

    selectedNodeSubModuleEl(node) {
        const spanEl = document.createElement("span");
        spanEl.setAttribute("id", `node-sub-module-${this.nodeIdMaker.fromNode(node)}`);
        spanEl.classList.add("node-sub-module");
        if (node.children) {
            spanEl.classList.add("directory");
            spanEl.textContent = `${node.data.name}/`;
        } else {
            spanEl.classList.add("file");
            spanEl.textContent = node.data.name;
        }
        spanEl.addEventListener("click", this.callbacks.makeSelected(node));
        spanEl.addEventListener("mouseenter", this.callbacks.makeMouseEnter(node));
        spanEl.addEventListener("mouseleave", this.callbacks.makeMouseLeave(node));

        const liEl = document.createElement("li");
        liEl.appendChild(spanEl);
        return liEl;
    }
}