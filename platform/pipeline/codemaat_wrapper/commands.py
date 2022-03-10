import os
import subprocess

from .file_index import FileIndex


class Command:
    _file_index = FileIndex()

    def __init__(self, command):
        self._command = command
        self._stdout = b""
        self._stderr = b""

    def execute(self):
        process = subprocess.Popen(
            #             shlex.split(self.command),
            self._command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )
        stdout, stderr = process.communicate()
        self._stdout = stdout
        self._stderr = stderr
        if self.has_error():
            raise Exception(self.err_as_str())
        return self

    def has_error(self):
        return len(self._stderr) > 0

    def out_as_bytes(self):
        return self._stdout

    def err_as_bytes(self):
        return self._stderr

    def out_as_str(self):
        return self._stdout.decode("utf-8")

    def err_as_str(self):
        return self._stderr.decode("utf-8")

    def write_out_to_file(self, file_name):
        with open(file_name, 'wb') as f:
            f.write(self.out_as_bytes())
        return self

    def out_file(self):
        raise Exception("Method not implemented")


class GitLogCommand(Command):
    def __init__(self, git_file, before=None, after=None):
        command_str = f"git --git-dir {git_file} log --pretty=format:'[%h] %an %ad %s' --date=short --numstat"
        if after:
            command_str = command_str + f" --after={after}"
        if before:
            command_str = command_str + f" --before={before}"
        super().__init__(command_str)

    def execute(self):
        super().execute()
        # Raise exception if no log output was generated
        if len(self.out_as_bytes()) == 0:
            raise Exception("No log output generated")
        return self

    def write_out_to_file(self):
        return super().write_out_to_file(self.out_file())

    def out_file(self):
        return self._file_index.get("git_log")


class GitCheckoutCommand(Command):
    def __init__(self, git_dir, commit):
        command_str = f"git -C {git_dir} checkout {commit}"
        super().__init__(command_str)

    def execute(self):
        # I don't know why but executing git checkout writes to stderr
        try:
            super().execute()
        except Exception as e:
            if "HEAD is now at" not in str(e):
                raise e
            else:
                pass
        return self


class GetLatestCommitShaBeforeDate(Command):
    def __init__(self, git_file, before=None):
        command = f"git --git-dir {git_file} rev-list -n 1 HEAD"
        if before is not None:
            command = f"{command} --before='{before}'"
        super().__init__(command)

    def execute(self):
        super().execute()
        # Raise exception if no log output was generated
        if len(self.out_as_bytes()) == 0:
            raise Exception("No log output generated")
        return self


class GetEarliestCommitShaAfterDate(Command):
    def __init__(self, git_file, after=None):
        command = f"git --git-dir {git_file} log --reverse --pretty=format:%H"
        if after is not None:
            command = f"{command} --after='{after}'"
        command = f"{command} | head -n 1"
        super().__init__(command)

    def execute(self):
        super().execute()
        # Raise exception if no log output was generated
        if len(self.out_as_bytes()) == 0:
            raise Exception("No log output generated")
        return self


class MaatCommand(Command):
    def __init__(self, args_str):
        super().__init__(f"java -jar {self._file_index.get('codemaat_jar')} {args_str}")

    def write_out_to_file(self):
        return super().write_out_to_file(self.out_file())

    def out_file(self):
        return self._file_index.get('maat_output')


class ClocCommand(Command):
    def __init__(self, args_str):
        super().__init__(f"cloc {args_str}")

    def write_out_to_file(self):
        return super().write_out_to_file(self.out_file())

    def out_file(self):
        return self._file_index.get('cloc_output')


class CreateEnclosureDiagramJson(Command):
    def __init__(self, cloc_lines_file, maat_analysis_file, weight_column=1):
        command = f"python {self._file_index.get('codemaat_scripts')}/create_enclosure_diagram_json.py \
            --structure {cloc_lines_file} \
            --weights {maat_analysis_file} \
            --weightcolumn {weight_column}"
        super().__init__(command)

    def write_out_to_file(self):
        return super().write_out_to_file(self.out_file())

    def out_file(self):
        return self._file_index.get('enclosure_diagram')
