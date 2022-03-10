#!/bin/bash

# pyan3  `find . -type f -regex ".*\.py"` --uses --dot --file dependencies.txt


# usage: pyan3 FILENAME... [--dot|--tgf|--yed|--svg|--html]

# Analyse one or more Python source files and generate anapproximate call graph of the modules, classes and functions within them.

# optional arguments:
#   -h, --help            show this help message and exit
#   --dot                 output in GraphViz dot format
#   --tgf                 output in Trivial Graph Format
#   --svg                 output in SVG Format
#   --html                output in HTML Format
#   --yed                 output in yEd GraphML Format
#   --file FILE           write graph to FILE
#   --namespace NAMESPACE
#                         filter for NAMESPACE
#   --function FUNCTION   filter for FUNCTION
#   -l LOG, --log LOG     write log to LOG
#   -v, --verbose         verbose output
#   -V, --very-verbose    even more verbose output (mainly for debug)
#   -d, --defines         add edges for 'defines' relationships [default]
#   -n, --no-defines      do not add edges for 'defines' relationships
#   -u, --uses            add edges for 'uses' relationships [default]
#   -N, --no-uses         do not add edges for 'uses' relationships
#   -c, --colored         color nodes according to namespace [dot only]
#   -G, --grouped-alt     suggest grouping by adding invisible defines edges [only useful with --no-defines]
#   -g, --grouped         group nodes (create subgraphs) according to namespace [dot only]
#   -e, --nested-groups   create nested groups (subgraphs) for nested namespaces (implies -g) [dot only]
#   --dot-rankdir RANKDIR
#                         specifies the dot graph 'rankdir' property for controlling the direction of the graph. Allowed values: ['TB', 'LR', 'BT', 'RL']. [dot only]
#   -a, --annotated       annotate with module and source line number





java -jar \
    /home/brombaut/work/java-callgraph/target/javacg-0.1-SNAPSHOT-static.jar \
    /home/brombaut/work/java-callgraph/target/javacg-0.1-SNAPSHOT-static.jar \
    > /home/brombaut/work/code-health-notebook/demos/callgraphs/java_callgraph_dependencies.txt