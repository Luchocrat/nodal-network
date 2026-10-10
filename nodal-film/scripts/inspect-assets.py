#!/usr/bin/env python3
"""Rebuild the NODAL film asset manifest from the supplied MP4 originals.

Run from any directory:
  python3 scripts/inspect-assets.py
  python3 scripts/inspect-assets.py --require-public

ffprobe is the only external requirement. This script never modifies media.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from fractions import Fraction
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
EDITORIAL = {
    1: {
        "included": True,
        "editorialRole": "The Awakening / The Genesis",
        "editorialSummary": "Ivory RIDGE activates around 2–3.5 seconds, then gains coral around 3.5–8 seconds. This single clip contains both opening transformations.",
    },
    2: {
        "included": True,
        "editorialRole": "The Surface Gateway",
        "editorialSummary": "Coral-covered RIDGE passes through the computational core and reveals ATOL already deployed in the ocean.",
    },
    3: {
        "included": False,
        "editorialRole": "Alternative ATOL deployment",
        "editorialSummary": "White-studio ATOL transitions into ocean deployment.",
        "omissionReason": "Repeats ATOL's introduction and returns to a studio setup after clip 2 has already established ATOL in the ocean.",
    },
    4: {
        "included": True,
        "editorialRole": "The Descent",
        "editorialSummary": "Descends from ocean ATOL to the connected underwater computational and habitat reef.",
    },
    5: {
        "included": True,
        "editorialRole": "Earthbound",
        "editorialSummary": "Ascends from the reef network to an orbital view of Florida and the Atlantic, with a luminous marine network pattern.",
    },
    6: {
        "included": True,
        "editorialRole": "The Final Signal",
        "editorialSummary": "Florida orbital view converges to a single luminous sigil and the approved NODAL logo ending. Hold this clip's final frame.",
    },
}


def number(value: str | None) -> float | None:
    return float(value) if value not in (None, "N/A") else None


def integer(value: str | None) -> int | None:
    return int(value) if value not in (None, "N/A") else None


def probe_asset(ffprobe: str, path: Path, index: int) -> dict:
    result = subprocess.run(
        [ffprobe, "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    metadata = json.loads(result.stdout)
    streams = metadata["streams"]
    video = next((stream for stream in streams if stream["codec_type"] == "video"), None)
    audio = next((stream for stream in streams if stream["codec_type"] == "audio"), None)
    if video is None:
        raise ValueError(f"No video stream in {path}")
    rate = video["avg_frame_rate"]
    fps = float(Fraction(rate))
    frame_count = integer(video.get("nb_frames"))
    if frame_count is None:
        counted = subprocess.run(
            [ffprobe, "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "json", str(path)],
            check=True,
            capture_output=True,
            text=True,
        )
        frame_count = integer(json.loads(counted.stdout)["streams"][0].get("nb_read_frames"))
    video_duration = number(video.get("duration"))
    if video_duration is None and frame_count is not None:
        video_duration = frame_count / fps
    file_format = metadata["format"]
    asset = {
        "id": f"Nodal_{index}",
        "filename": path.name,
        "sourcePath": str(path),
        "publicPath": f"clips/{path.name}",
        **EDITORIAL[index],
        "format": {
            "durationSeconds": number(file_format.get("duration")),
            "sizeBytes": integer(file_format.get("size")),
            "bitRate": integer(file_format.get("bit_rate")),
            "container": file_format.get("format_name"),
        },
        "video": {
            "durationSeconds": video_duration,
            "fps": fps,
            "frameRate": rate,
            "width": video["width"],
            "height": video["height"],
            "codec": video["codec_name"],
            "profile": video.get("profile"),
            "pixelFormat": video.get("pix_fmt"),
            "frameCount": frame_count,
            "timeBase": video.get("time_base"),
            "bitRate": integer(video.get("bit_rate")),
        },
        "audio": None,
    }
    if audio:
        asset["audio"] = {
            "durationSeconds": number(audio.get("duration")),
            "codec": audio["codec_name"],
            "profile": audio.get("profile"),
            "sampleRate": integer(audio.get("sample_rate")),
            "channels": audio.get("channels"),
            "channelLayout": audio.get("channel_layout"),
            "frameCount": integer(audio.get("nb_frames")),
            "timeBase": audio.get("time_base"),
            "bitRate": integer(audio.get("bit_rate")),
        }
    return asset


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, default=Path.home() / "Downloads")
    parser.add_argument("--public-root", type=Path, default=PROJECT_ROOT / "public")
    parser.add_argument("--output", type=Path, default=PROJECT_ROOT / "src" / "asset-manifest.json")
    parser.add_argument("--ffprobe", default="ffprobe")
    parser.add_argument("--require-public", action="store_true", help="Fail if a public/clips copy is absent or differs in size from its original.")
    args = parser.parse_args()
    ffprobe = shutil.which(args.ffprobe)
    if ffprobe is None:
        parser.error(f"ffprobe was not found: {args.ffprobe}")
    sources = [args.source_dir.resolve() / f"Nodal_{index}.mp4" for index in range(1, 7)]
    missing = [str(path) for path in sources if not path.is_file()]
    if missing:
        parser.error("Missing source media: " + ", ".join(missing))
    assets = [probe_asset(ffprobe, path, index) for index, path in enumerate(sources, 1)]
    public_errors = []
    for asset in assets:
        public_path = args.public_root / asset["publicPath"]
        if not public_path.is_file():
            public_errors.append(f"Missing public copy: {public_path}")
        elif public_path.stat().st_size != asset["format"]["sizeBytes"]:
            public_errors.append(f"Public copy has a different size: {public_path}")
    if args.require_public and public_errors:
        parser.error("; ".join(public_errors))
    manifest = {
        "schemaVersion": 1,
        "project": "NODAL",
        "composition": {"id": "NodalFinalFilm", "width": 1920, "height": 1080, "fps": 30},
        "assets": assets,
        "branding": {
            "mode": "clip6-last-frame",
            "sourceAssetId": "Nodal_6",
            "holdSeconds": 2,
            "approval": "User approved the supplied clip 6 ending and holding its final frame; separate LogoPage artwork is not required.",
        },
        "music": {"supplied": False, "audioPlan": "Use supplied clip audio with short fades; silence during the final-frame hold."},
        "metadataNotes": [
            "Video duration controls image timing; container duration may be slightly longer because of audio.",
            "audio.frameCount is the encoded audio frame count reported by ffprobe, not a sample count.",
            "Final film timing is defined separately in the editable timeline configuration.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {args.output}: {len(assets)} supplied clips, 5 included, Nodal_3 omitted.")
    for asset in assets:
        video = asset["video"]
        audio = asset["audio"]
        print(f"{asset['id']}: {video['width']}×{video['height']}, {video['fps']:g} fps, {video['frameCount']} video frames, {video['durationSeconds']:.6f}s video, {audio['durationSeconds']:.6f}s audio")
    if public_errors:
        print("Public copies are not yet complete; run again with --require-public after media preparation.")
    else:
        print("All public/clips paths resolve and match original byte sizes.")


if __name__ == "__main__":
    main()
