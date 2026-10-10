#!/usr/bin/env python3
"""Extract and level existing NODAL audio without changing its natural dynamics."""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import re
import subprocess


PROJECT = Path(__file__).resolve().parents[1]
SOURCE = Path.home() / "Downloads"
OUTPUT = PROJECT / "public" / "audio"
CLIPS = (1, 2, 4, 5, 6)
TARGET_LUFS = -22.0
PEAK_CEILING_DBTP = -2.0


def run(args):
    result = subprocess.run(args, capture_output=True, text=True, check=True)
    return result


def measure(path):
    result = run([
        "ffmpeg", "-hide_banner", "-nostdin", "-i", str(path),
        "-vn", "-af", "loudnorm=I=-22:TP=-2:LRA=11:print_format=json",
        "-f", "null", "-",
    ])
    matches = re.findall(r"\{[^{}]*\}", result.stderr, re.DOTALL)
    for match in reversed(matches):
        data = json.loads(match)
        if "input_i" in data:
            return {
                "integrated_lufs": float(data["input_i"]),
                "true_peak_dbtp": float(data["input_tp"]),
                "loudness_range_lu": float(data["input_lra"]),
                "threshold_lufs": float(data["input_thresh"]),
            }
    raise RuntimeError(f"Loudness measurement was not returned for {path}")


def prepare(number):
    source = SOURCE / f"Nodal_{number}.mp4"
    destination = OUTPUT / f"Nodal_{number}_ambience.wav"
    before = measure(source)
    if not math.isfinite(before["integrated_lufs"]):
        gain = 0.0
    else:
        gain = min(
            TARGET_LUFS - before["integrated_lufs"],
            PEAK_CEILING_DBTP - before["true_peak_dbtp"],
        )
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
        "-i", str(source), "-map", "0:a:0", "-vn",
        "-af", f"volume={gain:.6f}dB", "-ar", "48000", "-ac", "2",
        "-c:a", "pcm_s24le", str(destination),
    ])
    after = measure(destination)
    probe = json.loads(run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=codec_name,sample_rate,channels,bits_per_sample",
        "-of", "json", str(destination),
    ]).stdout)
    if after["true_peak_dbtp"] > PEAK_CEILING_DBTP + 0.05:
        raise RuntimeError(f"True peak ceiling exceeded for {destination}")
    return {
        "clip": number,
        "source_path": str(source),
        "output_path": str(destination),
        "public_path": f"audio/{destination.name}",
        "applied_gain_db": round(gain, 4),
        "input_measurement": before,
        "output_measurement": after,
        "duration_seconds": float(probe["format"]["duration"]),
        "format": probe["streams"][0],
    }


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=5) as pool:
        clips = list(pool.map(prepare, CLIPS))
    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_only": True,
        "target_integrated_lufs": TARGET_LUFS,
        "true_peak_ceiling_dbtp": PEAK_CEILING_DBTP,
        "method": "Static gain only; natural dynamics and source timing preserved. No added music or sound. Full source duration; Remotion applies timeline trims and boundary fades.",
        "clips": clips,
    }
    report_path = OUTPUT / "audio-report.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
