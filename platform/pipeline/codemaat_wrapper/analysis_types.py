import json
from typing import Type

from .file_index import FileIndex
from .commands import GitLogCommand, MaatCommand, ClocCommand, CreateEnclosureDiagramJson
from .entities import ProjectForAnalysis


class Analysis:
    def __init__(self, project_for_analysis: Type[ProjectForAnalysis]):
        self.project_for_analysis = project_for_analysis
        self._file_index = FileIndex()

    def _generate_log_file(self):
        log_command = GitLogCommand(
            self.project_for_analysis.git_file,
            before=self.project_for_analysis.before,
            after=self.project_for_analysis.after
        )
        log_command.execute().write_out_to_file()

    def df(self):
        raise Exception("Method not implemented")


class HotspotAnalysis(Analysis):
    """
    ### HotspotAnalysis
    Examines a project's files by extracting their revision frequency (as a proxy for effort expended on the module) and
    line count (as a proxy for complexity) in order to detect hotspots in your codebase.
    - `module`: The file in question
    - `revisions`: The number of revisions that module has undergone in the analysis timespan
    - `code`: The number of lines of code in the module (as a proxy for complexity)

    Example
    ```python
    code_maat = ProjectForAnalysis("/home/brombaut/work/code-maat")
    hs_analysis = HotspotAnalysis(code_maat)
    hs_analysis.analyze()
    """
    def __init__(self, project_for_analysis: Type[ProjectForAnalysis]):
        super().__init__(project_for_analysis)
        self._maat_command = MaatCommand(f"-l {self._file_index.get('git_log')} -c git -a revisions")
        self._cloc_command = ClocCommand(f"{self.project_for_analysis.dir_to_analyze} --by-file --csv --quiet --timeout 0")
        self._enclosure_json_command = CreateEnclosureDiagramJson(self._file_index.get('cloc_output'), self._file_index.get('maat_output'))

    def analyze(self):
        self._generate_log_file()
        # Analyze Change Frequencies
        self._maat_command.execute().write_out_to_file()
        # Count Lines of Code
        self._cloc_command.execute().write_out_to_file()
        # Create Enclosure JSON
        self._enclosure_json_command.execute().write_out_to_file()
        return self

    def output_file(self):
        # Hotspot analysis end point is the nclosure diagram json
        return self._file_index.get("enclosure_diagram")
