// Canvas configuration
export const CANVAS_CONFIG = {
  LOGICAL_WIDTH: 400,
  LOGICAL_HEIGHT: 600,
  ASPECT_RATIO: 2 / 3
};

// Physics constants
export const PHYSICS = {
  GRAVITY: 1000,              // px/s²
  JUMP_VELOCITY: -300,        // px/s (upward)
  MAX_FALL_SPEED: 500,        // px/s (downward cap)
  GHOSTY_START_X_RATIO: 0.25  // 1/4 canvas width from left
};

// Obstacle constants
export const OBSTACLES = {
  SCROLL_SPEED: 150,      // px/s
  GAP_HEIGHT: 135,        // px
  SPAWN_DISTANCE: 220,    // px from right edge
  MIN_EDGE_MARGIN: 80,    // px from top/bottom
  WIDTH: 52               // px per obstacle column
};

// Visual constants
export const VISUALS = {
  BG_COLOR_TOP: '#2a0000',      // dark crimson
  BG_COLOR_BOTTOM: '#000000',   // deep black
  OBSTACLE_FILL: '#8b2500',     // dark red-orange
  OBSTACLE_BORDER: '#1a1a1a',   // near black
  SCORE_FONT_SIZE: 28,          // px
  FONT_FAMILY: '"Press Start 2P", monospace'
};
