#!/bin/bash

pyan3  `find . -type f -regex ".*\.py"` --uses --no-defines --grouped --dot > myuses.txt