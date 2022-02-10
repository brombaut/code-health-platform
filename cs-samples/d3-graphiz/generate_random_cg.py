import json


def main():
    structure = load_enc_json()




def load_enc_json():
    structure = None
    with open("enclosure_diagram.json", 'r') as f:
        structure = json.load(f)
    return structure


def walk_structure(structure):
    


if __name__ == "__main__":
    main()
