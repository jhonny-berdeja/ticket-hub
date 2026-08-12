#!/usr/bin/env bash
# Dispatches infra-hub's deploy workflow with the image tag just built,
# using a least-privilege token scoped to actions:write only.
set -euo pipefail

gh workflow run deploy-ticket-hub.yml \
  --repo "$REPO_OWNER/infra-hub" \
  --ref master \
  -f image_tag="$IMAGE_TAG"
