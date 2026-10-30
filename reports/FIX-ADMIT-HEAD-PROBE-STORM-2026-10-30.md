# FIX-ADMIT-HEAD-PROBE-STORM-2026-10-30 (2026-10-30)

Durable findings stream — written by `crew report append` (R12); never held in memory until the end.

admit starvation is a lock-wedge, not just slow probes: night-manager pid 9074 holds /Users/apple/.prd-herdr/boss/.seq.lock fd 5u (EX, stamp 08:05:58Z) while its sweep runs serial git probes across 5 workspaces — observe --fleet timed out at 49s on the same lock (log.py:369 flock_bounded). 11 ready queue rows never admitted because the sweep never releases between admit cycles. Evidence: lsof -p 9074; probe-storm cost scales with workspace count.
