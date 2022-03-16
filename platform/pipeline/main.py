import argparse
import json

from codemaat_wrapper.entities import ProjectForAnalysis
from codemaat_wrapper.analysis_types import HotspotAnalysis
from dependency_analyzer.python_ast_analyzer import PythonAstAnalyzer
from structure_dependency_merger.structure_dependency_merger import StructureDependencyMerger


def main(args):
    # project_for_analysis = ProjectForAnalysis(args.project_directory, after=args.after, before=args.before)
    project_directory = "/home/brombaut/work/CISC873_TermProject"
    project_for_analysis = ProjectForAnalysis(project_directory)
    if args.analysis_type == "hotspot":
        structure_output_file = run_hotspot_analysis(project_for_analysis)
    else:
        raise Exception("Unsupported analysis type")

    if args.language == "python":
        dependency_output_file = PythonAstAnalyzer(project_directory).run()
    else:
        raise Exception("Unsupported language")
    structure = read_json_file(structure_output_file)
    dependency_structure = read_json_file(dependency_output_file)
    merged = StructureDependencyMerger(structure, dependency_structure).merge()
    write_json_file(merged, "./generated_files/structure_and_dependencies.json")


def run_hotspot_analysis(project):
    hs_analysis = HotspotAnalysis(project)
    hs_analysis.analyze()
    return hs_analysis.output_file()


def read_json_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def write_json_file(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run code-health analysis pipne')
    parser.add_argument('--project-directory', required=True)
    parser.add_argument('--language', required=True, choices=['python'])
    parser.add_argument('--after', required=False)
    parser.add_argument('--before', required=False)
    parser.add_argument('--analysis-type', required=True, choices=['hotspot'])
    p_args = parser.parse_args()
    main(p_args)
