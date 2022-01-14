# Merges two CSV documents.
##

import csv
import sys
import os


class MergeError(Exception):
    def __init__(self, message):
        Exception.__init__(self, message)


class Merged(object):
    def __init__(self):
        self._all_modules_with_complexity = {}
        self._merged = {}

    def sorted_result(self):
        # Sort on descending order:
        ordered = sorted(self._merged.items(),
                         key=lambda item: int(item[1][0]), reverse=True)
        return ordered

    def extend_with(self, name, freqs):
        if name in self._all_modules_with_complexity:
            complexity = self._all_modules_with_complexity[name]
            self._merged[name] = freqs, complexity

    def record_detected(self, name, complexity):
        self._all_modules_with_complexity[name] = complexity


def skip_heading(f):
    next(f)


# def read_heading_from(r):
#     p = r.next()
#     while p == []:
#         p = r.next()
#     return p

# Changed for Python3
def read_heading_from(r):
    p = next(r)
    while p == []:
        p = next(r)
    return p


def validate_content_by(heading, expected):
    comparison = expected.split(',')
    stripped = heading[0:len(comparison)]  # allow extra fields
    if stripped != comparison:
        raise MergeError('Erroneous content. Expected = ' +
                         expected + ', got = ' + ','.join(heading))


def parse_csv(merged, filename, parse_action, expected_format, remove_project_path=False, path_column=None):
    # with open(filename, 'rb') as csvfile: # Changed for Python3
    rows = list()
    with open(filename, 'r') as csvfile:
        r = csv.reader(csvfile, delimiter=',')
        heading = read_heading_from(r)
        validate_content_by(heading, expected_format)
        for row in r:
            rows.append(row)
    project_path = extract_project_path(rows, path_column) if remove_project_path else None
    for row in rows:
        parse_action(merged, row, project_path=project_path)


def extract_project_path(rows, path_column):
    paths = [row[path_column] for row in rows if row[path_column] != '']
    project_path = os.path.commonprefix(paths)
    return project_path

def write_csv(stats):
    print('module,revisions,code')
    for s in stats:
        name, (f, c) = s
        print(name + ',' + f + ',' + c)


def as_os_aware_path(name):
    return os.path.normpath(name)


def parse_complexity(merged, row, project_path=None):
    name = as_os_aware_path(row[1])
    if project_path is not None:
        name = name.removeprefix(project_path)
    complexity = row[4]
    merged.record_detected(name, complexity)


def parse_freqs(merged, row, project_path=None):
    name = as_os_aware_path(row[0])
    if project_path is not None:
        name = name.removeprefix(project_path)
    freqs = row[1]
    merged.extend_with(name, freqs)


def merge(revs_file, comp_file):
    merged = Merged()
    parse_csv(merged, comp_file, parse_complexity,
              expected_format='language,filename,blank,comment,code',
              remove_project_path=True, path_column=1)
    parse_csv(merged, revs_file, parse_freqs, expected_format='entity,n-revs',
              remove_project_path=False, path_column=None)
    write_csv(merged.sorted_result())


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise MergeError(
            'Wrong arguments. Require one CSV file with frequencies and one with the complexity')
    revs_file = sys.argv[1]
    comp_file = sys.argv[2]
    merge(revs_file, comp_file)
