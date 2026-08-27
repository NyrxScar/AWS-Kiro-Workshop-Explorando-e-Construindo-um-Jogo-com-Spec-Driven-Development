import { describe, it, expect } from 'vitest';
import { checkObstacleCollision, checkBoundaryCollision, hasCollision } from './collision-detector.js';

describe('CollisionDetector', () => {
  describe('checkObstacleCollision', () => {
    const gapHeight = 135;

    it('returns false when Ghosty is within the gap', () => {
      const obstacle = { x: 200, gapCenterY: 300, width: 52 };
      // Ghosty centered in the gap
      const ghostyBox = { x: 210, y: 270, width: 30, height: 30 };
      expect(checkObstacleCollision(ghostyBox, obstacle, gapHeight)).toBe(false);
    });

    it('returns true when Ghosty overlaps top obstacle (stalactite)', () => {
      const obstacle = { x: 200, gapCenterY: 300, width: 52 };
      // Top obstacle extends from 0 to 300 - 67.5 = 232.5
      // Place Ghosty overlapping the bottom of the top obstacle
      const ghostyBox = { x: 210, y: 220, width: 30, height: 30 };
      expect(checkObstacleCollision(ghostyBox, obstacle, gapHeight)).toBe(true);
    });

    it('returns true when Ghosty overlaps bottom obstacle (stalagmite)', () => {
      const obstacle = { x: 200, gapCenterY: 300, width: 52 };
      // Bottom obstacle starts at 300 + 67.5 = 367.5
      // Place Ghosty overlapping the top of the bottom obstacle
      const ghostyBox = { x: 210, y: 360, width: 30, height: 30 };
      expect(checkObstacleCollision(ghostyBox, obstacle, gapHeight)).toBe(true);
    });

    it('returns false when Ghosty is horizontally past the obstacle', () => {
      const obstacle = { x: 200, gapCenterY: 300, width: 52 };
      // Ghosty is to the right of the obstacle (past x + width = 252)
      const ghostyBox = { x: 260, y: 100, width: 30, height: 30 };
      expect(checkObstacleCollision(ghostyBox, obstacle, gapHeight)).toBe(false);
    });

    it('returns false when Ghosty is horizontally before the obstacle', () => {
      const obstacle = { x: 200, gapCenterY: 300, width: 52 };
      // Ghosty is to the left of the obstacle
      const ghostyBox = { x: 150, y: 100, width: 30, height: 30 };
      expect(checkObstacleCollision(ghostyBox, obstacle, gapHeight)).toBe(false);
    });

    it('returns true when Ghosty just barely overlaps the obstacle by 1 pixel', () => {
      const obstacle = { x: 200, gapCenterY: 300, width: 52 };
      // Top obstacle bottom edge is at gapCenterY - gapHeight/2 = 300 - 67.5 = 232.5
      // Ghosty bottom edge at y + height must be > 0 (top of obstacle)
      // Ghosty top edge must be < 232.5
      // Ghosty right edge must be > 200, left edge must be < 252
      const ghostyBox = { x: 251, y: 0.5, width: 30, height: 30 };
      expect(checkObstacleCollision(ghostyBox, obstacle, gapHeight)).toBe(true);
    });
  });

  describe('checkBoundaryCollision', () => {
    const canvasHeight = 600;

    it('returns true when Ghosty touches the top boundary (y <= 0)', () => {
      const ghostyBox = { x: 100, y: 0, width: 30, height: 30 };
      expect(checkBoundaryCollision(ghostyBox, canvasHeight)).toBe(true);
    });

    it('returns true when Ghosty goes above the top boundary (y < 0)', () => {
      const ghostyBox = { x: 100, y: -5, width: 30, height: 30 };
      expect(checkBoundaryCollision(ghostyBox, canvasHeight)).toBe(true);
    });

    it('returns true when Ghosty touches the bottom boundary', () => {
      const ghostyBox = { x: 100, y: 570, width: 30, height: 30 };
      expect(checkBoundaryCollision(ghostyBox, canvasHeight)).toBe(true);
    });

    it('returns true when Ghosty goes below the bottom boundary', () => {
      const ghostyBox = { x: 100, y: 580, width: 30, height: 30 };
      expect(checkBoundaryCollision(ghostyBox, canvasHeight)).toBe(true);
    });

    it('returns false when Ghosty is within bounds', () => {
      const ghostyBox = { x: 100, y: 100, width: 30, height: 30 };
      expect(checkBoundaryCollision(ghostyBox, canvasHeight)).toBe(false);
    });

    it('returns false when Ghosty is just barely within bounds', () => {
      // y > 0 and y + height < canvasHeight
      const ghostyBox = { x: 100, y: 1, width: 30, height: 30 };
      expect(checkBoundaryCollision(ghostyBox, canvasHeight)).toBe(false);
    });
  });

  describe('hasCollision', () => {
    const gapHeight = 135;
    const canvasHeight = 600;

    it('returns true when Ghosty hits boundary (no obstacles)', () => {
      const ghostyBox = { x: 100, y: 0, width: 30, height: 30 };
      expect(hasCollision(ghostyBox, [], gapHeight, canvasHeight)).toBe(true);
    });

    it('returns true when Ghosty collides with an obstacle', () => {
      const ghostyBox = { x: 210, y: 100, width: 30, height: 30 };
      const obstacles = [{ x: 200, gapCenterY: 300, width: 52 }];
      expect(hasCollision(ghostyBox, obstacles, gapHeight, canvasHeight)).toBe(true);
    });

    it('returns false when no collisions occur', () => {
      const ghostyBox = { x: 100, y: 300, width: 30, height: 30 };
      const obstacles = [{ x: 200, gapCenterY: 300, width: 52 }];
      expect(hasCollision(ghostyBox, obstacles, gapHeight, canvasHeight)).toBe(false);
    });

    it('returns true if any one obstacle collides among multiple', () => {
      const ghostyBox = { x: 210, y: 100, width: 30, height: 30 };
      const obstacles = [
        { x: 50, gapCenterY: 300, width: 52 },  // no collision (Ghosty is past it horizontally)
        { x: 200, gapCenterY: 300, width: 52 }   // collision (Ghosty is in top obstacle zone)
      ];
      expect(hasCollision(ghostyBox, obstacles, gapHeight, canvasHeight)).toBe(true);
    });

    it('returns false with empty obstacle list and Ghosty within bounds', () => {
      const ghostyBox = { x: 100, y: 300, width: 30, height: 30 };
      expect(hasCollision(ghostyBox, [], gapHeight, canvasHeight)).toBe(false);
    });
  });
});
