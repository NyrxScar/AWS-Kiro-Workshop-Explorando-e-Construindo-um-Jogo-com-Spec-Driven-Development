// Valid state transitions
const VALID_TRANSITIONS = {
  start: ['playing'],
  playing: ['game_over'],
  game_over: ['playing']
};

export function createStateManager() {
  let currentState = 'start';
  const listeners = [];

  function getState() {
    return currentState;
  }

  function transition(newState) {
    const validNext = VALID_TRANSITIONS[currentState];
    if (!validNext || !validNext.includes(newState)) {
      console.warn(`Invalid state transition: ${currentState} -> ${newState}`);
      return false;
    }
    const prevState = currentState;
    currentState = newState;
    listeners.forEach(cb => cb(prevState, newState));
    return true;
  }

  function onTransition(callback) {
    listeners.push(callback);
  }

  function reset() {
    currentState = 'start';
  }

  return { getState, transition, onTransition, reset };
}
