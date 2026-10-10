NODAL addendum from Lucho (15:23). Hard stop 3:30 PM ET. Do ONLY what you can finish, rebuild and test before 3:30. If in doubt, skip it: the current build is honest as-is.

A. Hide the always-empty NOAA currents card (UI only, 1 line)
   NoaaPanel.tsx, in the obs-grid map: d.products.filter((p) => p.product !== "currents").map(...)
   Do NOT touch noaa.server.ts or tests. Keep the NODAL-GAP-CURRENT "UNKNOWN" gap in the assessment; that is now where "no current data" is stated.
   Accept: no "Current speed / direction" card; "Missing local evidence" still lists "Local current speed and direction".

B. Plainer Gemma wording (prompt string only)
   gemma.server.ts SYSTEM_INSTRUCTION:
   - Replace rule 5 with: "Write in plain language for a city planner: short sentences, no jargon, no rule IDs in the text. Say 'simulated' for scenario numbers and 'measured at a NOAA shore station' for observations, with the observation time."
   - Change "Maximum 230 words" to "Maximum 150 words".
   - KEEP the four headings exactly as they are (the UI's uncertainty check looks for "UNCERTAINTY").
   Run ONE live "Explain this assessment" after rebuilding. If the warning banner appears or the text claims safety or suitability, revert B.

C. NOT now: layout, "liquid" visual pass, new motion or glass effects. Deferred until after submission by Lucho.

Report in four lines: DONE / TESTED / BLOCKED / NEXT.
