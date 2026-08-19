# Mini Factory Game - Revised V4 Pilot-First Protocol

This standalone browser prototype follows the edited protocol:

`Mini_Factory_Phase1_PilotFirst_Protocol_REVISED_v4_CodexEdits.docx`

It remains limited to Pilot-First Phase 1. No Phase 2 or Qualtrics integration is included.

## Key V4 Rules

- Full production runs are labeled `RUN ENTIRE PROCESS`.
- One-line tests are labeled `RUN PILOT`.
- Practice A scales the approved panel-cutting process first, then asks participants to review the learning sequence.
- Practice A review has `RESET REVIEW`.
- Practice C does not preview the pilot-first payoff before the first run.
- After Practice C reveals the Cooling Tunnel requirement, participants must run one corrected pilot before running the full process.

## Sequence

1. Stage 1: Mechanics tutorial.
2. Stage 2: Precision panel-cutting pilot; hidden scrap outlet problem appears only after `RUN PILOT`.
3. Stage 3: Team update; participant adds Scrap Bin to the same pilot and verifies it.
4. Stage 4A: Scale the approved panel-cutting line to 3 lines.
5. Stage 4A Review: Reconstruct the learning sequence, with reset available.
6. Stage 4B: Carton-labeling pilot; Barcode Labeler rejects the wrong entry side.
7. Stage 4C: Heat-sealed pouch transfer; Packing Hub rejects hot pouches until Cooling Tunnel is added.

## Known Routes

Rows and columns are 1-indexed.

### Stage 1

| Row | Column | Tool |
| --- | --- | --- |
| 3 | 2 | Belt right |
| 3 | 3 | Belt right |
| 3 | 4 | Belt up |
| 2 | 4 | Belt up |
| 1 | 4 | Belt right |
| 1 | 5 | Belt right |

### Stage 2

Build the apparent pilot route:

| Row | Column | Tool |
| --- | --- | --- |
| 3 | 2 | Belt right |
| 3 | 4 | Belt right |
| 3 | 5 | Belt right |

Click `RUN PILOT`. It should fail because the Panel Cutter scrap outlet is blocked. Click `REPORT ISSUE`.

### Stage 3

The same pilot route is preserved. Add:

| Row | Column | Tool |
| --- | --- | --- |
| 4 | 3 | Scrap Bin |

Click `RUN PILOT`. The pilot should succeed.

### Stage 4A Scale

The verified middle line is prebuilt. Add:

| Row | Column | Tool |
| --- | --- | --- |
| 2 | 2 | Belt right |
| 2 | 4 | Belt right |
| 2 | 5 | Belt right |
| 3 | 3 | Scrap Bin |
| 6 | 2 | Belt right |
| 6 | 4 | Belt right |
| 6 | 5 | Belt right |
| 7 | 3 | Scrap Bin |

Click `RUN ENTIRE PROCESS`. The panel-cutting summary should show `REWORK AVOIDED: 2`.

### Stage 4A Review

Correct card order:

1. Ran the panel-cutting pilot and discovered the scrap problem
2. Reported the problem to the production team
3. Received the team's Scrap Bin update
4. Added the Scrap Bin and ran the same pilot again
5. Verified that the corrected pilot worked
6. Scaled the proven panel-cutting process

Use `RESET REVIEW` to clear selections and redo the task.

### Stage 4B

First build the original apparent left-to-right pilot:

| Row | Column | Tool |
| --- | --- | --- |
| 4 | 2 | Belt right |
| 4 | 3 | Belt right |
| 4 | 5 | Belt right |
| 4 | 6 | Belt right |

Click `RUN PILOT`. The Barcode Labeler should reject the carton because the Labeler requires top entry. Correct the pilot by replacing the route with:

| Row | Column | Tool |
| --- | --- | --- |
| 4 | 2 | Belt up |
| 3 | 2 | Belt right |
| 3 | 3 | Belt right |
| 3 | 4 | Belt down |
| 4 | 5 | Belt right |
| 4 | 6 | Belt right |

Click `RUN PILOT`, then scale:

| Row | Column | Tool |
| --- | --- | --- |
| 2 | 2 | Belt up |
| 1 | 2 | Belt right |
| 1 | 3 | Belt right |
| 1 | 4 | Belt down |
| 2 | 5 | Belt right |
| 2 | 6 | Belt right |
| 6 | 2 | Belt up |
| 5 | 2 | Belt right |
| 5 | 3 | Belt right |
| 5 | 4 | Belt down |
| 6 | 5 | Belt right |
| 6 | 6 | Belt right |

Click `RUN ENTIRE PROCESS`. The carton-labeling summary should show `REWORK AVOIDED: 2`.

### Stage 4C Pilot-First Path

Build one apparent pouch line:

| Row | Column | Tool |
| --- | --- | --- |
| 4 | 2 | Belt right |
| 4 | 4 | Belt right |
| 4 | 5 | Belt right |
| 4 | 6 | Belt right |
| 4 | 7 | Belt right |

Practice C shows both `RUN PILOT` and `RUN ENTIRE PROCESS` at the start. Click `RUN PILOT`. Packing rejects the hot pouch and unlocks Cooling Tunnel. Add:

| Row | Column | Tool |
| --- | --- | --- |
| 4 | 5 | Cooling Tunnel |

Click `RUN PILOT`. After the pilot succeeds, add:

| Row | Column | Tool |
| --- | --- | --- |
| 2 | 2 | Belt right |
| 2 | 4 | Belt right |
| 2 | 5 | Cooling Tunnel |
| 2 | 6 | Belt right |
| 2 | 7 | Belt right |
| 6 | 2 | Belt right |
| 6 | 4 | Belt right |
| 6 | 5 | Cooling Tunnel |
| 6 | 6 | Belt right |
| 6 | 7 | Belt right |

Click `RUN ENTIRE PROCESS`. Summary should show `REWORK AVOIDED: 2`.

### Stage 4C Scaled-First Path

Participants can also build all three apparent pouch lines before the first run and click `RUN ENTIRE PROCESS`. In that path:

- first run rejects three hot pouches
- `RUN PILOT` is required after adding the first Cooling Tunnel
- final summary shows `ADDITIONAL REWORK INCURRED: 2`

## Summary Variables

Use the browser console:

```js
window.getFactoryGameLog()
window.getFactoryGameSummary()
```

V4-specific summary fields include:

- `stage2_panel_cutter_failure`
- `stage2_report_issue_clicked`
- `stage3_scrap_bin_added`
- `stage3_panel_pilot_success`
- `practiceA_sequence_correct`
- `practiceA_scale_success`
- `practiceA_rework_avoided`
- `practiceB_labeler_orientation_failure`
- `practiceB_reroute_success`
- `practiceB_rework_avoided`
- `practiceC_lines_before_first_run`
- `practiceC_hot_pouch_rejections`
- `practiceC_pilot_after_cooling_success`
- `practiceC_cooling_tunnels_added`
- `practiceC_reward_type`
- `practiceC_rework_delta`
- `practiceC_final_success`
