import { OBSTACLES } from './constants.js';

/**
 * Check AABB collision between Ghosty and an obstacle pair.
 * @param {object} ghostyBox - { x, y, width, height }
 * @param {object} obstacle - { x, gapCenterY, width }
 * @param {number} gapHeight - Height of the gap between stalactite and stalagmite
 * @returns {boolean} True if collision detected
 */
export function checkObstacleCollision(ghostyBox, obstacle, gapHeight) {
  const halfGap = gapHeight / 2;

  // Top obstacle (stalactite): from y=0 to gapCenterY - halfGap
  const topObstacle = {
    x: obstacle.x,
    y: 0,
    width: obstacle.width,
    height: obstacle.gapCenterY - halfGap
  };

  // Bottom obstacle (stalagmite): from gapCenterY + halfGap to canvas bottom
  const bottomObstacle = {
    x: obstacle.x,
    y: obstacle.gapCenterY + halfGap,
    width: obstacle.width,
    height: 10000 // effectively infinite downward
  };

  return aabbOverlap(ghostyBox, topObstacle) || aabbOverlap(ghostyBox, bottomObstacle);
}

/**
 * Check if two axis-aligned bounding boxes overlap by at least 1 pixel.
 * @param {object} a - { x, y, width, height }
 * @param {object} b - { x, y, width, height }
 * @returns {boolean} True if overlapping
 */
function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Check if Ghosty has hit the canvas boundaries (top or bottom).
 * @param {object} ghostyBox - { x, y, width, height }
 * @param {number} canvasHeight - Canvas height in pixels
 * @returns {boolean} True if out of bounds
 */
export function checkBoundaryCollision(ghostyBox, canvasHeight) {
  return ghostyBox.y <= 0 || (ghostyBox.y + ghostyBox.height) >= canvasHeight;
}

/**
 * Check if any collision has occurred.
 * @param {object} ghostyBox - { x, y, width, height }
 * @param {Array} obstacles - Array of obstacle pairs
 * @param {number} gapHeight - Height of the gap
 * @param {number} canvasHeight - Canvas height
 * @returns {boolean} True if any collision detected
 */
export function hasCollision(ghostyBox, obstacles, gapHeight, canvasHeight) {
  if (checkBoundaryCollision(ghostyBox, canvasHeight)) return true;
  return obstacles.some(obs => checkObstacleCollision(ghostyBox, obs, gapHeight));
}
