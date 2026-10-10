import {Easing, interpolate} from 'remotion';

export const incomingDissolve = (frame: number, fps: number, seconds = 0.2) =>
  interpolate(frame, [0, seconds * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });

export const ambienceEnvelope = (
  frame: number,
  from: number,
  duration: number,
  fps: number,
  fadeInSeconds = 0.2,
  fadeOutSeconds = 0.2,
) => {
  const local = frame - from;
  const fadeIn = fadeInSeconds * fps;
  const fadeOut = fadeOutSeconds * fps;
  const rise = Math.sin(Math.max(0, Math.min(1, local / fadeIn)) * Math.PI / 2);
  const fall = Math.sin(Math.max(0, Math.min(1, (duration - local) / fadeOut)) * Math.PI / 2);
  return rise * fall;
};
