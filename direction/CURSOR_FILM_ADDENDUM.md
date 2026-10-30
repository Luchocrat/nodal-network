# Artsonist Execution Handoff — NODAL concept film (v2.1 addendum)

> **STATUS: LOCKED v2.1 (2026-10-10).** Inclusion is GIVEN by Lucho: "add this video somewhere in the site as the potential architecture of the marine NODAL network." He delegated the placement ("somewhere"); the Director decided it as below. Lucho may veto. Run this **with Slice 3** of `CURSOR_RESKIN_BRIEF.md`, after the Slice 2 checkpoint. Asset prep (step 1) can run any time.

| | |
|---|---|
| Source asset | `output/NODAL_FINAL_v3.mp4`, Lucho's concept film: 46.8 s, 1920×1080, H.264/AAC, 61 MB. Edited in Remotion 4.0.534 from six **AI-generated Seedance clips** (per `output/NODAL_REMOTION_PROJECT.zip` → `nodal-film/README.md`). Audio is the clips' generated ambience; no speech, no music track |
| Executor owns | `NODAL_STARTER/web/**` (media copies, one new section, CSS, README credits) |
| Do not | Edit, crop, re-time, overlay or re-grade the film; it is an authentic human-directed asset. No autoplay, no loop, no background or hero video, no muted-autoplay teaser |

---

## Why here (direction logic)

The film is the most compelling proposition NODAL makes. It shows coral colonizing the shells, an ATOL on open sea, a network sited **on a reef**, and a lit network across Florida from orbit. Under the Signature Move it must sit in the same reading area as its evidence boundary. So it goes in the **left column of the stage, after the AI explanation**, beside the sticky decision rail that keeps saying "Site ecological suitability: undetermined · Do not deploy yet." The vision and the refusal share one view.

This placement does not change the demo path (select → simulate → act → explain), and it does not blur the schema-bound network diagrams with free vision. It is **not** a third SECTION/PLAN view: the film shows far more than six nodes on real geography.

---

## Step 1 — Web assets (tested by the Director on 2026-10-10)

Run from `NODAL_STARTER/web`:

```sh
mkdir -p public/media
IN=../../output/NODAL_FINAL_v3.mp4
ffmpeg -y -i "$IN" -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k public/media/nodal-concept-1080.mp4   # ≈26.4 MB
ffmpeg -y -i "$IN" -vf scale=1280:-2 -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k public/media/nodal-concept-720.mp4   # ≈12.1 MB
ffmpeg -y -ss 27.5 -i "$IN" -frames:v 1 -vf scale=1600:-1 -q:v 3 public/media/nodal-concept-poster.jpg
```

The poster at 27.5 s shows ATOL at the surface, the umbilical, and the connected underwater units: the network architecture in one frame.

## Step 2 — Placement in the stage grid

Extend Slice 3's grid (DOM order: … rail → AI → **film** → ledger):

```css
@media (min-width: 1180px) {
  .stage { grid-template-areas: "net rail" "sel rail" "ai rail" "film rail"; }
  .stage > .s-rail { grid-row: 1 / span 4; }
  .stage > .s-film { grid-area: film; }
}
```

Below 1180px the film follows the AI explanation in a single column.

In the network stratum header, next to SECTION/PLAN, add a text link (≥44px target, utility numerals, no pill): `<a href="#film-h">▶ Concept film · 47 s</a>`.

## Step 3 — Markup (copy is verbatim; Lucho may edit wording, never the boundaries)

```tsx
<section className="s-film" aria-labelledby="film-h">
  <h2 id="film-h"><Tether tag="CONCEPTUAL">Proposed architecture</Tether></h2>
  <p className="film-meta">Concept film · 47 s · AI-generated (Seedance clips, edited in Remotion) · sound: generated ambience</p>
  <video controls preload="none" playsInline poster="/media/nodal-concept-poster.jpg" aria-describedby="film-desc" className="film">
    <source src="/media/nodal-concept-1080.mp4" type="video/mp4" media="(min-width: 1280px)" />
    <source src="/media/nodal-concept-720.mp4" type="video/mp4" />
  </video>
  <p id="film-desc" className="film-boundary">
    A speculative vision of the NODAL families — RIDGE, CANYON, CONNECTOR and the ATOL surface hub — not engineered hardware.
    Coral and marine life growing on the structures are illustration, not a predicted or measured outcome.
    The film places the network on a reef; reef habitat is exactly the evidence NODAL treats as unknown until surveyed.
    The orbital view of Florida and the Atlantic shows imagined scale only: no sites have been selected or surveyed.
    <strong>Nothing in this film changes the assessment: site ecological suitability is undetermined.</strong>
  </p>
  <details>
    <summary>What the film shows (text description)</summary>
    <ol className="film-chapters">
      <li><span className="mono">0:00–0:09</span> A RIDGE unit activates in a studio; illustrative coral grows over its shell.</li>
      <li><span className="mono">0:09–0:18</span> The camera passes the RIDGE compute core, then the ATOL surface hub floats at sea under its solar canopy.</li>
      <li><span className="mono">0:17–0:27</span> Descent below ATOL along the umbilical into the connected underwater units.</li>
      <li><span className="mono">0:26–0:36</span> Rise from the reef to an orbital view of Florida and the Atlantic with an imagined network of light.</li>
      <li><span className="mono">0:35–0:47</span> The network converges; NODAL wordmark and the author's mark; silence.</li>
    </ol>
  </details>
</section>
```

## Step 4 — Style (v2 grammar)

- Section is a stratum: no box. Serif title tethered to ◇ CONCEPTUAL; `.film-meta` in utility 13px muted.
- `.film { width: 100%; aspect-ratio: 16 / 9; display: block; background: var(--seabed); border: 0; border-radius: 0; }`. No mask, glow, shadow or overlay; native controls.
- `.film-boundary`: carrier 15–16px / 1.5, muted, max 70ch. The `<strong>` sentence in `--text`.
- `.film-chapters`: carrier 14px, timestamps in utility.
- Reduced motion: nothing extra, since nothing autoplays.

## Step 5 — Credits and disclosure

- Footer, after the type credits: "Concept film: AI-generated video (Seedance), edited in Remotion." Lucho adds the authorship credit wording; do not invent one.
- `web/README.md` under assets/AI: the same line, plus the generation platform and model terms. **Lucho to supply the platform and terms used for Seedance.** Mark the film as a conceptual visualization, not evidence.

## Evidence required on return

1. A screenshot at 1440×900 with the film poster in view **and** the sticky rail showing "Site ecological suitability: undetermined" beside it.
2. A 390×844 screenshot of the film section (boundary text fully visible, no overflow).
3. The network panel shows **no** media request before Play (`preload="none"`); after Play the 1080p source loads at ≥1280px width and the 720p source on narrow screens.
4. Keyboard: Tab reaches the "Concept film" link, the video controls and the details summary. Space toggles playback.
5. Asset sizes in `public/media` and the README/footer credit text.
6. Determinism replay unchanged (f24c5e8e / 54b0d579).

**Director checkpoint:** inspect with Slice 3. Glyph cross-assays the v2/v2.1 build.
