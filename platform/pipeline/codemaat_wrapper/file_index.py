ROOT = f"."
CODEMAAT_DIR = f"{ROOT}/codemaat_wrapper"
CODEMAAT_JAR = f"{ROOT}/{CODEMAAT_DIR}/code-maat-jar/code-maat-1.1-SNAPSHOT-standalone.jar"
CODEMAAT_SCRIPTS = f"{ROOT}/{CODEMAAT_DIR}/scripts"
GENERATED_FILES_DIR = f"{ROOT}/generated_files"
GIT_LOG_FILE = f"{ROOT}/{GENERATED_FILES_DIR}/git_evo.log"
MAAT_OUTPUT_FILE = f"{ROOT}/{GENERATED_FILES_DIR}/maat_output.csv"
CLOC_OUTPUT_FILE = f"{ROOT}/{GENERATED_FILES_DIR}/cloc_output.csv"
ENCLOSURE_DIAGRAM_FILE = f"{ROOT}/{GENERATED_FILES_DIR}/enclosure_diagram.json"
SYSTEM_BOUNDARIES_FILE = f"{ROOT}/{GENERATED_FILES_DIR}/system_boundaries.txt"


class FileIndex:
    _index = {
        "codemaat_jar": CODEMAAT_JAR,
        "codemaat_scripts": CODEMAAT_SCRIPTS,
        "git_log": GIT_LOG_FILE,
        "maat_output": MAAT_OUTPUT_FILE,
        "cloc_output": CLOC_OUTPUT_FILE,
        "enclosure_diagram": ENCLOSURE_DIAGRAM_FILE,
        "system_boundaries": SYSTEM_BOUNDARIES_FILE,
    }

    def get(self, key):
        if key in self._index:
            return self._index[key]
        raise Exception(f"{key} not found in file index")

    # def __init__(self):
    #     self.generated_files = "./generated-files"
    #     self.cs_scripts = "./cs-scripts"
    #     self.log_file = f"{self.generated_files}/git_evo.log"
    #     self.maat_output_csv = f"{self.generated_files}/maat_output.csv"
    #     self.cloc_lines_csv = f"{self.generated_files}/cloc_lines.csv"
    #     self.enclosure_diagram_json = f"{self.generated_files}/enclosure_diagram.json"
    #     self.codemaat_jar = "./code-maat-wrapper-jar/code-maat-wrapper-1.1-SNAPSHOT-standalone.jar"
    #     self.boundaries_textfile = f"{self.generated_files}/system_boundaries.txt"
    #     self.author_color_textfile = f"{self.generated_files}/author_color.txt"

