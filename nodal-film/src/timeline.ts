// Source times use the composition's 30 fps timebase; source videos play at 1x.
// Native source metadata is recorded separately in asset-manifest.json.
export const timeline = {
  awakeningGenesis: {from: 0, duration: 270, sourceStart: 0},
  gateway: {from: 264, duration: 285, sourceStart: 0.5},
  descent: {from: 522, duration: 300, sourceStart: 0},
  earthbound: {from: 789, duration: 285, sourceStart: 0},
  signal: {from: 1044, duration: 301, sourceStart: 0},
  logo: {from: 1345, duration: 60, sourceFrameSeconds: 10},
} as const;

export const totalFrames = timeline.logo.from + timeline.logo.duration;
export const audioFiles = {
  awakeningGenesis: 'audio/Nodal_1_ambience.wav',
  gateway: 'audio/Nodal_2_ambience.wav',
  descent: 'audio/Nodal_4_ambience.wav',
  earthbound: 'audio/Nodal_5_ambience.wav',
  signal: 'audio/Nodal_6_ambience.wav',
} as const;
