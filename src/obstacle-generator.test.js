import { describe, it, expect } from 'vitest';
import {
  createObstaclePair,
  updateObstacles,
  shouldSpawn,
  removeOffscreen,
  clearAll
} from './obstacle-generator.js';
import { OBSTACLES } from './constants.js';

describe('obstacle-generator', () => {
  describe('createObstaclePair', () => {
    it('returns an obstacle pair at the right edge of the canvas', () => {
      const pair = createObstaclePair(400, 600);
      expect(pair.x).toBe(400);
      expect(pair.width).toBe(OBSTACLES.WIDTH);
      expect(pair.scored).toBe(false);
    });

    it('positions gapCenterY within MIN_EDGE_MARGIN bounds', () => {
      for (let i = 0; i < 50; i++) {
        const pair = createObstaclePair(400, 600);
        expect(pair.gapCenterY).toBeGreaterThanOrEqual(OBSTACLES.MIN_EDGE_MARGIN);
        expect(pair.gapCenterY).toBeLessThanOrEqual(600 - OBSTACLES.MIN_EDGE_MARGIN);
      }
    });
  });

  describe('updateObstacles', () => {
    it('moves obstacles left by SCROLL_SPEED * dt', () => {
      const obstacles = [{ x: 300, gapCenterY: 300, width: 52, scored: false }];
      const dt = 0.5;
      const updated = updateObstacles(obstacles, dt);
      expect(updated[0].x).toBe(300 - OBSTACLES.SCROLL_SPEED * dt);
    });

    it('does not mutate original obstacles', () => {
      const obstacles = [{ x: 300, gapCenterY: 300, width: 52, scored: false }];
      updateObstacles(obstacles, 1);
      expect(obstacles[0].x).toBe(300);
    });
  });

  describe('shouldSpawn', () => {
    it('returns true when obstacles array is empty', () => {
      expect(shouldSpawn([], 400)).toBe(true);
    });

    it('returns true when last obstacle has scrolled SPAWN_DISTANCE from right edge', () => {
      const obstacles = [{ x: 400 - OBSTACLES.SPAWN_DISTANCE, gapCenterY: 300, width: 52, scored: false }];
      expect(shouldSpawn(obstacles, 400)).toBe(true);
    });

    it('returns false when last obstacle has not scrolled far enough', () => {
      const obstacles = [{ x: 400 - OBSTACLES.SPAWN_DISTANCE + 1, gapCenterY: 300, width: 52, scored: false }];
      expect(shouldSpawn(obstacles, 400)).toBe(false);
    });
  });

  describe('removeOffscreen', () => {
    it('removes obstacles whose right edge is at or past the left boundary', () => {
      const obstacles = [
        { x: -52, gapCenterY: 300, width: 52, scored: true },  // right edge = 0 -> remove
        { x: 100, gapCenterY: 300, width: 52, scored: false }  // visible -> keep
      ];
      const result = removeOffscreen(obstacles);
      expect(result).toHaveLength(1);
      expect(result[0].x).toBe(100);
    });

    it('keeps obstacles whose right edge is still on screen', () => {
      const obstacles = [
        { x: -51, gapCenterY: 300, width: 52, scored: true }  // right edge = 1 -> keep
      ];
      const result = removeOffscreen(obstacles);
      expect(result).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('returns an empty array', () => {
      expect(clearAll()).toEqual([]);
    });
  });
});
