/** Item id -> Flow sprite name (public/game-sprites). Items without one keep their icon. */
export const SPRITE_OF: Record<string, string> = {
  magnet: 'magnet', paperClip: 'paper-clip', woodSpoon: 'wood-block', woodBoard: 'wood-block', woodStick: 'wood-block',
  sun: 'sun', lamp: 'desk-lamp', clearGlass: 'glass-sheet', windowPane: 'glass-sheet',
  drum: 'drum', smallBell: 'bell', ear: 'owl-detective',
  grass: 'grass', grasshopper: 'grasshopper', frog: 'frog', snake: 'snake', eagle: 'eagle',
  battery: 'battery', bulb: 'light-bulb', switch: 'switch',
  // water stories
  seaWarm: 'sun', sunShines: 'sun', puddleWarm: 'sun', lakeWarm: 'sun',
  cloudForm: 'rain-cloud', rainFalls: 'rain-cloud', puddleFill: 'rain-cloud', vapourUp: 'rain-cloud', cloudsGather: 'rain-cloud', hillRain: 'rain-cloud',
  vapourRise: 'water-drop', turnsVapour: 'water-drop', riverFlows: 'water-drop', backToSea: 'water-drop', streamForms: 'water-drop', streamRiver: 'water-drop', riverLake: 'water-drop', puddleGone: 'water-drop',
};
