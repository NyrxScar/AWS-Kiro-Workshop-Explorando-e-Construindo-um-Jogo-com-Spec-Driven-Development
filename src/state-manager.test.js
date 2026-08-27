import { describe, it, expect, vi } from 'vitest';
import { createStateManager } from './state-manager.js';

describe('StateManager', () => {
  it('should start in "start" state', () => {
    const sm = createStateManager();
    expect(sm.getState()).toBe('start');
  });

  describe('valid transitions', () => {
    it('should transition from start to playing', () => {
      const sm = createStateManager();
      const result = sm.transition('playing');
      expect(result).toBe(true);
      expect(sm.getState()).toBe('playing');
    });

    it('should transition from playing to game_over', () => {
      const sm = createStateManager();
      sm.transition('playing');
      const result = sm.transition('game_over');
      expect(result).toBe(true);
      expect(sm.getState()).toBe('game_over');
    });

    it('should transition from game_over to playing', () => {
      const sm = createStateManager();
      sm.transition('playing');
      sm.transition('game_over');
      const result = sm.transition('playing');
      expect(result).toBe(true);
      expect(sm.getState()).toBe('playing');
    });
  });

  describe('invalid transitions', () => {
    it('should reject start to game_over', () => {
      const sm = createStateManager();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = sm.transition('game_over');
      expect(result).toBe(false);
      expect(sm.getState()).toBe('start');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should reject playing to start', () => {
      const sm = createStateManager();
      sm.transition('playing');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = sm.transition('start');
      expect(result).toBe(false);
      expect(sm.getState()).toBe('playing');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should reject game_over to start', () => {
      const sm = createStateManager();
      sm.transition('playing');
      sm.transition('game_over');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = sm.transition('start');
      expect(result).toBe(false);
      expect(sm.getState()).toBe('game_over');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should reject transition to same state', () => {
      const sm = createStateManager();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = sm.transition('start');
      expect(result).toBe(false);
      expect(sm.getState()).toBe('start');
      warnSpy.mockRestore();
    });
  });

  describe('onTransition callbacks', () => {
    it('should call registered callback with (oldState, newState)', () => {
      const sm = createStateManager();
      const callback = vi.fn();
      sm.onTransition(callback);
      sm.transition('playing');
      expect(callback).toHaveBeenCalledWith('start', 'playing');
    });

    it('should call multiple callbacks', () => {
      const sm = createStateManager();
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      sm.onTransition(cb1);
      sm.onTransition(cb2);
      sm.transition('playing');
      expect(cb1).toHaveBeenCalledWith('start', 'playing');
      expect(cb2).toHaveBeenCalledWith('start', 'playing');
    });

    it('should not call callbacks on invalid transitions', () => {
      const sm = createStateManager();
      const callback = vi.fn();
      sm.onTransition(callback);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      sm.transition('game_over');
      expect(callback).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('reset', () => {
    it('should reset state to start', () => {
      const sm = createStateManager();
      sm.transition('playing');
      sm.transition('game_over');
      sm.reset();
      expect(sm.getState()).toBe('start');
    });

    it('should not trigger callbacks on reset', () => {
      const sm = createStateManager();
      const callback = vi.fn();
      sm.onTransition(callback);
      sm.transition('playing');
      callback.mockClear();
      sm.reset();
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
