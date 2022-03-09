async function main() {
    const systemStructure = await fetch("enclosure_diagram/aug_structure_data.json")
        .then(res => res.json());
    // Need to create info pane before enc diagram to register the listeners
    // Enc diagram sends all the inital events
    const infoPane = new InformationPane();
    
    const enclosureDiagram = new EnclosureDiagram(d3, systemStructure);
    const dependencyPane = new DependencyPane(d3, enclosureDiagram.root);
}


main();