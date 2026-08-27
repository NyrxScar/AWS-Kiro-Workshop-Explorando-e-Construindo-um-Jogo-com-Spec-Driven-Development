import { describe, it, expect } from 'vitest';
import { checkScore, reset } from './score-counter.js';

describe('score-counter', () => {
  describe('checkScore', () => {
    it('increments score when ghostyCenterX passes trailing edge of an obstacle', () => {
      const obstacles = [
        { x: 50, width: 52, scored: false, gapCenterY: 300 }
      ];
      const ghostyCenterX = 103; // > 50 + 52
      const { newScore, updatedObstacles } = checkScore(ghostyCenterX, obstacles);
      expect(newScore).toBe(1);
      expect(updatedObstacles[0].scored).toBe(true);
    });

    it('does not increment score when ghostyCenterX has not passed trailing edge', () => {
      const obstacles = [
        { x: 50, width: 52, scored: false, gapCenterY: 300 }
      ];
      const ghostyCenterX = 100; // < 50 + 52 = 102
      const { newScore, updatedObstacles } = checkScore(ghostyCenterX, obstacles);
      expect(newScore).toBe(0);
      expect(updatedObstacles[0].scored).toBe(false);
    });

    it('does not score an already-scored obstacle', () => {
      const obstacles = [
        { x: 50, width: 52, scored: true, gapCenterY: 300 }
      ];
      const ghostyCenterX = 200;
      const { newScore, updatedObstacles } = checkScore(ghostyCenterX, obstacles);
      expect(newScore).toBe(0);
      expect(updatedObstacles[0].scored).toBe(true);
    });

    it('scores multiple obstacles in a single call', () => {
      const obstacles = [
        { x: 10, width: 52, scored: false, gapCenterY: 300 },
        { x: 80, width: 52, scored: false, gapCenterY: 250 }
      ];
      const ghostyCenterX = 200; // passes both (10+52=62, 80+52=132)
      const { newScore, updatedObstacles } = checkScore(ghostyCenterX, obstacles);
      expect(newScore).toBe(2);
      expect(updatedObstacles[0].scored).toBe(true);
      expect(updatedObstacles[1].scored).toBe(true);
    });

    it('returns empty array and zero score for empty obstacles', () => {
      const { newScore, updatedObstacles } = checkScore(100, []);
      expect(newScore).toBe(0);
      expect(updatedObstacles).toEqual([]);
    });

    it('does not mutate original obstacles array', () => {
      const obstacles = [
        { x: 50, width: 52, scored: false, gapCenterY: 300 }
      ];
      checkScore(200, obstacles);
      expect(obstacles[0].scored).toBe(false);
    });

    it('does not score when ghostyCenterX equals trailing edge exactly', () => {
      const obstacles = [
        { x: 50, width: 52, scored: false, gapCenterY: 300 }
      ];
      const ghostyCenterX = 102; // exactly at 50 + 52, not past
      const { newScore, updatedObstacles } = checkScore(ghostyCenterX, obstacles);
      expect(newScore).toBe(0);
      expect(updatedObstacles[0].scored).toBe(false);
    });
  });

  describe('reset', () => {
    it('returns 0', () => {
      expect(reset()).toBe(0);
    });
  });
});
