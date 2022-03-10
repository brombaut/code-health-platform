import os
from typing import Type

from .commands import GitCheckoutCommand, GetEarliestCommitShaAfterDate, GetLatestCommitShaBeforeDate
from .file_index import FileIndex


class SystemBoundaries:
    """
    ### SystemBoundaries
    Represents the boundaries of your system
    ###### Example Usage
    ```python
    boundaries_dict = {
        "Code": ["src/code_maat"],
        "Test": ["test/code_maat"],
    }
    boundaries = SystemBoundaries(boundaries_dict)
    ```
    """
    boundaries_file = None

    def __init__(self, boundaries_dict):
        self.boundaries_dict = boundaries_dict
        self.boundaries_file = FileIndex().get("system_boundaries")

    def write_to_file(self):
        out_str = ""
        for boundary, matches in self.boundaries_dict.items():
            for m in matches:
                out_str += f"{m} => {boundary}\n"
        with open(self.out_file(), 'w') as f:
            f.write(out_str)

    def out_file(self):
        return self.boundaries_file


class ProjectForAnalysis:
    """
    ### ProjectForAnalysis
    Represents the local git repo for your project that you will perform different types of analysis on.
    To specify a timespan for your analysis, you can include the `before` and/or `after` parameters in the constructor.
    These dates will then be used to determine the commits that fall within this timespan for your analysis.
    ###### Example Usage
    ```python
    boundaries_dict = {
        "Code": ["src/code_maat"],
        "Test": ["test/code_maat"],
    }
    code_maat = ProjectForAnalysis(
        "/home/brombaut/work/code-maat",
        before="2013-09-05",
        after="2012-01-01",
        system_boundaries=SystemBoundaries(boundaries_dict)
    )
    ```
    """
    dir_to_analyze: str = None
    git_file: str = None
    before: str = None
    after: str = None

    def __init__(self, dir_to_analyze: str, before: str = None, after: str = None, system_boundaries: Type[SystemBoundaries] = None):
        self.dir_to_analyze = dir_to_analyze
        self.git_file = dir_to_analyze if dir_to_analyze.endswith("/.git") else f"{dir_to_analyze}/.git"
        self.before = before
        self.after = after
        if self.before:
            print(f"ALERT: Because you've specific a 'before' date, checking out {self.last_commit_in_timespan()}")
            checkout_command = GitCheckoutCommand(self.dir_to_analyze, self.last_commit_in_timespan())
            checkout_command.execute()
        self.system_boundaries: Type[SystemBoundaries] = system_boundaries

    def first_commit_in_timespan(self):
        command = GetEarliestCommitShaAfterDate(self.git_file, self.after)
        return command.execute().out_as_str().strip()

    def last_commit_in_timespan(self):
        command = GetLatestCommitShaBeforeDate(self.git_file, self.before)
        return command.execute().out_as_str().strip()

    def throw_if_file_does_not_exist(self, relative_file_name):
        if not os.path.isfile(f"{self.dir_to_analyze}/{relative_file_name}"):
            raise Exception(f"File not found: {self.dir_to_analyze}/{relative_file_name}")

    def has_system_boundaries(self):
        return self.system_boundaries is not None

    def system_boundaries_file(self):
        if not self.has_system_boundaries():
            return None
        self.system_boundaries.write_to_file()
        return self.system_boundaries.boundaries_file

