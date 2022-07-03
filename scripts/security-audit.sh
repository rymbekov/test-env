#!/bin/bash 
# to exit with the code of first command in the pipe
set -euxo pipefail

# analyze audit file with https://oss.eventone.page/npm-audit-html/
npm audit --json --audit-level=critical --production | npm-audit-html --output "$1"