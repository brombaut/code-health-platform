class InformationPane {
    constructor() {
        this.systemPath = new SystemPath();
        this.nodeSubModules = new NodeSubModules();
        this.nodeIdMaker = new NodeIdMaker();
        this.nodeFileInformation = new NodeFileInformation();
        this.nodeDirectoryInformation = new NodeDirectoryInformation();


        // TODO: Move these to their correct classes
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
        this.systemPath.set(node);
        let elToShow;
        if (node.children) {
            elToShow = document.createElement("div");
            elToShow.setAttribute("id", "node-directory-information")
            elToShow.appendChild(this.nodeDirectoryInformation.makeEl(node));
            const vrEl = document.createElement("div");
            vrEl.classList.add("vertial-rule");
            elToShow.appendChild(vrEl);
            elToShow.appendChild(this.nodeSubModules.makeEl(node));
        } else {
            elToShow = this.nodeFileInformation.makeEl(node);
        }
        this.addElToDetailsContainer(elToShow);
    }

    addElToDetailsContainer(el) {
        const containerEl = document.querySelector("#selected-node-details");
        containerEl.innerHTML = "";
        containerEl.appendChild(el);
    }

    handleNodeMouseEnter(node) {
        document.querySelectorAll(".node-sub-module").forEach((el) => el.classList.remove("hovering"));
        let associatedNodeSubmoduleSpanEl = null;
        let temp = node;
        while (temp.parent) {
            associatedNodeSubmoduleSpanEl = document.querySelector(`#node-sub-module-${this.nodeIdMaker.fromNode(temp)}`);
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

}