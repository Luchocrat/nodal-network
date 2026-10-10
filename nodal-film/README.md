# NODAL final cinematic film

Editable Remotion 4.0.534 project. Composition: **NodalFinalFilm**.

- Current export: [NODAL_FINAL.mp4](../output/NODAL_FINAL.mp4), with an identical versioned copy at [NODAL_FINAL_v3.mp4](../output/NODAL_FINAL_v3.mp4).
- Previous edit: [NODAL_FINAL_v1.mp4](../output/NODAL_FINAL_v1.mp4).
- 1920 × 1080, 16:9, 30 fps, 1405 frames = **46.833333 seconds**
- H.264 / yuv420p, CRF 17, AAC 320 kbps / 48 kHz stereo
- Sources: supplied 1280 × 720, 24 fps Seedance clips, played at original speed and proportionally scaled to 1080p.

## Preview and render

```sh
npm ci
npm run dev
npm run render
```

Studio: http://localhost:3100/NodalFinalFilm

## Included scenes

| Film time | Start / duration in frames | Scene | Source range | Editorial choice |
|---|---|---|---|---|
| 0.000–9.000 | 0 / 270 | The Awakening / The Genesis | Nodal_1, 0.00–9.00s | Activation and coral growth share one source shot; preserve the central camera arc. |
| 8.800–18.300 | 264 / 285 | The Surface Gateway | Nodal_2, 0.50–10.00s | RIDGE core flythrough leads directly to ATOL deployed at sea; retain the stable ocean endpoint. |
| 17.400–27.400 | 522 / 300 | The Descent | Nodal_4, 0.00–10.00s | Restore the full ocean opening, then follow the camera below ATOL into the connected underwater network. |
| 26.300–35.800 | 789 / 285 | Earthbound | Nodal_5, 0.00–9.50s | Restore the reef opening and ascend to conceptual Florida / Atlantic orbital view; trim the tail to match the next orbital view. |
| 34.800–44.833333 | 1044 / 301 | The Final Signal | Nodal_6, 0.00–10.033333s | Restore the orbital opening; preserve convergence, black transition, and approved logo ending. |
| 44.833333–46.833333 | 1345 / 60 | Final frame hold | Nodal_6, native frame 240 at 10.00s | Hold the approved exact last frame for two additional seconds; silence. |

Revision 2 restores the incoming clips' full stable endpoints at the ocean, reef, and orbital joins. The first RIDGE join keeps a six-frame (0.20s) dissolve. The remaining three dissolves use 27, 33, and 30 frames (0.90s, 1.10s, and 1.00s), respectively, with ease-in-out opacity; original audio fades match those transition windows. Clip 5 ends at 9.50s so its source range 8.50–9.50s blends with clip 6's 0–1.00s, reducing the camera reset between their orbital views. The user-approved clip 6 ending and exact final-frame hold remain unchanged.

Revision 3 adds one restrained six-frame synchronization glitch at the reef-to-network handoff (26.733–26.933s), using two narrow displaced bands of the existing incoming clip. This follows the user’s updated direction allowing glitch transitions for a more technological feel. The source footage plays at its original speed; no new footage, typography, or music is added.

The smoother edit without the accent remains available as [NODAL_FINAL_v2.mp4](../output/NODAL_FINAL_v2.mp4).

## Omitted / missing

- **Nodal_3.mp4 omitted intentionally:** its studio-to-ocean ATOL deployment repeats the introduction and reverses the ocean location established by clip 2. Original retained in `public/clips` for editing.
- No separate F01 → F02 awakening clip was supplied: clip 1 contains both activation and biological growth.
- No separate project music or sound effects were found. The five included clips' original audio is retained, balanced to −22 LUFS using static gain, and faded at edit boundaries.
- `LogoPage.png` exists, but the user explicitly approved clip 6's last frame and requested that the PNG not replace it. The final image is a frozen frame of supplied video.

## Project structure

- `src/asset-manifest.json`: actual ffprobe metadata and provenance.
- `src/timeline.ts`: absolute frame starts and timing plan.
- `src/NodalFinalFilm.tsx`: independent named scene sequences.
- `src/scenes/`: connected compositions for shots and final freeze.
- `src/transitions.ts`: visual dissolves and audio envelopes.
- `src/SyncGlitch.tsx`: one brief source-video synchronization accent.
- `src/AudioTimeline.tsx`: separate original ambience; silence before wordmark appears.
- `public/clips/`: copies of all six original clips.
- `public/audio/`: balanced original audio and measurements.
- `scripts/inspect-assets.py`: regenerate metadata; `--require-public` verifies copies.
- `scripts/prepare-audio.py`: reproduce audio using FFmpeg.
- `scripts/verify-render.py`: verify final MP4 with FFmpeg / ffprobe.

To adjust a shot, change source trim in its scene file, parent sequence duration in `NodalFinalFilm.tsx`, matching timing in `timeline.ts` / `AudioTimeline.tsx`, and total duration in `Root.tsx`. Keep the final freeze on source frame 240, at 10 seconds.

## Validation

`npm run lint` passes. Render decoding, audio peak, silence, black frame and final-frame checks are recorded in `../output/qa/render-validation.json` after export. The dashboard was not modified.
