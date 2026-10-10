#!/usr/bin/env python3
"""Verify the delivered NODAL render without changing the film or project."""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
import math
from pathlib import Path
import re
import subprocess
import sys


WORKSPACE = Path(__file__).resolve().parents[2]
RENDER = WORKSPACE / "output" / "NODAL_FINAL.mp4"
SOURCE_ENDING = Path.home() / "Downloads" / "Nodal_6.mp4"
REPORT = WORKSPACE / "output" / "qa" / "render-validation.json"
FPS = 30
FRAMES = 1405
HOLD_START = 1345
HOLD_FRAMES = 60


def command(args):
    return subprocess.run(args, capture_output=True, text=True)


def ffmpeg(*args):
    return command(["ffmpeg", "-hide_banner", "-nostdin", *args])


def loudness():
    result = ffmpeg("-i", str(RENDER), "-vn", "-af",
        "loudnorm=I=-22:TP=-2:LRA=11:print_format=json", "-f", "null", "-")
    for block in reversed(re.findall(r"\{[^{}]*\}", result.stderr, re.DOTALL)):
        data = json.loads(block)
        if "input_i" in data:
            peak = float(data["input_tp"])
            return {
                "passed": result.returncode == 0 and peak <= -2.0,
                "integrated_lufs": float(data["input_i"]),
                "true_peak_dbtp": peak,
                "loudness_range_lu": float(data["input_lra"]),
                "clipping_detected": peak >= 0,
                "true_peak_ceiling_dbtp": -2,
            }
    return {"passed": False, "error": result.stderr[-2000:]}


def final_silence():
    result = ffmpeg("-ss", str(HOLD_START / FPS), "-i", str(RENDER),
        "-t", str(HOLD_FRAMES / FPS), "-vn", "-af", "volumedetect", "-f", "null", "-")
    match = re.search(r"max_volume: ([\-\d.inf]+) dB", result.stderr)
    peak = float(match.group(1)) if match else None
    return {
        "passed": result.returncode == 0 and peak is not None and peak <= -80,
        "from_seconds": HOLD_START / FPS,
        "duration_seconds": HOLD_FRAMES / FPS,
        "max_volume_dbfs": peak if peak is not None and math.isfinite(peak) else "-inf",
        "silence_threshold_dbfs": -80,
    }


def full_decode():
    result = ffmpeg("-v", "error", "-i", str(RENDER), "-map", "0:v:0",
        "-map", "0:a:0", "-f", "null", "-")
    return {"passed": result.returncode == 0 and not result.stderr.strip(),
        "exit_code": result.returncode, "decode_errors": result.stderr.strip()}


def black_detection():
    result = ffmpeg("-i", str(RENDER), "-an", "-vf",
        "blackdetect=d=0.02:pic_th=0.99999:pix_th=0.01", "-f", "null", "-")
    intervals = [{"start_seconds": float(start), "end_seconds": float(end),
        "duration_seconds": float(duration)}
        for start, end, duration in re.findall(
            r"black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)", result.stderr)]
    return {"passed": result.returncode == 0 and not intervals,
        "nearly_pure_black_intervals": intervals,
        "picture_black_ratio": 0.99999, "pixel_black_threshold": 0.01,
        "minimum_duration_seconds": 0.02}


def compare_hold(reference, source_frame):
    # Compare every held frame after reducing the export to the source resolution.
    graph = (
        f"[0:v]trim=start_frame={HOLD_START}:end_frame={FRAMES},"
        "setpts=PTS-STARTPTS,scale=1280:720,format=yuv420p[held];"
        f"[1:v]select=eq(n\\,{source_frame}),loop=loop=-1:size=1:start=0,"
        "setpts=N/(30*TB),scale=1280:720,format=yuv420p[reference];"
        "[held][reference]ssim[verified]"
    )
    result = ffmpeg("-i", str(RENDER), "-i", str(reference),
        "-filter_complex", graph, "-map", "[verified]", "-an",
        "-frames:v", str(HOLD_FRAMES), "-f", "null", "-")
    matches = re.findall(r"All:([\d.]+)", result.stderr)
    similarity = float(matches[-1]) if matches else None
    return {"passed": result.returncode == 0 and similarity is not None and similarity >= 0.99,
        "ssim": similarity, "minimum_ssim": 0.99,
        "frames_compared": HOLD_FRAMES, "comparison_resolution": "1280x720",
        "reference_path": str(reference), "reference_frame": source_frame,
        "error": result.stderr[-1200:] if result.returncode != 0 else None}


def main():
    probe = command(["ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=index,codec_type,codec_name,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_frames,sample_rate,channels,duration",
        "-of", "json", str(RENDER)])
    if probe.returncode:
        print(probe.stderr, file=sys.stderr)
        raise SystemExit(1)
    metadata = json.loads(probe.stdout)
    video = next(stream for stream in metadata["streams"] if stream["codec_type"] == "video")
    audio = next(stream for stream in metadata["streams"] if stream["codec_type"] == "audio")
    actual_duration = float(metadata["format"]["duration"])
    expected_duration = FRAMES / FPS
    metadata_pass = (
        video["codec_name"] == "h264" and video["pix_fmt"] == "yuv420p"
        and video["width"] == 1920 and video["height"] == 1080
        and video["r_frame_rate"] == "30/1" and video["avg_frame_rate"] == "30/1"
        and int(video["nb_frames"]) == FRAMES
        and abs(actual_duration - expected_duration) < 0.03
        and audio["codec_name"] == "aac" and audio["sample_rate"] == "48000"
        and audio["channels"] == 2
    )
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {
            "full_decode": pool.submit(full_decode),
            "audio_loudness_and_clipping": pool.submit(loudness),
            "final_two_seconds_silence": pool.submit(final_silence),
            "unintended_black_frames": pool.submit(black_detection),
            "ending_matches_approved_source_frame": pool.submit(compare_hold, SOURCE_ENDING, 240),
            "ending_is_frozen": pool.submit(compare_hold, RENDER, FRAMES - 1),
        }
        checks = {name: future.result() for name, future in futures.items()}
    checks["delivery_metadata"] = {"passed": metadata_pass, "actual": metadata,
        "expected_frames": FRAMES, "expected_duration_seconds": expected_duration}
    report = {"generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "render_path": str(RENDER), "passed": all(check["passed"] for check in checks.values()),
        "checks": checks,
        "ending_authorization": "User approved Nodal_6.mp4 exact final source frame at 10 seconds, held for two seconds; no PNG ending."}
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
