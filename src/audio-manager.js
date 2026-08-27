/**
 * AudioManager - Handles sound effect loading and playback with Web Audio API.
 * Gracefully handles autoplay policy and load failures (Req 7.4, 7.5).
 */

/**
 * Create an AudioManager instance for handling game sound effects.
 * Each instance maintains its own AudioContext and buffer state.
 * @returns {object} AudioManager API: { preload, playJump, playGameOver, resumeContext }
 */
export function createAudioManager() {
  let audioContext = null;
  let jumpBuffer = null;
  let gameOverBuffer = null;
  let jumpSource = null;
  let gameOverSource = null;
  let jumpLoaded = false;
  let gameOverLoaded = false;

  /**
   * Preload jump.wav and game_over.wav using Web Audio API.
   * If a fetch or decode fails, the game continues without audio for that asset.
   * (Req 7.1, 7.5)
   */
  async function preload() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      // AudioContext not available — game continues without audio
      console.warn('AudioContext unavailable:', e.message);
      return;
    }

    // Load jump.wav
    try {
      const jumpResponse = await fetch('assets/jump.wav');
      const jumpArrayBuffer = await jumpResponse.arrayBuffer();
      jumpBuffer = await audioContext.decodeAudioData(jumpArrayBuffer);
      jumpLoaded = true;
    } catch (e) {
      // Jump sound failed to load — game continues without it (Req 7.5)
      console.warn('Failed to load jump.wav:', e.message);
    }

    // Load game_over.wav
    try {
      const gameOverResponse = await fetch('assets/game_over.wav');
      const gameOverArrayBuffer = await gameOverResponse.arrayBuffer();
      gameOverBuffer = await audioContext.decodeAudioData(gameOverArrayBuffer);
      gameOverLoaded = true;
    } catch (e) {
      // Game over sound failed to load — game continues without it (Req 7.5)
      console.warn('Failed to load game_over.wav:', e.message);
    }
  }

  /**
   * Play jump sound effect from the beginning.
   * If already playing, stops the previous playback and restarts. (Req 7.2)
   */
  function playJump() {
    if (!audioContext || !jumpLoaded || !jumpBuffer) return;

    try {
      // Stop previous jump sound if still playing
      if (jumpSource) {
        try {
          jumpSource.stop();
        } catch (e) {
          // Source may have already ended — ignore
        }
      }

      jumpSource = audioContext.createBufferSource();
      jumpSource.buffer = jumpBuffer;
      jumpSource.connect(audioContext.destination);
      jumpSource.start(0);

      // Clear the reference when playback ends naturally
      jumpSource.onended = () => {
        jumpSource = null;
      };
    } catch (e) {
      // Silently fail — game continues without audio
    }
  }

  /**
   * Play game over sound effect. (Req 7.3)
   */
  function playGameOver() {
    if (!audioContext || !gameOverLoaded || !gameOverBuffer) return;

    try {
      // Stop previous game over sound if still playing
      if (gameOverSource) {
        try {
          gameOverSource.stop();
        } catch (e) {
          // Source may have already ended — ignore
        }
      }

      gameOverSource = audioContext.createBufferSource();
      gameOverSource.buffer = gameOverBuffer;
      gameOverSource.connect(audioContext.destination);
      gameOverSource.start(0);

      // Clear the reference when playback ends naturally
      gameOverSource.onended = () => {
        gameOverSource = null;
      };
    } catch (e) {
      // Silently fail — game continues without audio
    }
  }

  /**
   * Resume AudioContext if suspended due to browser autoplay policy.
   * Should be called on first user interaction (click/keypress). (Req 7.4)
   */
  function resumeContext() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {
        // Silently fail if resume is rejected
      });
    }
  }

  return { preload, playJump, playGameOver, resumeContext };
}
