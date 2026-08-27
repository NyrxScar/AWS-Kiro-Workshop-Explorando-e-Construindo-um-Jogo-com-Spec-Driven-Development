import { OBSTACLES, CANVAS_CONFIG } from './constants.js';

/**
 * Create a new obstacle pair at the right edge of the canvas.
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @returns {object} Obstacle pair object
 */
export function createObstaclePair(canvasWidth, canvasHeight) {
  const minY = OBSTACLES.MIN_EDGE_MARGIN;
  const maxY = canvasHeight - OBSTACLES.MIN_EDGE_MARGIN;
  const gapCenterY = minY + Math.random() * (maxY - minY);

  return {
    x: canvasWidth,
    gapCenterY,
    width: OBSTACLES.WIDTH,
    scored: false
  };
}

/**
 * Update obstacle positions by scrolling left.
 * @param {Array} obstacles - Array of obstacle pairs
 * @param {number} dt - Delta time in seconds
 * @returns {Array} Updated obstacles with new positions
 */
export function updateObstacles(obstacles, dt) {
  return obstacles.map(obs => ({
    ...obs,
    x: obs.x - OBSTACLES.SCROLL_SPEED * dt
  }));
}

/**
 * Check if a new obstacle should be spawned.
 * @param {Array} obstacles - Current obstacles array
 * @param {number} canvasWidth - Canvas width
 * @returns {boolean} Whether to spawn a new obstacle
 */
export function shouldSpawn(obstacles, canvasWidth) {
  if (obstacles.length === 0) return true;
  const lastObstacle = obstacles[obstacles.length - 1];
  return (canvasWidth - lastObstacle.x) >= OBSTACLES.SPAWN_DISTANCE;
}

/**
 * Remove obstacles that have scrolled completely off screen.
 * @param {Array} obstacles - Array of obstacle pairs
 * @returns {Array} Filtered array without offscreen obstacles
 */
export function removeOffscreen(obstacles) {
  return obstacles.filter(obs => (obs.x + obs.width) > 0);
}

/**
 * Clear all obstacles.
 * @returns {Array} Empty array
 */
export function clearAll() {
  return [];
}
