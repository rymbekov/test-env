#!/bin/bash 
# to exit with the code of first command in the pipe
set -euxo pipefail
# https://snyk.io/blog/detect-prevent-dependency-confusion-attacks-npm-supply-chain-security/
npx snync --directory . --debug --private $(cat ./package.json | grep -o '@picsio/[^"]*' | xargs)

