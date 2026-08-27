# Implementation Plan: Flappy Kiro

## Overview

Build a retro-style Flappy Bird clone ("Flappy Kiro") running entirely in the browser using HTML5 Canvas and vanilla JavaScript. The implementation follows a modular architecture with independent subsystems for physics, obstacles, collision detection, scoring, audio, rendering, and state management — all orchestrated by a central game loop. Property-based tests use fast-check and unit tests use Vitest.

## Tasks

- [x] 1. Set up project structure and core configuration
  - [x] 1.1 Create project scaffolding and HTML entry point
    - Create `index.html` with Canvas element, link to `styles.css`, and script tags for all JS modules
    - Create `styles.css` with canvas centering, background color, and @font-face for pixel font
    - Create directory structure: `src/` for JS modules, `assets/` for sprites and sounds
    - Set up `package.json` with Vitest and fast-check as dev dependencies
    - Configure Vitest for jsdom environment in `vitest.config.js`
    - _Requirements: 1.1, 1.2, 1.3, 8.4_

  - [x] 1.2 Define constants and configuration module (`src/constants.js`)
    - Create constants file with CANVAS_CONFIG, PHYSICS, OBSTACLES, and VISUALS objects as defined in design
    - Export all constants for use by other modules
    - _Requirements: 1.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 8.2, 8.3_

- [x] 2. Implement physics module
  - [x] 2.1 Implement `src/physics.js` with pure physics functions
    - Implement `applyGravity(velocity, dt)` — adds gravity * dt to velocity
    - Implement `applyJump(velocity)` — returns JUMP_VELOCITY constant
    - Implement `clampVelocity(velocity)` — caps at MAX_FALL_SPEED
    - Implement `updatePosition(y, velocity, dt)` — returns y + velocity * dt
    - Implement `calculateRotation(velocity)` — maps velocity to [-30, +90] degrees proportionally
    - _Requirements: 3.2, 3.3, 3.4, 3.6_

  - [ ]* 2.2 Write property test: Gravity monotonically increases downward velocity
    - **Property 1: Gravity monotonically increases downward velocity**
    - **Validates: Requirements 3.2**
    - Use fast-check with arbitrary floats for velocity and positive floats for dt
    - Assert applyGravity result >= initial velocity (unless clamped)

  - [ ]* 2.3 Write property test: Jump sets fixed upward velocity
    - **Property 2: Jump sets fixed upward velocity**
    - **Validates: Requirements 3.3**
    - Use fast-check with arbitrary floats for current velocity
    - Assert applyJump always returns JUMP_VELOCITY

  - [ ]* 2.4 Write property test: Velocity clamping bounds downward speed
    - **Property 3: Velocity clamping bounds downward speed**
    - **Validates: Requirements 3.4**
    - Use fast-check with arbitrary floats for velocity
    - Assert clampVelocity result <= MAX_FALL_SPEED

  - [ ]* 2.5 Write property test: Rotation is proportional and bounded
    - **Property 4: Rotation is proportional and bounded**
    - **Validates: Requirements 3.6**
    - Use fast-check with floats in [JUMP_VELOCITY, MAX_FALL_SPEED]
    - Assert rotation is in [-30, +90] and monotonically non-decreasing with velocity

- [x] 3. Implement obstacle generator module
  - [x] 3.1 Implement `src/obstacle-generator.js`
    - Implement `createObstaclePair(canvasWidth, canvasHeight)` — returns obstacle pair with random gapCenterY respecting MIN_EDGE_MARGIN
    - Implement `updateObstacles(obstacles, dt)` — moves all obstacles left by SCROLL_SPEED * dt
    - Implement `shouldSpawn(obstacles, canvasWidth)` — checks if last obstacle has scrolled SPAWN_DISTANCE from right edge
    - Implement `removeOffscreen(obstacles)` — filters out obstacles whose right edge (x + width) <= 0
    - Implement `clearAll()` — returns empty array
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.2 Write property test: Obstacle gap center is within valid bounds
    - **Property 5: Obstacle gap center is within valid bounds**
    - **Validates: Requirements 4.2**
    - Use fast-check with positive integers for canvas dimensions
    - Assert gapCenterY in [MIN_EDGE_MARGIN, canvasHeight - MIN_EDGE_MARGIN]

  - [ ]* 3.3 Write property test: Obstacle removal conserves non-offscreen obstacles
    - **Property 10: Obstacle removal conserves non-offscreen obstacles**
    - **Validates: Requirements 4.5**
    - Use fast-check with lists of obstacles with arbitrary x positions
    - Assert returned list contains exactly those with x + width > 0

- [x] 4. Implement collision detection module
  - [x] 4.1 Implement `src/collision-detector.js`
    - Implement `checkObstacleCollision(ghostyBox, obstacle, gapHeight)` — AABB overlap check between Ghosty and top/bottom obstacle rects
    - Implement `checkBoundaryCollision(ghostyBox, canvasHeight)` — check if Ghosty touches top or bottom boundary
    - Implement `hasCollision(ghostyBox, obstacles, gapHeight, canvasHeight)` — combines obstacle and boundary checks
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.2 Write property test: AABB collision is symmetric and overlap-based
    - **Property 6: AABB collision is symmetric and overlap-based**
    - **Validates: Requirements 5.1, 5.2**
    - Use fast-check with arbitrary bounding boxes (positive width/height)
    - Assert collision returns true iff boxes overlap by at least 1 pixel on both axes

  - [ ]* 4.3 Write property test: Boundary collision detects out-of-bounds Ghosty
    - **Property 7: Boundary collision detects out-of-bounds Ghosty**
    - **Validates: Requirements 5.3, 5.4**
    - Use fast-check with arbitrary ghosty box and positive canvas height
    - Assert true iff ghosty.y <= 0 OR ghosty.y + ghosty.height >= canvasHeight

- [x] 5. Implement score counter module
  - [x] 5.1 Implement `src/score-counter.js`
    - Implement `checkScore(ghostyCenterX, obstacles)` — returns { newScore, updatedObstacles } marking passed pairs as scored
    - Implement `reset()` — returns 0
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.2 Write property test: Score increments exactly once per obstacle pair
    - **Property 8: Score increments exactly once per obstacle pair**
    - **Validates: Requirements 6.2, 6.4**
    - Use fast-check with lists of obstacles with various x positions and scored flags
    - Assert score equals count of distinct newly-passed pairs, each counted at most once

- [x] 6. Checkpoint - Core logic modules complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement state manager and input handler
  - [ ] 7.1 Implement `src/state-manager.js`
    - Implement `getState()`, `transition(newState)`, `onTransition(callback)`, `reset()`
    - Enforce valid transitions: start→playing, playing→game_over, game_over→playing
    - Ignore invalid transitions with console warning
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

  - [ ] 7.2 Implement `src/input-handler.js`
    - Implement `init(canvas, callback)` — register keydown (spacebar) and click/touch listeners
    - Implement `destroy()` — remove all event listeners
    - Normalize input to a single action callback regardless of input method
    - _Requirements: 2.3, 2.6, 3.3_

  - [ ]* 7.3 Write unit tests for state manager transitions
    - Test valid transitions succeed and return new state
    - Test invalid transitions are rejected and state unchanged
    - Test reset clears state back to defaults
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [ ] 8. Implement audio manager
  - [ ] 8.1 Implement `src/audio-manager.js`
    - Implement `preload()` — load jump.wav and game_over.wav using Web Audio API
    - Implement `playJump()` — play jump sound, restart if already playing
    - Implement `playGameOver()` — play game over sound
    - Implement `resumeContext()` — resume AudioContext on first user interaction
    - Handle load failures gracefully (game continues without audio)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implement renderer
  - [ ] 9.1 Implement `src/renderer.js`
    - Implement `drawBackground(ctx, width, height)` — dark infernal gradient background
    - Implement `drawObstacles(ctx, obstacles, gapHeight, canvasHeight)` — stalactites/stalagmites with warm infernal palette, jagged shapes, hard borders
    - Implement `drawGhosty(ctx, sprite, x, y, rotation)` — draw sprite with rotation, imageSmoothingEnabled=false
    - Implement `drawScore(ctx, score, canvasWidth)` — retro font at top center
    - Implement `drawStartScreen(ctx, canvasWidth, canvasHeight)` — title + instructions
    - Implement `drawGameOverScreen(ctx, score, canvasWidth, canvasHeight)` — game over text + score + restart instruction
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 6.3, 6.5, 2.1, 2.5_

- [ ] 10. Implement game loop and wire everything together
  - [ ] 10.1 Implement `src/game-loop.js` — main orchestrator
    - Implement `init(canvasElement)` — set up canvas, load ghosty.png sprite, initialize all subsystems
    - Implement `start()` — begin requestAnimationFrame loop
    - Implement frame update logic: calculate delta-time (capped at 16.67ms), delegate to subsystems based on current state
    - Wire input handler → state transitions and jump actions
    - Wire collision detection → state transition to game_over
    - Wire score counter → renderer
    - Wire audio manager → jump and game_over events
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 1.1, 2.3, 2.4, 2.6_

  - [ ]* 10.2 Write property test: Delta-time capping prevents physics jumps
    - **Property 9: Delta-time capping prevents physics jumps**
    - **Validates: Requirements 9.3**
    - Use fast-check with arbitrary positive floats for raw delta-time
    - Assert capped value <= 16.67ms; if raw <= 16.67 then capped === raw

  - [ ] 10.3 Implement canvas scaling and responsive resize
    - Add resize event listener to scale canvas preserving 2:3 aspect ratio
    - Ensure canvas never exceeds viewport dimensions
    - Scale down when viewport < 400x600
    - _Requirements: 1.2, 1.3_

- [ ] 11. Final checkpoint - Full integration complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All modules use ES module exports for testability with Vitest
- The game has no build step — modules are loaded via script tags in production, but tests run through Vitest with ES module support
- Assets (ghosty.png, jump.wav, game_over.wav) are assumed to already exist in the assets/ directory

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "3.3", "4.2", "4.3", "5.2"] },
    { "id": 3, "tasks": ["7.1", "7.2", "8.1", "9.1"] },
    { "id": 4, "tasks": ["7.3", "10.1"] },
    { "id": 5, "tasks": ["10.2", "10.3"] }
  ]
}
```
