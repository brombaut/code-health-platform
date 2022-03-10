#!/bin/bash

cd /home/brombaut/work/code-health-notebook;

# Open project in VSCode
code .;

# Start jupyter notebook
jupyter notebook &>/dev/null
JUPYTER_SERVER_PID=$!

# Start http server for raw_browser scripts
cd ./demos/raw_browser/
python -m http.server &> /dev/null
HTTP_SERVER_PID=$!


echo "JUPYTER_SERVER_PID=$JUPYTER_SERVER_PID     HTTP_SERVER_PID=$HTTP_SERVER_PID"