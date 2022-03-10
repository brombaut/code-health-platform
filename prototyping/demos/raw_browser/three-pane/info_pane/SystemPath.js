class SystemPath {
    constructor() {
        this.callbacks = new InfoNodeCallbacksMaker();
    }

    set(node) {
        this.setSystemPath(node);
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
            el.addEventListener("mouseenter", this.callbacks.makeMouseEnter(null));
            el.addEventListener("mouseleave", this.callbacks.makeMouseLeave(null));
        }

        el.addEventListener("click", this.callbacks.makeSelected(null));
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
            el.addEventListener("mouseenter", this.callbacks.makeMouseEnter(node));
            el.addEventListener("mouseleave", this.callbacks.makeMouseLeave(node));
            el.addEventListener("click", this.callbacks.makeSelected(node));
        } else {
            // if not selectable, it is selected
            el.classList.add("selected");
        }
        el.textContent = node.data.name;
        return el;
    }
}