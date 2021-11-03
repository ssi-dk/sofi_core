#/usr/bin/env bash

set -euo pipefail

# internal IP of the kratos admin API
ENDPOINT="http://0.0.0.0:4434"

# execute kratos cli directly on the running kratos container instance
# https://www.ory.sh/kratos/docs/cli/kratos
docker exec sofi_kratos_1 kratos identities list -e $ENDPOINT
