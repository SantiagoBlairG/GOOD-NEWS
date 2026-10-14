import { useCallback, useEffect, useRef, type PointerEvent } from 'react';
import { animate, type MotionValue } from 'motion/react';

type Sample = { x: number; time: number };
type Gesture = {
  id: number;
  startX: number;
  startY: number;
  origin: number;
  width: number;
  element: HTMLDivElement;
  horizontal: boolean;
  samples: Sample[];
};

export function useCardSwipe({
  x,
  reduced,
  isLocked,
  onCommit,
}: {
  x: MotionValue<number>;
  reduced: boolean;
  isLocked: () => boolean;
  onCommit: (kind: 'save' | 'skip') => void;
}) {
  const gesture = useRef<Gesture | null>(null);
  const moved = useRef(false);
  const spring = useRef<{ stop: () => void } | null>(null);
  const release = useCallback(() => {
    const current = gesture.current;
    gesture.current = null;
    if (current?.element.hasPointerCapture(current.id))
      current.element.releasePointerCapture(current.id);
    return current;
  }, []);
  const reset = useCallback(() => {
    spring.current?.stop();
    if (reduced) x.set(0);
    else
      spring.current = animate(x, 0, {
        type: 'spring',
        stiffness: 420,
        damping: 36,
        restDelta: 0.5,
        restSpeed: 5,
      });
  }, [x, reduced]);
  const cancel = useCallback(() => {
    if (!gesture.current) return;
    moved.current = true;
    release();
    reset();
  }, [release, reset]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener('blur', cancel);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', visibility);
      release();
      spring.current?.stop();
    };
  }, [cancel, release]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) {
      cancel();
      return;
    }
    if (isLocked() || event.button !== 0 || gesture.current) return;
    spring.current?.stop();
    moved.current = false;
    gesture.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: x.get(),
      width: event.currentTarget.offsetWidth,
      element: event.currentTarget,
      horizontal: false,
      samples: [{ x: event.clientX, time: event.timeStamp }],
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId || isLocked()) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (Math.hypot(dx, dy) > 8) moved.current = true;
    if (!current.horizontal && Math.abs(dx) > 8 && Math.abs(dx) >= Math.abs(dy) * 0.75)
      current.horizontal = true;
    if (!current.horizontal) return;
    if (event.cancelable) event.preventDefault();
    current.samples = current.samples.filter((sample) => event.timeStamp - sample.time <= 100);
    current.samples.push({ x: event.clientX, time: event.timeStamp });
    x.set(current.origin + dx);
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    const current = release()!;
    if (!current.horizontal) {
      reset();
      return;
    }
    moved.current = true;
    const offset = current.origin + event.clientX - current.startX;
    const sample = current.samples.find((sample) => event.timeStamp - sample.time <= 100);
    const elapsed = sample ? event.timeStamp - sample.time : 0;
    const velocity = sample && elapsed > 0 ? ((event.clientX - sample.x) / elapsed) * 1000 : 0;
    const flick =
      Math.abs(offset) >= 40 &&
      Math.abs(velocity) >= 700 &&
      Math.sign(velocity) === Math.sign(offset);
    if (Math.abs(offset) >= current.width * 0.25 || flick) {
      spring.current?.stop();
      onCommit(offset > 0 ? 'save' : 'skip');
    } else reset();
  }
  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
    wasDragged: () => moved.current,
  };
}
