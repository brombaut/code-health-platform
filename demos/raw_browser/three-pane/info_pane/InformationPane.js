class InformationPane {
    constructor() {
        this.nodeClickedReceiver = new EventReceiver(
            EventTypes.ENC_NODE_SELECTED,
            ({node}) => this.newNodeSelected(node)
        )

        this.nodeMouseEnterReceiver = new EventReceiver(
            EventTypes.ENC_NODE_MOUSE_ENTER,
            ({node}) => this.handleNodeMouseEnter(node)
        )

        this.nodeMouseLeaveReceiver = new EventReceiver(
            EventTypes.ENC_NODE_MOUSE_LEAVE,
            ({node}) => this.handleNodeMouseLeave(node)
        )
    }

    newNodeSelected(node) {
        this.setSystemPath(node);
        this.setSelectedNodeSubModules(node);
    }

    setSystemPath(node) {
        const currPath = [];
        let temp = node;
        while (temp.parent) {
            currPath.unshift(temp);
            temp = temp.parent;
        }

        const el = document.querySelector("#system-path");
        el.innerHTML = "";
        el.appendChild(this.systemPathPrefixLabelEl(currPath.length === 0));
        el.appendChild(this.systemPathComponentSeparatorEl());
        for (let i=0; i < currPath.length; i++) {
            const isSelectable = i < currPath.length - 1;
            el.appendChild(this.systemPathComponentEl(currPath[i], isSelectable));
            if (isSelectable) {
                el.appendChild(this.systemPathComponentSeparatorEl());
            }
        }
    }

    systemPathPrefixLabelEl(isSelected) {
        const el = document.createElement("span");
        el.setAttribute("id", "prefix-label");
        el.textContent = "System";
        if (isSelected) {
            el.classList.add("selected");
        } else {
            el.classList.add("selectable");
            el.addEventListener("mouseenter", this.makeInfoNodeMouseEnterCallback(null));
            el.addEventListener("mouseleave", this.makeInfoNodeMouseLeaveCallback(null));
        }

        el.addEventListener("click", this.makeInfoNodeSelectedCallback(null));
        return el;
    }

    systemPathComponentSeparatorEl() {
        const el = document.createElement("span");
        el.classList.add("system-component-separator");
        el.textContent = "/";
        return el;
    }

    systemPathComponentEl(node, isSelectable) {
        const el = document.createElement("span");
        el.classList.add("system-component");
        if (isSelectable) {
            el.classList.add("selectable");
            el.addEventListener("mouseenter", this.makeInfoNodeMouseEnterCallback(node));
            el.addEventListener("mouseleave", this.makeInfoNodeMouseLeaveCallback(node));
        } else {
            // if not selectable, it is selected
            el.classList.add("selected");
        }
        el.textContent = node.data.name;
        el.addEventListener("click", this.makeInfoNodeSelectedCallback(node));
        return el;
    }

    setSelectedNodeSubModules(node) {
        const ulEl = document.createElement("ul");
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
        const containerEl = document.querySelector("#module-children");
        containerEl.innerHTML = "";
        containerEl.appendChild(ulEl);
    }

    selectedNodeSubModuleEl(node) {
        const spanEl = document.createElement("span");
        spanEl.setAttribute("id", `node-sub-module-${this.makeNodeIdStr(node)}`);
        spanEl.classList.add("node-sub-module");
        if (node.children) {
            spanEl.classList.add("directory");
            spanEl.textContent = `${node.data.name}/`;
        } else {
            spanEl.classList.add("file");
            spanEl.textContent = node.data.name;
        }
        spanEl.addEventListener("click", this.makeInfoNodeSelectedCallback(node));
        spanEl.addEventListener("mouseenter", this.makeInfoNodeMouseEnterCallback(node));
        spanEl.addEventListener("mouseleave", this.makeInfoNodeMouseLeaveCallback(node));

        const liEl = document.createElement("li");
        liEl.appendChild(spanEl);
        return liEl;
    }

    makeInfoNodeSelectedCallback(d) {
        const callback = () => new InfoNodeSelectedEvent(d).dispatch();
        return () => callback();
    }

    makeInfoNodeMouseEnterCallback(d) {
        const callback = () => new InfoNodeMouseEnterEvent(d).dispatch();
        return () => callback();
    }

    makeInfoNodeMouseLeaveCallback(d) {
        const callback = () => new InfoNodeMouseLeaveEvent(d).dispatch();
        return () => callback();
    }

    handleNodeMouseEnter(node) {
        document.querySelectorAll(".node-sub-module").forEach((el) => el.classList.remove("hovering"));
        let associatedNodeSubmoduleSpanEl = null;
        let temp = node;
        while (temp.parent) {
            associatedNodeSubmoduleSpanEl = document.querySelector(`#node-sub-module-${this.makeNodeIdStr(temp)}`);
            if (associatedNodeSubmoduleSpanEl) break;
            temp = temp.parent;
        }
        
        if (associatedNodeSubmoduleSpanEl) {
            associatedNodeSubmoduleSpanEl.classList.add("hovering");
        }
    }

    handleNodeMouseLeave(node) {
        document.querySelectorAll(".node-sub-module").forEach((el) => el.classList.remove("hovering"));
    }

    makeNodeIdStr(node) {
        const idPath = []
        let temp = node;
        while (temp.parent) {
            idPath.unshift(CSS.escape(temp.data.name.replaceAll(".", "")));
            temp = temp.parent;
        }
        return idPath.join("-");
    }

}