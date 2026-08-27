import { CANVAS_CONFIG, PHYSICS, OBSTACLES } from './constants.js';
import { createStateManager } from './state-manager.js';
import { applyGravity, applyJump, clampVelocity, updatePosition, calculateRotation } from './physics.js';
import { createObstaclePair, updateObstacles, shouldSpawn, removeOffscreen, clearAll } from './obstacle-generator.js';
import { hasCollision } from './collision-detector.js';
import { checkScore, reset as resetScore } from './score-counter.js';
import { createAudioManager } from './audio-manager.js';
import { drawBackground, drawObstacles, drawGhosty, drawScore, drawStartScreen, drawGameOverScreen } from './renderer.js';
import { createInputHandler } from './input-handler.js';

/**
 * Cap delta-time to prevent physics jumps after tab switches.
 * @param {number} dt - Raw delta time in milliseconds
 * @returns {number} Capped delta time in milliseconds
 */
export function capDeltaTime(dt) {
  if (dt > 16.67) return 16.67;
  return dt;
}

/**
 * Initialize and start the game.
 * @param {HTMLCanvasElement} canvas - The game canvas element
 */
export function init(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const stateManager = createStateManager();
  const audioManager = createAudioManager();

  // Game state
  let ghosty = {
    x: CANVAS_CONFIG.LOGICAL_WIDTH * PHYSICS.GHOSTY_START_X_RATIO,
    y: CANVAS_CONFIG.LOGICAL_HEIGHT / 2,
    velocity: 0,
    width: 34,
    height: 34,
    rotation: 0
  };
  let obstacles = [];
  let score = 0;
  let lastTimestamp = 0;

  // Load Ghosty sprite
  const ghostySprite = new Image();
  ghostySprite.src = 'assets/ghosty.png';

  // Preload audio
  audioManager.preload();

  // Scale canvas to fit viewport
  function scaleCanvas() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / CANVAS_CONFIG.LOGICAL_WIDTH, vh / CANVAS_CONFIG.LOGICAL_HEIGHT);
    canvas.style.width = `${CANVAS_CONFIG.LOGICAL_WIDTH * scale}px`;
    canvas.style.height = `${CANVAS_CONFIG.LOGICAL_HEIGHT * scale}px`;
  }

  window.addEventListener('resize', scaleCanvas);
  scaleCanvas();

  // Input handling
  function handleInput() {
    audioManager.resumeContext();
    const state = stateManager.getState();

    if (state === 'start') {
      stateManager.transition('playing');
      resetGame();
    } else if (state === 'playing') {
      ghosty.velocity = applyJump();
      audioManager.playJump();
    } else if (state === 'game_over') {
      stateManager.transition('playing');
      resetGame();
    }
  }

  const inputHandler = createInputHandler(canvas, handleInput);

  function resetGame() {
    ghosty.x = CANVAS_CONFIG.LOGICAL_WIDTH * PHYSICS.GHOSTY_START_X_RATIO;
    ghosty.y = CANVAS_CONFIG.LOGICAL_HEIGHT / 2;
    ghosty.velocity = 0;
    ghosty.rotation = 0;
    obstacles = clearAll();
    score = resetScore();
  }

  // Game loop
  function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;

    const rawDt = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    const dt = capDeltaTime(rawDt) / 1000; // Convert to seconds

    const state = stateManager.getState();

    // Update logic (only in Playing state)
    if (state === 'playing') {
      // Physics
      ghosty.velocity = applyGravity(ghosty.velocity, dt);
      ghosty.velocity = clampVelocity(ghosty.velocity);
      ghosty.y = updatePosition(ghosty.y, ghosty.velocity, dt);
      ghosty.rotation = calculateRotation(ghosty.velocity);

      // Obstacles
      if (shouldSpawn(obstacles, CANVAS_CONFIG.LOGICAL_WIDTH)) {
        obstacles.push(createObstaclePair(CANVAS_CONFIG.LOGICAL_WIDTH, CANVAS_CONFIG.LOGICAL_HEIGHT));
      }
      obstacles = updateObstacles(obstacles, dt);
      obstacles = removeOffscreen(obstacles);

      // Collision
      const ghostyBox = {
        x: ghosty.x,
        y: ghosty.y,
        width: ghosty.width,
        height: ghosty.height
      };

      if (hasCollision(ghostyBox, obstacles, OBSTACLES.GAP_HEIGHT, CANVAS_CONFIG.LOGICAL_HEIGHT)) {
        stateManager.transition('game_over');
        audioManager.playGameOver();
      }

      // Scoring
      const ghostyCenterX = ghosty.x + ghosty.width / 2;
      const scoreResult = checkScore(ghostyCenterX, obstacles);
      score += scoreResult.newScore;
      obstacles = scoreResult.updatedObstacles;
    }

    // Render
    drawBackground(ctx, CANVAS_CONFIG.LOGICAL_WIDTH, CANVAS_CONFIG.LOGICAL_HEIGHT);

    if (state === 'start') {
      drawGhosty(ctx, ghostySprite, ghosty.x, ghosty.y, ghosty.width, ghosty.height, 0);
      drawStartScreen(ctx, CANVAS_CONFIG.LOGICAL_WIDTH, CANVAS_CONFIG.LOGICAL_HEIGHT);
    } else if (state === 'playing') {
      drawObstacles(ctx, obstacles, OBSTACLES.GAP_HEIGHT, CANVAS_CONFIG.LOGICAL_HEIGHT);
      drawGhosty(ctx, ghostySprite, ghosty.x, ghosty.y, ghosty.width, ghosty.height, ghosty.rotation);
      drawScore(ctx, score, CANVAS_CONFIG.LOGICAL_WIDTH);
    } else if (state === 'game_over') {
      drawObstacles(ctx, obstacles, OBSTACLES.GAP_HEIGHT, CANVAS_CONFIG.LOGICAL_HEIGHT);
      drawGhosty(ctx, ghostySprite, ghosty.x, ghosty.y, ghosty.width, ghosty.height, ghosty.rotation);
      drawGameOverScreen(ctx, score, CANVAS_CONFIG.LOGICAL_WIDTH, CANVAS_CONFIG.LOGICAL_HEIGHT);
    }

    requestAnimationFrame(gameLoop);
  }

  // Start the loop
  requestAnimationFrame(gameLoop);
}
