class NodeIdMaker {
    constructor() {}

    fromNode(node) {
        const idPath = []
        let temp = node;
        while (temp.parent) {
            idPath.unshift(CSS.escape(temp.data.name.replaceAll(".", "")));
            temp = temp.parent;
        }
        return idPath.join("-");
    }
}