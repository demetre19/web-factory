#!/usr/bin/env bash
# Supervisor for harvest_brixies.py — the account cap is multi-hour, so a
# single foreground run gets torn down before the window opens. Loop the
# harvester; it is resume-safe and skips banked files. Exit only on 401.
cd "$(dirname "$0")"
export BRIXIES_KEY="${BRIXIES_KEY:-bxs_3672855896db09876d8c3adce83449556d5331ae}"
while :; do
    ../../.venv/bin/python -u harvest_brixies.py >> /tmp/brixies-harvest.log 2>&1
    rc=$?
    echo "[supervisor] harvester exited rc=$rc $(date)" >> /tmp/brixies-harvest.log
    # 401 -> harvester returns; stop looping on a dead key
    if grep -q 'ABORT: key 401' /tmp/brixies-harvest.log; then
        echo "[supervisor] key revoked, stopping" >> /tmp/brixies-harvest.log
        break
    fi
    sleep 300
done
