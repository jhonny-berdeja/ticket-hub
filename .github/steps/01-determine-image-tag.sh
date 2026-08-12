#!/usr/bin/env bash
# Sanitizes the branch name into a Docker-safe image tag and exposes it
# as this step's `tag` output, for later steps/jobs to reuse.
set -euo pipefail

SAFE="$(echo "$RAW_REF" | sed -E 's/[^a-zA-Z0-9._-]/-/g')"
echo "tag=$SAFE" >> "$GITHUB_OUTPUT"
