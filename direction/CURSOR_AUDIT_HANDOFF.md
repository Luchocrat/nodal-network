NODAL site audit — AssayHall cycle 1 — HALLMARK 87.8% on BUILD_ID o2JM1gfWu_ve-_aF4PQZb (14:31 EDT).
Full report: direction/SITE_AUDIT.md (evidence, line numbers, acceptance checks). You own web/** only.

Layout, palette, scenario engine, badges, NOAA adapter and Gemma states are verified. Do not restructure.
Keep each fix local. Any edit voids the Hallmark for the touched criteria, so list the R-IDs you touched.

Priority (stop feature work at 3:30 PM ET; skip anything you cannot finish cleanly):

1. P1-01 (R-20) GemmaPanel.tsx + Dashboard.tsx + gemma.server.ts
   Gemma quoted water level 0.434 m (NOAA 18:24Z) while the screen showed 0.441 m (18:18Z), with no time.
   - Add an onExplained prop to GemmaPanel; Dashboard passes () => loadNoaa(). Call it after a successful explain
     (the server's 60 s NOAA cache returns the same payload Gemma received).
   - Under the AI text render: "Regional context used: NOAA observed <payload observedContext water_level observedAtUtc>".
   - SYSTEM_INSTRUCTION rule 6: add "When quoting a NOAA value, include its observation time (UTC) and datum."
   Accept: after Explain, strip time/values == payload; the time is visible with the explanation.

2. P1-02 (R-12) Dashboard.tsx:104-107
   Add beside the NET pill: <span className="state-pill">Site suitability: undetermined</span> <Badge tag="UNKNOWN" />
   Accept: at 1280x720 the first viewport shows "NET +20 kW · SIMULATED" and "Site suitability: undetermined ? UNKNOWN" together.

3. P1-03 (R-02) Dashboard.tsx:77-79 and NoaaPanel.tsx:148
   Header line: "For Miami marine researchers, coastal-resilience teams and planners screening proposed ocean
   infrastructure. Environmental accountability precedes deployment." Keep the "Not an operating data center…" sentence.
   Strip prefix: "Virginia Key, Miami · 8723214 · regional shore station".
   Accept: users, Miami and the accountability principle are readable in the first viewport.

4. P1-04 (R-16) NoaaPanel.tsx:79 and :155
   "N min old" freezes at retrieval time. Minimum: "{ageMinutes} min old at retrieval (HH:MM UTC)".
   Better: 60 s client tick recomputing age/stale from observedAtUtc.
   Accept: after 15 idle minutes the readout is correct or explicitly "at retrieval".

P2 (only if trivial):
- AssessmentPanel.tsx:40-44: move the "Rules triggered" line into its "Rules evaluated" <details>.
- GemmaPanel.tsx:119: "(see above)" -> "(see below)".
- globals.css:137: .rules li.off opacity 0.6 -> 0.85 (currently 3.63:1).
- NoaaPanel.tsx:147: remove the strip aria-label; add <span className="sr-only">Jump to NOAA details.</span>.
- ScenarioPanel.tsx:56: clamp battery to LIMITS.batteryKwh.max; an empty field keeps the previous value instead of 0.

Do NOT: add the GLB or any 3D, charts, fonts or motion; touch shared/network.json; change SVG glyph shapes;
change the logo (human-owned).

Verify: npm test && npm run typecheck && npm run build. Build overwrites .next, so restart `npm start -p 3001`
afterwards and replay: RIDGE_01, demand 60/gen 80 -> +20, demand 120 -> −40, suitability undetermined in both, Explain once.

Report back in four lines (HANDOFF §9): DONE / TESTED / BLOCKED / NEXT, plus the R-IDs touched,
so Claude can run a T1 re-assay of those items only.
