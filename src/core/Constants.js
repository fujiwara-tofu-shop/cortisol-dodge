// Game dimensions
export const GAME = {
  WIDTH: 540,
  HEIGHT: 960,
  BG_COLOR: 0x1a1a2e,
};

// Player config
export const PLAYER = {
  START_X: GAME.WIDTH / 2,
  START_Y: GAME.HEIGHT - 120,
  SPEED: 400,
  DASH_SPEED: 800,
  DASH_DURATION: 150,
  DASH_COOLDOWN: 1000,
  INVULN_TIME: 500,
  SIZE: 32,
};

// Cortisol (stress meter)
export const CORTISOL = {
  MAX: 100,
  HIT_AMOUNT: 15,
  DECAY_RATE: 2, // per second when not hit
  SPIKE_THRESHOLD: 80, // visual warning threshold
};

// Stressor spawning
export const SPAWN = {
  INITIAL_RATE: 1500, // ms between spawns
  MIN_RATE: 400,
  RATE_DECREASE: 50, // decrease interval by this much every N seconds
  RATE_DECREASE_INTERVAL: 5000,
  SPEED_INITIAL: 200,
  SPEED_MAX: 500,
  SPEED_INCREASE: 10,
};

// Stressor types with their visual identifiers
export const STRESSOR_TYPES = [
  { key: 'urgent-email', label: '📧 URGENT', damage: 15, size: 40, weight: 10 },
  { key: 'we-need-to-talk', label: '💬 "we need to talk"', damage: 20, size: 48, weight: 8 },
  { key: 'zoom-call', label: '📹 Surprise Zoom', damage: 15, size: 44, weight: 9 },
  { key: 'rent-due', label: '💰 RENT DUE', damage: 25, size: 44, weight: 6 },
  { key: 'monday', label: '📅 MONDAY', damage: 18, size: 40, weight: 8 },
  { key: 'alarm', label: '⏰ 6:00 AM', damage: 12, size: 36, weight: 10 },
  { key: 'boss', label: '👔 Boss incoming', damage: 20, size: 48, weight: 7 },
  { key: 'per-my-last', label: '📧 "Per my last email"', damage: 18, size: 52, weight: 7 },
  { key: 'card-declined', label: '💳 DECLINED', damage: 25, size: 44, weight: 5 },
  { key: 'quick-sync', label: '📊 "Quick sync?"', damage: 15, size: 44, weight: 8 },
  { key: 'ex-text', label: '📱 Text from ex', damage: 22, size: 44, weight: 4 },
  { key: 'student-loans', label: '🎓 $50,000 debt', damage: 30, size: 48, weight: 3 },
  { key: 'news-alert', label: '🔴 Breaking News', damage: 15, size: 40, weight: 9 },
  { key: 'deadline', label: '⚠️ DUE TODAY', damage: 20, size: 44, weight: 7 },
];

// Colors
export const COLORS = {
  // UI
  CORTISOL_BAR_BG: 0x333333,
  CORTISOL_BAR_LOW: 0x4ade80,
  CORTISOL_BAR_MED: 0xfbbf24,
  CORTISOL_BAR_HIGH: 0xef4444,
  CORTISOL_BAR_CRITICAL: 0xff0000,
  
  // Player palette
  PLAYER_OUTLINE: 0x1a1a2e,
  PLAYER_SKIN: 0xf5d0c5,
  PLAYER_HAIR: 0x4a3728,
  PLAYER_SHIRT: 0x3b82f6,
  PLAYER_PANTS: 0x374151,
  PLAYER_SWEAT: 0x7dd3fc,
  
  // Stressor palette  
  STRESSOR_BG: 0x2d2d4a,
  STRESSOR_BORDER: 0xef4444,
  STRESSOR_TEXT: 0xffffff,
  
  // Effects
  HIT_FLASH: 0xff0000,
  DODGE_FLASH: 0x00ff00,
};

// UI
export const UI = {
  BAR_WIDTH: 300,
  BAR_HEIGHT: 24,
  BAR_Y: 60,
  SCORE_Y: 100,
  FONT_FAMILY: 'Arial, sans-serif',
};

// Audio (for later)
export const AUDIO = {
  HIT_VOLUME: 0.5,
  DODGE_VOLUME: 0.3,
  MUSIC_VOLUME: 0.4,
};
