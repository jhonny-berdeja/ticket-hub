#!/usr/bin/env bash
# Writes a Job Summary explaining the dispatch to infra-hub and linking
# straight to its deploy workflow - visibility only, not an action to take.
set -euo pipefail

{
  echo "## 🚀 Deploy aprobado y disparado hacia infra-hub"
  echo ""
  echo "Este run pusheó \`$DOCKERHUB_USERNAME/ticket-hub:$IMAGE_TAG\` y, una vez aprobado arriba, le avisó a \`infra-hub\` que despliegue esa imagen en el cluster microk8s de pcbox. infra-hub la aplica automáticamente - no hace falta otra aprobación ahí."
  echo ""
  echo "**[▶ Ver el run de deploy en infra-hub](https://github.com/$REPO_OWNER/infra-hub/actions/workflows/deploy-ticket-hub.yml)**"
} >> "$GITHUB_STEP_SUMMARY"
