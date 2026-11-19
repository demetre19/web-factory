#!/bin/bash
# Brixies daily driver — the account quota is 200 JSON/day.
# Retry hourly until the window resets, then the MCP harvester
# banks until it hits the cap. Repeat forever.
cd "/Users/apple/Documents/DEV-WORK/Web Factory"
while :; do
    .venv/bin/python tools/design-gate/harvest_brixies_mcp.py \
        --rate 1.5 >> /tmp/brixies-mcp-harvest.log 2>&1
    echo "[daily] pass done $(date '+%F %T') — sleeping 60m" \
        >> /tmp/brixies-mcp-harvest.log
    sleep 3600
done
