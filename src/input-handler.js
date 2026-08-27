/**
 * InputHandler module.
 * Captures and normalizes user input (keyboard + mouse/touch) into a single action callback.
 */

// Module-level references for cleanup
let _canvas = null;
let _callback = null;
let _handleKeydown = null;
let _handleClick = null;
let _handleTouchStart = null;

/**
 * Handle keydown events — only respond to spacebar.
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    _callback();
  }
}

/**
 * Handle click events on the canvas.
 */
function onClick() {
  _callback();
}

/**
 * Handle touchstart events on the canvas (mobile support).
 * @param {TouchEvent} e
 */
function onTouchStart(e) {
  e.preventDefault();
  _callback();
}

/**
 * Register keydown (spacebar), click, and touchstart listeners.
 * Normalizes all input types to a single action callback.
 * @param {HTMLCanvasElement} canvas - The game canvas element
 * @param {Function} callback - Function to call on valid input (no arguments)
 */
export function init(canvas, callback) {
  // Clean up any previous listeners before re-initializing
  destroy();

  _canvas = canvas;
  _callback = callback;
  _handleKeydown = onKeydown;
  _handleClick = onClick;
  _handleTouchStart = onTouchStart;

  document.addEventListener('keydown', _handleKeydown);
  _canvas.addEventListener('click', _handleClick);
  _canvas.addEventListener('touchstart', _handleTouchStart, { passive: false });
}

/**
 * Remove all event listeners to avoid memory leaks.
 */
export function destroy() {
  if (_handleKeydown) {
    document.removeEventListener('keydown', _handleKeydown);
  }
  if (_canvas && _handleClick) {
    _canvas.removeEventListener('click', _handleClick);
  }
  if (_canvas && _handleTouchStart) {
    _canvas.removeEventListener('touchstart', _handleTouchStart);
  }

  _canvas = null;
  _callback = null;
  _handleKeydown = null;
  _handleClick = null;
  _handleTouchStart = null;
}

/**
 * Factory function that creates an input handler instance.
 * Provides the same functionality via a factory pattern for convenience.
 * @param {HTMLCanvasElement} canvas - The game canvas element
 * @param {Function} callback - Function to call on valid input
 * @returns {{ destroy: Function }} InputHandler API with destroy method
 */
export function createInputHandler(canvas, callback) {
  function handleKeydown(e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  }

  function handleClick() {
    callback();
  }

  function handleTouchStart(e) {
    e.preventDefault();
    callback();
  }

  document.addEventListener('keydown', handleKeydown);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

  function destroyInstance() {
    document.removeEventListener('keydown', handleKeydown);
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('touchstart', handleTouchStart);
  }

  return { destroy: destroyInstance };
}
