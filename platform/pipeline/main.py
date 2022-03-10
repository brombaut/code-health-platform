import argparse

from codemaat_wrapper.entities import ProjectForAnalysis
from codemaat_wrapper.analysis_types import HotspotAnalysis


def main(args):
    # TODO: System structure
    # project_for_analysis = ProjectForAnalysis(args.project_directory, after=args.after, before=args.before)
    java_callgraph = ProjectForAnalysis("/home/brombaut/work/java-callgraph")

    if args.analysis_type == "hotspot":
        run_hotspot_analysis(java_callgraph)
    else:
        raise Exception("Unknown analysis type")


def run_hotspot_analysis(project):
    hs_analysis = HotspotAnalysis(project)
    hs_analysis.analyze()
    pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run code-health analysis pipne')
    parser.add_argument('--project-directory', required=True)
    parser.add_argument('--after', required=False)
    parser.add_argument('--before', required=False)
    parser.add_argument('--analysis-type', required=True, choices=['hotspot'])
    p_args = parser.parse_args()
    main(p_args)
