# Resolved playtest findings

The September 2026 repository audit rechecked the launch-era queue against the
current code and world. These original issue files are retained unchanged here
so their evidence and legacy identities remain available to triage.

| Issue | Resolution and verification |
| --- | --- |
| `79a9518a`, `1824cb88` | Oiling requires the oil flask, names it in the menu, and consumes it on success. The full walkthrough and successful-oiling engine assertion cover the behavior. |
| `6d948ccd` | Failed oiling refers to the flask and seized gears; no phantom wrench. The engine copy assertion checks this. |
| `dbfcddf0`, `9eb25aa4` | Every open observation includes carried items; `look` shows the same inventory without consuming a turn. The carried-items assertion and MCP transport checks cover the interface. |
| `ff9f75c9`, `4d5e5353` | The tavern's one-use grog restores 4hp, and garden rain provides another 3hp. The grog engine test and validated world establish accessible healing. |
| `b49d7e42` | Visible hostile NPCs show actual hit odds, damage, and counterattack risk for the equipped weapon. The lamp room discloses oiling's 60% success chance and 1hp failure cost. Tests compare combat hints to all 20 die outcomes and oiling prose to the authored check. |

Historical receipts describe their original build. Moving an issue here records
its current resolution; it does not claim its old trace replays on a changed world.
