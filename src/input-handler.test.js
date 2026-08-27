import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { init, destroy, createInputHandler } from './input-handler.js';

describe('InputHandler', () => {
  let canvas;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  });

  afterEach(() => {
    destroy();
    document.body.removeChild(canvas);
  });

  describe('init/destroy module API', () => {
    it('calls callback on spacebar press (code: Space)', () => {
      const callback = vi.fn();
      init(canvas, callback);

      const event = new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith();
    });

    it('calls callback on spacebar press (key: " ")', () => {
      const callback = vi.fn();
      init(canvas, callback);

      const event = new KeyboardEvent('keydown', { code: '', key: ' ', bubbles: true });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not call callback on other keys', () => {
      const callback = vi.fn();
      init(canvas, callback);

      const event = new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', bubbles: true });
      document.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });

    it('calls callback on canvas click', () => {
      const callback = vi.fn();
      init(canvas, callback);

      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith();
    });

    it('calls callback on canvas touchstart', () => {
      const callback = vi.fn();
      init(canvas, callback);

      const touchEvent = new Event('touchstart', { bubbles: true, cancelable: true });
      canvas.dispatchEvent(touchEvent);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('prevents default on spacebar to avoid page scrolling', () => {
      const callback = vi.fn();
      init(canvas, callback);

      const event = new KeyboardEvent('keydown', {
        code: 'Space',
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('destroy removes all event listeners', () => {
      const callback = vi.fn();
      init(canvas, callback);
      destroy();

      // No events should trigger callback after destroy
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      canvas.dispatchEvent(new Event('touchstart', { bubbles: true }));

      expect(callback).not.toHaveBeenCalled();
    });

    it('calling destroy without init does not throw', () => {
      expect(() => destroy()).not.toThrow();
    });

    it('re-initializing cleans up previous listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      init(canvas, callback1);
      init(canvas, callback2);

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('createInputHandler factory API', () => {
    it('calls callback on spacebar and provides destroy method', () => {
      const callback = vi.fn();
      const handler = createInputHandler(canvas, callback);

      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
      expect(callback).toHaveBeenCalledTimes(1);

      handler.destroy();
      document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
      expect(callback).toHaveBeenCalledTimes(1); // No additional call after destroy
    });

    it('calls callback on click and touchstart', () => {
      const callback = vi.fn();
      const handler = createInputHandler(canvas, callback);

      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      canvas.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));

      expect(callback).toHaveBeenCalledTimes(2);

      handler.destroy();
    });
  });
});
