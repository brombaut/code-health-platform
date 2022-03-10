import subprocess
import re


def _as_rev_range(start, end):
    return start + '..' + end


def _run_git_cmd(git_arguments):
    result = subprocess.Popen(git_arguments, stdout=subprocess.PIPE, stderr=subprocess.PIPE,).communicate()
    return result[0].decode("utf-8")


def _read_revisions_matching(git_arguments):
    git_log = _run_git_cmd(git_arguments)
    revs = []
    # match a line like: d804759 Documented tree map visualizations
    # ignore everything except the commit number:
    rev_expr = re.compile(r'([^\s]+)')
    for line in git_log.split("\n"):
        m = rev_expr.search(line)
        if m:
            revs.append(m.group(1))
    return revs[::-1]


def _git_cmd_for(git_dir, rev_start, rev_end):
    rev_range = rev_start + '..' + rev_end
    return ['git', '-C', git_dir, 'log', rev_range, '--oneline']


def read_revs(git_dir, rev_start, rev_end):
    """ Returns a list of all commits in the given range.
    """
    return _read_revisions_matching(git_arguments=_git_cmd_for(git_dir, rev_start, rev_end))


def read_revs_for(git_dir, file_name, rev_start, rev_end):
    return _read_revisions_matching(git_arguments=_git_cmd_for(git_dir, rev_start, rev_end) + [file_name])


def read_diff_for(git_dir, rev1, rev2):
    return _run_git_cmd(['git', '-C', git_dir, 'diff', rev1, rev2])


def read_file_diff_for(git_dir, file_name, rev1, rev2):
    return _run_git_cmd(['git', '-C', git_dir, 'diff', rev1, rev2, file_name])


def read_version_matching(git_dir, file_name, rev):
    result = _run_git_cmd(['git', '-C', git_dir, 'show', rev + ':' + file_name])
    return result
