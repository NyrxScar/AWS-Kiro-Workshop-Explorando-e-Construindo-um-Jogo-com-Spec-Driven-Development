import { VISUALS, CANVAS_CONFIG } from './constants.js';

/**
 * Draw the infernal cave background — vertical gradient from dark crimson to deep black.
 */
export function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, VISUALS.BG_COLOR_TOP);
  gradient.addColorStop(1, VISUALS.BG_COLOR_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw all obstacle pairs (stalactites from top, stalagmites from bottom).
 * Each obstacle has solid fill, 1px hard border, and jagged pointed tips facing the gap.
 */
export function drawObstacles(ctx, obstacles, gapHeight, canvasHeight) {
  const halfGap = gapHeight / 2;

  obstacles.forEach(obs => {
    const topHeight = obs.gapCenterY - halfGap;
    const bottomY = obs.gapCenterY + halfGap;
    const bottomHeight = canvasHeight - bottomY;

    // --- Stalactite (top obstacle) ---
    // Main body
    ctx.fillStyle = VISUALS.OBSTACLE_FILL;
    ctx.fillRect(obs.x, 0, obs.width, topHeight);
    ctx.strokeStyle = VISUALS.OBSTACLE_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(obs.x, 0, obs.width, topHeight);

    // Jagged pointed tip at the bottom (gap-facing end of stalactite)
    const jaggedHeight = Math.min(16, topHeight * 0.3);
    if (jaggedHeight > 2) {
      const numTeeth = 4;
      const toothWidth = obs.width / numTeeth;
      ctx.fillStyle = VISUALS.OBSTACLE_FILL;
      ctx.beginPath();
      for (let i = 0; i < numTeeth; i++) {
        const tx = obs.x + i * toothWidth;
        ctx.moveTo(tx, topHeight);
        ctx.lineTo(tx + toothWidth / 2, topHeight + jaggedHeight);
        ctx.lineTo(tx + toothWidth, topHeight);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = VISUALS.OBSTACLE_BORDER;
      ctx.stroke();
    }

    // --- Stalagmite (bottom obstacle) ---
    // Main body
    ctx.fillStyle = VISUALS.OBSTACLE_FILL;
    ctx.fillRect(obs.x, bottomY, obs.width, bottomHeight);
    ctx.strokeStyle = VISUALS.OBSTACLE_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(obs.x, bottomY, obs.width, bottomHeight);

    // Jagged pointed tip at the top (gap-facing end of stalagmite)
    const jaggedHeightBottom = Math.min(16, bottomHeight * 0.3);
    if (jaggedHeightBottom > 2) {
      const numTeeth = 4;
      const toothWidth = obs.width / numTeeth;
      ctx.fillStyle = VISUALS.OBSTACLE_FILL;
      ctx.beginPath();
      for (let i = 0; i < numTeeth; i++) {
        const tx = obs.x + i * toothWidth;
        ctx.moveTo(tx, bottomY);
        ctx.lineTo(tx + toothWidth / 2, bottomY - jaggedHeightBottom);
        ctx.lineTo(tx + toothWidth, bottomY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = VISUALS.OBSTACLE_BORDER;
      ctx.stroke();
    }
  });
}

/**
 * Draw Ghosty sprite with rotation.
 * imageSmoothingEnabled is set to false to preserve pixel-art sharpness.
 * The sprite is drawn centered at (x + width/2, y + height/2) and rotated
 * by the given angle in degrees.
 */
export function drawGhosty(ctx, sprite, x, y, width, height, rotation) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
  ctx.restore();
}

/**
 * Draw the current score — white retro font with dark stroke for readability,
 * centered horizontally in the top 10% of the canvas.
 */
export function drawScore(ctx, score, canvasWidth) {
  // Top 10% of canvas height. Canvas height = canvasWidth / ASPECT_RATIO
  const canvasHeight = canvasWidth / CANVAS_CONFIG.ASPECT_RATIO;
  const yPos = canvasHeight * 0.05;

  ctx.font = `${VISUALS.SCORE_FONT_SIZE}px ${VISUALS.FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Dark stroke/shadow for contrast
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText(String(score), canvasWidth / 2, yPos);

  // White fill
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(score), canvasWidth / 2, yPos);
}

/**
 * Draw the start screen — title "Flappy Kiro" and instruction text.
 */
export function drawStartScreen(ctx, canvasWidth, canvasHeight) {
  // Title
  ctx.font = `20px ${VISUALS.FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText('Flappy Kiro', canvasWidth / 2, canvasHeight / 3);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('Flappy Kiro', canvasWidth / 2, canvasHeight / 3);

  // Instruction
  ctx.font = `10px ${VISUALS.FONT_FAMILY}`;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeText('Press Space or Click to Start', canvasWidth / 2, canvasHeight / 2 + 80);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('Press Space or Click to Start', canvasWidth / 2, canvasHeight / 2 + 80);
}

/**
 * Draw the game over screen — "Game Over" text, final score, and restart instruction.
 */
export function drawGameOverScreen(ctx, score, canvasWidth, canvasHeight) {
  // Game Over text
  ctx.font = `20px ${VISUALS.FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText('Game Over', canvasWidth / 2, canvasHeight / 3);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('Game Over', canvasWidth / 2, canvasHeight / 3);

  // Score
  ctx.font = `${VISUALS.SCORE_FONT_SIZE}px ${VISUALS.FONT_FAMILY}`;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText(String(score), canvasWidth / 2, canvasHeight / 2);

  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(score), canvasWidth / 2, canvasHeight / 2);

  // Restart instruction
  ctx.font = `10px ${VISUALS.FONT_FAMILY}`;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeText('Press Space or Click to Restart', canvasWidth / 2, canvasHeight / 2 + 80);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('Press Space or Click to Restart', canvasWidth / 2, canvasHeight / 2 + 80);
}
