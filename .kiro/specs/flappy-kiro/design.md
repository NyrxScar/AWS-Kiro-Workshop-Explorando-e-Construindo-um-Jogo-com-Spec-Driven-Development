# Design Document: Flappy Kiro

## Overview

Flappy Kiro is a retro-style endless side-scroller browser game built entirely with HTML5 Canvas and vanilla JavaScript. The player controls a ghost character (Ghosty) navigating through gaps between stalactites and stalagmites in a hellish infernal cave. The architecture prioritizes simplicity, separation of concerns, and testability of core logic modules (physics, collision, scoring) while keeping the rendering and I/O layers thin.

The game runs as a single-page application with no build tools or external dependencies at runtime. The game loop is driven by `requestAnimationFrame`, and all physics/movement calculations are delta-time scaled for consistent behavior across refresh rates.

## Architecture

The architecture follows a modular pattern with a central Game Engine orchestrating independent subsystems. Each subsystem handles a single concern and exposes a pure functional interface where possible.

```mermaid
graph TD
    subgraph Browser
        HTML[index.html]
        CSS[styles.css]
    end

    subgraph Game Engine
        GL[GameLoop]
        SM[StateManager]
    end

    subgraph Subsystems
        PH[Physics]
        OG[ObstacleGenerator]
        CD[CollisionDetector]
        SC[ScoreCounter]
        AM[AudioManager]
        RN[Renderer]
    end

    HTML --> GL
    GL --> SM
    GL --> PH
    GL --> OG
    GL --> CD
    GL --> SC
    GL --> AM
    GL --> RN

    SM -->|state| GL
    PH -->|position/velocity| GL
    OG -->|obstacles[]| GL
    CD -->|collision event| SM
    SC -->|score| RN
```

**Data Flow per Frame (Playing state):**
1. `GameLoop` calculates delta-time (capped at 16.67ms)
2. `Physics` updates Ghosty's velocity and position based on gravity + input
3. `ObstacleGenerator` spawns/removes obstacles, updates positions
4. `CollisionDetector` checks Ghosty vs obstacles and boundaries
5. `ScoreCounter` checks if Ghosty passed any obstacle pairs
6. `Renderer` draws the current frame (background, obstacles, Ghosty, score)
7. If collision → `StateManager` transitions to Game_Over

## Components and Interfaces

### 1. GameLoop (`game-loop.js`)

The central orchestrator. Owns the `requestAnimationFrame` cycle and delegates to subsystems.

```javascript
// Public API
init(canvasElement)        // Initialize game, set up canvas, load assets
start()                    // Begin the rAF loop
```

**Responsibilities:**
- Calculate and cap delta-time
- Call subsystem update/render methods in correct order per state
- Handle input events (keydown, click/touch) and route to appropriate handler

### 2. StateManager (`state-manager.js`)

Manages game state transitions with a simple finite state machine.

```javascript
// States: 'start' | 'playing' | 'game_over'
getState()                 // Returns current state
transition(newState)       // Validates and executes state transition
onTransition(callback)     // Register transition listener
reset()                    // Reset all game data for a new round
```

**Valid Transitions:**
- `start` → `playing`
- `playing` → `game_over`
- `game_over` → `playing`

### 3. Physics (`physics.js`)

Pure module for Ghosty's movement calculations. No side effects.

```javascript
// Constants
GRAVITY          // 1000 px/s² (within 800–1200 range)
JUMP_VELOCITY    // -300 px/s (within -250 to -350 range)
MAX_FALL_SPEED   // 500 px/s (within 400–600 range)

// Pure functions
applyGravity(velocity, dt)           // Returns new velocity after gravity
applyJump(velocity)                  // Returns JUMP_VELOCITY (upward impulse)
clampVelocity(velocity)              // Caps downward velocity to MAX_FALL_SPEED
updatePosition(y, velocity, dt)      // Returns new y position
calculateRotation(velocity)          // Returns rotation angle in degrees (-30 to +90)
```

### 4. ObstacleGenerator (`obstacle-generator.js`)

Manages obstacle lifecycle: creation, scrolling, and removal.

```javascript
// Constants
SCROLL_SPEED     // 150 px/s (within 100–200 range)
GAP_HEIGHT       // 135 px (within 120–150 range)
SPAWN_DISTANCE   // 220 px (within 200–250 range)
MIN_EDGE_MARGIN  // 80 px from top/bottom edge

// Functions
createObstaclePair(canvasWidth, canvasHeight)  // Returns new obstacle pair
updateObstacles(obstacles, dt)                  // Returns updated obstacle positions
shouldSpawn(obstacles, canvasWidth)             // Returns boolean
removeOffscreen(obstacles)                      // Returns filtered array
clearAll()                                      // Returns empty array
```

**Obstacle Pair Structure:**
```javascript
{
  x: number,              // horizontal position (right edge initially at canvas width)
  gapCenterY: number,     // vertical center of gap (random, min 80px from edges)
  width: number,          // obstacle width (e.g., 52px)
  scored: boolean         // whether Ghosty has passed this pair
}
```

### 5. CollisionDetector (`collision-detector.js`)

Pure module for AABB collision checks.

```javascript
// Pure functions
checkObstacleCollision(ghostyBox, obstacle, gapHeight)  // Returns boolean
checkBoundaryCollision(ghostyBox, canvasHeight)          // Returns boolean
hasCollision(ghostyBox, obstacles, gapHeight, canvasHeight) // Returns boolean
```

**BoundingBox Structure:**
```javascript
{ x: number, y: number, width: number, height: number }
```

### 6. ScoreCounter (`score-counter.js`)

Tracks scoring logic — increments when Ghosty's center passes an obstacle's trailing edge.

```javascript
// Pure functions
checkScore(ghostyCenterX, obstacles)  // Returns { newScore, updatedObstacles }
reset()                               // Returns 0
```

### 7. AudioManager (`audio-manager.js`)

Handles sound effect loading and playback with autoplay policy handling.

```javascript
preload()                 // Load jump.wav and game_over.wav
playJump()                // Play jump sound (restart if already playing)
playGameOver()            // Play game over sound
resumeContext()           // Resume AudioContext after user interaction
```

### 8. Renderer (`renderer.js`)

Draws all visual elements to the canvas. Thin layer — no game logic.

```javascript
drawBackground(ctx, width, height)
drawObstacles(ctx, obstacles, gapHeight, canvasHeight)
drawGhosty(ctx, sprite, x, y, rotation)
drawScore(ctx, score, canvasWidth)
drawStartScreen(ctx, canvasWidth, canvasHeight)
drawGameOverScreen(ctx, score, canvasWidth, canvasHeight)
```

### 9. InputHandler (`input-handler.js`)

Captures and normalizes user input (keyboard + mouse/touch).

```javascript
init(canvas, callback)    // Register event listeners
destroy()                 // Remove event listeners
```

## Data Models

### Game State

```javascript
const gameState = {
  state: 'start' | 'playing' | 'game_over',
  ghosty: {
    x: number,            // horizontal position (fixed at canvasWidth / 4)
    y: number,            // vertical position (updated each frame)
    velocity: number,     // vertical velocity (px/s, negative = up)
    width: number,        // sprite width
    height: number,       // sprite height
    rotation: number      // rotation in degrees (-30 to +90)
  },
  obstacles: [
    {
      x: number,          // horizontal position of obstacle pair
      gapCenterY: number, // vertical center of the gap
      width: number,      // width of each obstacle column
      scored: boolean     // whether this pair has been scored
    }
  ],
  score: number,          // current score (integer >= 0)
  lastTimestamp: number   // previous frame timestamp for delta-time
};
```

### Canvas Configuration

```javascript
const CANVAS_CONFIG = {
  LOGICAL_WIDTH: 400,
  LOGICAL_HEIGHT: 600,
  ASPECT_RATIO: 2 / 3
};
```

### Physics Constants

```javascript
const PHYSICS = {
  GRAVITY: 1000,          // px/s²
  JUMP_VELOCITY: -300,    // px/s (upward)
  MAX_FALL_SPEED: 500,    // px/s (downward cap)
  GHOSTY_START_X_RATIO: 0.25  // 1/4 canvas width from left
};
```

### Obstacle Constants

```javascript
const OBSTACLES = {
  SCROLL_SPEED: 150,      // px/s
  GAP_HEIGHT: 135,        // px
  SPAWN_DISTANCE: 220,    // px from right edge
  MIN_EDGE_MARGIN: 80,    // px from top/bottom
  WIDTH: 52               // px per obstacle column
};
```

### Rendering Constants

```javascript
const VISUALS = {
  BG_COLOR_TOP: '#2a0000',      // dark crimson
  BG_COLOR_BOTTOM: '#000000',   // deep black
  OBSTACLE_FILL: '#8b2500',     // dark red-orange
  OBSTACLE_BORDER: '#1a1a1a',   // near black
  SCORE_FONT_SIZE: 28,          // px
  FONT_FAMILY: '"Press Start 2P", monospace'
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Gravity monotonically increases downward velocity

*For any* initial velocity and positive delta-time, applying gravity SHALL produce a velocity that is greater than or equal to the initial velocity (more positive / more downward), unless clamped at max fall speed.

**Validates: Requirements 3.2**

### Property 2: Jump sets fixed upward velocity

*For any* current velocity (whether moving up or down), applying the jump impulse SHALL produce a velocity equal to JUMP_VELOCITY (a fixed negative value), regardless of the prior velocity.

**Validates: Requirements 3.3**

### Property 3: Velocity clamping bounds downward speed

*For any* velocity value, clamping SHALL produce a result that is less than or equal to MAX_FALL_SPEED. If the input velocity is less than or equal to MAX_FALL_SPEED, clamping SHALL return the input unchanged.

**Validates: Requirements 3.4**

### Property 4: Rotation is proportional and bounded

*For any* velocity in the range [JUMP_VELOCITY, MAX_FALL_SPEED], the calculated rotation SHALL be in the range [-30, +90] degrees, and SHALL be monotonically non-decreasing with respect to velocity (higher downward velocity → more positive rotation).

**Validates: Requirements 3.6**

### Property 5: Obstacle gap center is within valid bounds

*For any* generated obstacle pair on a canvas of height H, the gap center Y SHALL be in the range [MIN_EDGE_MARGIN, H - MIN_EDGE_MARGIN].

**Validates: Requirements 4.2**

### Property 6: AABB collision is symmetric and overlap-based

*For any* two bounding boxes A and B, checkObstacleCollision(A, B) returns true if and only if A and B overlap by at least 1 pixel on both axes. If A does not overlap B, it SHALL return false.

**Validates: Requirements 5.1, 5.2**

### Property 7: Boundary collision detects out-of-bounds Ghosty

*For any* Ghosty bounding box and canvas height, checkBoundaryCollision SHALL return true if and only if ghosty.y <= 0 OR ghosty.y + ghosty.height >= canvasHeight.

**Validates: Requirements 5.3, 5.4**

### Property 8: Score increments exactly once per obstacle pair

*For any* sequence of frames where Ghosty's center passes multiple obstacle pairs, the score SHALL equal the count of distinct obstacle pairs whose trailing edge Ghosty has crossed. Each pair is counted at most once regardless of how many frames Ghosty remains past it.

**Validates: Requirements 6.2, 6.4**

### Property 9: Delta-time capping prevents physics jumps

*For any* raw delta-time value, the effective delta-time used in physics calculations SHALL be at most 16.67ms. If the raw value is <= 16.67ms, it SHALL be used as-is.

**Validates: Requirements 9.3**

### Property 10: Obstacle removal conserves non-offscreen obstacles

*For any* list of obstacles, removing offscreen obstacles SHALL return a list containing exactly those obstacles whose right edge (x + width) is greater than 0. No visible obstacle is lost, and no offscreen obstacle is retained.

**Validates: Requirements 4.5**

## Error Handling

| Scenario | Handling Strategy |
|----------|-------------------|
| Sound file fails to load | `AudioManager` catches the error, sets a flag for the failed asset, game continues silently (Req 7.5) |
| Browser blocks autoplay | `AudioManager` creates AudioContext in suspended state, resumes on first user interaction (Req 7.4) |
| Large delta-time (tab switch) | Cap to 16.67ms to prevent tunneling/teleportation (Req 9.3) |
| Canvas context unavailable | Display a fallback error message in the DOM |
| Asset (ghosty.png) fails to load | Display a placeholder colored rectangle; game remains playable |
| Invalid state transition | `StateManager` ignores invalid transitions, logs warning to console |

## Testing Strategy

### Unit Tests (Example-Based)

Unit tests cover specific scenarios and edge cases using a lightweight test runner (e.g., Vitest or Jest with jsdom):

- **State transitions**: Verify valid transitions succeed and invalid ones are rejected
- **Renderer output**: Verify draw calls are made with correct parameters (mock canvas context)
- **AudioManager**: Verify preload, playback restart behavior, and error resilience
- **Input handling**: Verify spacebar and click events trigger the correct callbacks
- **Canvas scaling**: Verify aspect ratio preservation at various viewport sizes

### Property-Based Tests

Property-based tests verify universal invariants using **fast-check** (JavaScript PBT library). Minimum 100 iterations per property.

| Property | Module Under Test | Generator Strategy |
|----------|-------------------|--------------------|
| Property 1: Gravity increases velocity | `physics.applyGravity` | Arbitrary floats for velocity, positive floats for dt |
| Property 2: Jump sets fixed velocity | `physics.applyJump` | Arbitrary floats for current velocity |
| Property 3: Velocity clamping | `physics.clampVelocity` | Arbitrary floats for velocity |
| Property 4: Rotation bounds | `physics.calculateRotation` | Floats in [JUMP_VELOCITY, MAX_FALL_SPEED] |
| Property 5: Gap center bounds | `obstacleGenerator.createObstaclePair` | Positive integers for canvas dimensions |
| Property 6: AABB collision | `collisionDetector.checkObstacleCollision` | Arbitrary bounding boxes (x, y, w, h > 0) |
| Property 7: Boundary collision | `collisionDetector.checkBoundaryCollision` | Arbitrary ghosty box + positive canvas height |
| Property 8: Score exactness | `scoreCounter.checkScore` | Lists of obstacles with various x positions and scored flags |
| Property 9: Delta-time capping | `gameLoop.capDeltaTime` | Arbitrary positive floats |
| Property 10: Obstacle removal | `obstacleGenerator.removeOffscreen` | Lists of obstacles with arbitrary x positions |

**Configuration:**
- Library: [fast-check](https://github.com/dubzzz/fast-check)
- Iterations: 100 minimum per property
- Tag format: `Feature: flappy-kiro, Property {N}: {description}`

### Integration Tests

- Full game loop simulation: start → play → collision → game over → restart cycle
- Verify score resets on restart, obstacles cleared, Ghosty repositioned
- Verify no memory leaks (obstacle list bounded after extended play)

### Manual Testing

- Visual regression: confirm pixel-art rendering, no smoothing artifacts
- Cross-browser: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Responsive scaling at various viewport sizes
- Audio playback and autoplay policy handling
