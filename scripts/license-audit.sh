#!/bin/bash 
# to exit with the code of first command in the pipe
set -euxo pipefail

# analyze audit file with license-checker, should be instelled as dev dependency
license-checker --production --excludePrivatePackages --unknown --failOn 'unknown;GPL' --json --summary --out "$1"
