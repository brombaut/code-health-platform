const mNodes = [ 
    { id: "mammal", group: 0, label: "Mammals", level: 1 },
    { id: "dog"   , group: 0, label: "Dogs"   , level: 2 },
    { id: "cat"   , group: 0, label: "Cats"   , level: 2 },
    { id: "fox"   , group: 0, label: "Foxes"  , level: 2 }, 
    { id: "elk"   , group: 0, label: "Elk"    , level: 2 },
    { id: "insect", group: 1, label: "Insects", level: 1 },
    { id: "ant"   , group: 1, label: "Ants"   , level: 2 },
    { id: "bee"   , group: 1, label: "Bees"   , level: 2 },  
    { id: "fish"  , group: 2, label: "Fish"   , level: 1 },
    { id: "carp"  , group: 2, label: "Carp"   , level: 2 },
    { id: "pike"  , group: 2, label: "Pikes"  , level: 2 } 
]


class ForceDirectedDiagram {
    constructor(d3) {
        this.d3R = d3;
        this.elementProxy = new DepElementProxy();
    }

    makeNewDiagram(data) {
        this.elementProxy.reset();
        this.root = this.makeRoot(data);
        // this.svg = this.makeSvg();
        // this.links = this.makeLinks(this.svg, this.root);
        // this.nodes = this.makeNodes(this.svg, this.root);
    }
}