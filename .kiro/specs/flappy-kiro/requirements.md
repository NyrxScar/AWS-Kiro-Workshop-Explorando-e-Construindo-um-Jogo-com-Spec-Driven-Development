# Requirements Document

## Introduction

Flappy Kiro is a retro-style endless side-scroller browser game inspired by Flappy Bird, set in a hellish infernal cave environment. The player controls a ghost character (Ghosty) that must navigate through gaps between stalactites (hanging from above) and stalagmites (rising from below) scrolling from right to left. The game features pixel-art visuals with a warm infernal palette, sound effects, score tracking, and multiple game states (start screen, gameplay, game over). It runs entirely in the browser using HTML5 Canvas and JavaScript.

## Glossary

- **Game_Engine**: The core JavaScript module responsible for the game loop, rendering, physics, and state management
- **Ghosty**: The player-controlled ghost character sprite rendered from `assets/ghosty.png`
- **Obstacle**: A vertical obstacle that scrolls from right to left; obstacles appear in pairs — a stalactite (hanging from the top) and a stalagmite (rising from the bottom) — with a gap between them
- **Gap**: The vertical opening between a stalactite and a stalagmite through which Ghosty must pass
- **Canvas**: The HTML5 Canvas element used as the rendering surface for the game
- **Game_State**: The current mode of the game, one of: Start, Playing, or Game_Over
- **Score_Counter**: The component that tracks and displays the number of obstacles successfully passed
- **Collision_Detector**: The component that determines whether Ghosty has collided with an obstacle or boundary
- **Audio_Manager**: The component responsible for loading and playing sound effects

## Requirements

### Requirement 1: Game Canvas Initialization

**User Story:** As a player, I want the game to load in my browser with a properly sized canvas, so that I can play the game on any modern browser.

#### Acceptance Criteria

1. WHEN the page loads, THE Game_Engine SHALL create an HTML5 Canvas element with a fixed logical resolution of 400x600 pixels (2:3 aspect ratio)
2. WHEN the browser window is resized, THE Game_Engine SHALL scale the Canvas to fit within the viewport while preserving its 2:3 aspect ratio, ensuring the displayed Canvas is never larger than the viewport dimensions
3. IF the viewport is smaller than 400x600 pixels, THEN THE Game_Engine SHALL scale the Canvas down to fit within the available viewport while preserving the 2:3 aspect ratio
4. THE Game_Engine SHALL render and run without errors on Chrome, Firefox, Safari, and Edge in their latest two major versions

### Requirement 2: Game State Management

**User Story:** As a player, I want clear game states with transitions, so that I know when to start, when I'm playing, and when the game is over.

#### Acceptance Criteria

1. WHEN the game first loads, THE Game_Engine SHALL display the Start screen with the game title "Flappy Kiro" and the instruction text "Press Space or Click to Start"
2. WHILE the Game_State is Start, THE Game_Engine SHALL render Ghosty at the vertical center of the Canvas at its default horizontal position
3. WHILE the Game_State is Start, WHEN the player presses the spacebar or clicks the Canvas, THE Game_Engine SHALL transition to the Playing state within the same frame
4. WHILE the Game_State is Playing, WHEN a collision is detected, THE Game_Engine SHALL transition to the Game_Over state within the same frame
5. WHILE the Game_State is Game_Over, THE Game_Engine SHALL display the text "Game Over", the final score as a number, and the instruction "Press Space or Click to Restart"
6. WHILE the Game_State is Game_Over, WHEN the player presses the spacebar or clicks the Canvas, THE Game_Engine SHALL reset Ghosty to the vertical center at default horizontal position, remove all obstacles, reset the score to zero, and transition to the Playing state

### Requirement 3: Ghosty Physics and Controls

**User Story:** As a player, I want to control the ghost character with simple input, so that I can navigate through obstacles intuitively.

#### Acceptance Criteria

1. WHEN the Game_State transitions to Playing, THE Game_Engine SHALL position Ghosty at the vertical center of the Canvas and at a horizontal position equal to one-quarter of the Canvas width from the left edge
2. WHILE the Game_State is Playing, THE Game_Engine SHALL apply a constant downward gravitational acceleration of between 800 and 1200 pixels per second squared to Ghosty's vertical velocity on each frame
3. WHILE the Game_State is Playing, WHEN the player presses the spacebar or clicks the Canvas, THE Game_Engine SHALL set Ghosty's vertical velocity to an upward impulse of between -250 and -350 pixels per second (negative meaning upward)
4. WHILE the Game_State is Playing, THE Game_Engine SHALL cap Ghosty's downward velocity to a maximum of 400 to 600 pixels per second
5. WHILE the Game_State is Playing, THE Game_Engine SHALL render Ghosty using the sprite from `assets/ghosty.png`
6. WHILE the Game_State is Playing, THE Game_Engine SHALL rotate Ghosty's sprite between -30 degrees (when moving upward) and +90 degrees (when falling at maximum velocity), proportional to the current vertical velocity

### Requirement 4: Obstacle Generation and Scrolling

**User Story:** As a player, I want obstacles to appear at regular intervals with random gap positions, so that the game provides an engaging challenge.

#### Acceptance Criteria

1. WHILE the Game_State is Playing, THE Game_Engine SHALL generate a new obstacle pair each time the most recently generated obstacle has scrolled a horizontal distance of 200 to 250 pixels from the right edge of the Canvas
2. THE Game_Engine SHALL position the vertical center of the Gap of each obstacle pair at a random location no closer than 80 pixels from the top or bottom edge of the Canvas
3. THE Game_Engine SHALL maintain a consistent Gap height of 120 to 150 pixels across all obstacle pairs
4. WHILE the Game_State is Playing, THE Game_Engine SHALL scroll all obstacles from right to left at a constant speed between 100 and 200 pixels per second, adjusted by delta-time
5. WHEN an obstacle pair scrolls completely off the left edge of the Canvas, THE Game_Engine SHALL remove the obstacle pair from memory
6. WHEN the Game_State transitions to Playing, THE Game_Engine SHALL clear all existing obstacle pairs from the Canvas before generating new ones

### Requirement 5: Collision Detection

**User Story:** As a player, I want accurate collision detection, so that the game feels fair when I hit an obstacle or boundary.

#### Acceptance Criteria

1. WHILE the Game_State is Playing, THE Collision_Detector SHALL check for axis-aligned bounding box (AABB) overlap between Ghosty's bounding box and each obstacle's bounding box on every frame
2. WHEN any edge of Ghosty's bounding box intersects with or overlaps any edge of an obstacle's bounding box by at least 1 pixel, THE Collision_Detector SHALL signal a collision event
3. WHEN the bottom edge of Ghosty's bounding box reaches or exceeds the bottom boundary of the Canvas, THE Collision_Detector SHALL signal a collision event
4. WHEN the top edge of Ghosty's bounding box reaches or exceeds the top boundary of the Canvas, THE Collision_Detector SHALL signal a collision event
5. THE Collision_Detector SHALL define Ghosty's bounding box as a rectangle no larger than the dimensions of the rendered Ghosty sprite
6. THE Collision_Detector SHALL define each obstacle's bounding box as a rectangle matching the full rendered width and height of the obstacle

### Requirement 6: Score Tracking

**User Story:** As a player, I want to see my score increase as I pass obstacles, so that I can track my performance.

#### Acceptance Criteria

1. WHEN the Game_State transitions to Playing, THE Score_Counter SHALL reset the score to zero
2. WHEN Ghosty's horizontal center passes the left edge of an obstacle pair (the trailing edge in the scroll direction), THE Score_Counter SHALL increment the score by one
3. WHILE the Game_State is Playing, THE Score_Counter SHALL display the current score at the top center of the Canvas, vertically offset within the top 10% of the Canvas height, using a retro pixel-style font with a minimum size of 24 pixels
4. THE Score_Counter SHALL count each obstacle pair only once regardless of frame rate or position jitter by marking each obstacle pair as scored after incrementing
5. THE Score_Counter SHALL display the score as a whole number with no leading zeros and SHALL remain fully visible for scores up to at least 4 digits

### Requirement 7: Sound Effects

**User Story:** As a player, I want audio feedback for key actions, so that the game feels responsive and immersive.

#### Acceptance Criteria

1. WHEN the game loads, THE Audio_Manager SHALL preload the sound files `assets/jump.wav` and `assets/game_over.wav` before the Game_State transitions from Start to Playing
2. WHEN the player performs a jump action, THE Audio_Manager SHALL play the `assets/jump.wav` sound effect from the beginning, restarting playback if the sound is already playing from a previous jump
3. WHEN the Game_State transitions to Game_Over, THE Audio_Manager SHALL play the `assets/game_over.wav` sound effect
4. IF the browser blocks audio autoplay, THEN THE Audio_Manager SHALL resume the audio context on the first user interaction without dropping frames or delaying input response
5. IF a sound file fails to load, THEN THE Audio_Manager SHALL continue game operation without audio for the failed asset and without displaying an error to the player

### Requirement 8: Retro Visual Style

**User Story:** As a player, I want the game to have a retro pixel-art aesthetic, so that it feels like a classic arcade game.

#### Acceptance Criteria

1. THE Game_Engine SHALL set the Canvas rendering context property `imageSmoothingEnabled` to `false` to preserve pixel-art sharpness
2. THE Game_Engine SHALL render stalactites and stalagmites using solid fill colors from a warm infernal palette (dark reds, oranges, blacks, dark browns — no more than 8 distinct colors), with hard 1-pixel borders, jagged/pointed shapes, and no gradients or anti-aliasing
3. THE Game_Engine SHALL render the background using a dark infernal color scheme — a solid dark red/black or a vertical gradient from dark crimson at the top to deep black at the bottom, evoking a hellish cave environment
4. THE Game_Engine SHALL render all text elements (score, title, instructions) using a monospaced or pixel-style font loaded via CSS @font-face or a system monospace fallback
5. THE Game_Engine SHALL render the Ghosty sprite at its native resolution scaled to an integer multiple to avoid sub-pixel blurring

### Requirement 9: Game Loop and Performance

**User Story:** As a player, I want smooth and consistent gameplay, so that the game feels responsive and playable.

#### Acceptance Criteria

1. THE Game_Engine SHALL run the game loop using `requestAnimationFrame` for smooth rendering synchronized with the display refresh rate
2. THE Game_Engine SHALL calculate delta-time as the difference in milliseconds between the current and previous frame timestamps, and use this value to scale all movement and physics calculations
3. IF the delta-time exceeds 100 milliseconds (e.g., due to a tab switch), THEN THE Game_Engine SHALL cap the delta-time to 16.67 milliseconds to prevent physics jumps
4. THE Game_Engine SHALL maintain a frame rendering time of under 16.67 milliseconds per frame on hardware meeting minimum browser requirements
5. WHILE the Game_State is Start or Game_Over, THE Game_Engine SHALL continue rendering the current static screen at the display refresh rate without running physics or obstacle-generation logic
