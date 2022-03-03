async function main() {
    const systemStructure = await fetch("enclosure_diagram/enclosure_diagram.json")
        .then(res => res.json());
    const dependencyStructure = await fetch("dependency_pane/dependency_tree.json")
        .then(res => res.json());
    // Need to create info pane before enc diagram to register the listeners
    // Enc diagram sends all the inital events
    const infoPane = new InformationPane();
    
    const enclosureDiagram = new EnclosureDiagram(d3, systemStructure);
    const dependencyTree = new DependencyTreeParser(dependencyStructure, enclosureDiagram).parse();
    const dependencyPane = new DependencyPane(d3, dependencyTree);
}


main();