/**
 * Check if Ghosty has passed any obstacle pairs and update score.
 * @param {number} ghostyCenterX - Ghosty's horizontal center position
 * @param {Array} obstacles - Array of obstacle pairs
 * @returns {object} { newScore: number of newly scored, updatedObstacles: updated array }
 */
export function checkScore(ghostyCenterX, obstacles) {
  let newScore = 0;
  const updatedObstacles = obstacles.map(obs => {
    if (!obs.scored && ghostyCenterX > obs.x + obs.width) {
      newScore++;
      return { ...obs, scored: true };
    }
    return obs;
  });
  return { newScore, updatedObstacles };
}

/**
 * Reset score to zero.
 * @returns {number} 0
 */
export function reset() {
  return 0;
}
