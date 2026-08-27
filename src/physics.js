import { PHYSICS } from './constants.js';

/**
 * Apply gravity to the current velocity.
 * @param {number} velocity - Current vertical velocity (px/s)
 * @param {number} dt - Delta time in seconds
 * @returns {number} New velocity after gravity applied
 */
export function applyGravity(velocity, dt) {
  return velocity + PHYSICS.GRAVITY * dt;
}

/**
 * Apply jump impulse - sets velocity to fixed upward value.
 * @returns {number} Jump velocity
 */
export function applyJump() {
  return PHYSICS.JUMP_VELOCITY;
}

/**
 * Clamp velocity to max fall speed.
 * @param {number} velocity - Current velocity
 * @returns {number} Clamped velocity
 */
export function clampVelocity(velocity) {
  if (velocity > PHYSICS.MAX_FALL_SPEED) {
    return PHYSICS.MAX_FALL_SPEED;
  }
  return velocity;
}

/**
 * Update vertical position based on velocity.
 * @param {number} y - Current y position
 * @param {number} velocity - Current velocity (px/s)
 * @param {number} dt - Delta time in seconds
 * @returns {number} New y position
 */
export function updatePosition(y, velocity, dt) {
  return y + velocity * dt;
}

/**
 * Calculate rotation angle based on velocity.
 * Maps velocity from [JUMP_VELOCITY, MAX_FALL_SPEED] to [-30, +90] degrees.
 * @param {number} velocity - Current velocity
 * @returns {number} Rotation in degrees
 */
export function calculateRotation(velocity) {
  const minVel = PHYSICS.JUMP_VELOCITY;
  const maxVel = PHYSICS.MAX_FALL_SPEED;
  const clampedVel = Math.max(minVel, Math.min(maxVel, velocity));

  // Linear interpolation from -30 to +90
  const t = (clampedVel - minVel) / (maxVel - minVel);
  return -30 + t * 120;
}
