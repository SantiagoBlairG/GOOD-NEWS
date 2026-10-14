import { useLayoutEffect, useRef } from 'react';
import { animate, useMotionValue, type MotionValue } from 'motion/react';

export function useCardArrival(
  id: string | undefined,
  x: MotionValue<number>,
  opacity: MotionValue<number>,
  reduced: boolean,
) {
  const previous = useRef(id);
  const scale = useMotionValue(1);
  const animations = useRef<Array<{ stop: () => void }>>([]);
  const stopArrival = () => animations.current.forEach((animation) => animation.stop());
  useLayoutEffect(() => {
    const changed = previous.current !== id && id !== undefined;
    previous.current = id;
    x.set(0);
    scale.set(changed && !reduced ? 0.95 : 1);
    opacity.set(changed ? 0.55 : 1);
    if (!changed) return;
    const arrival = animate(scale, 1, {
      duration: reduced ? 0 : 0.48,
      ease: [0.16, 1, 0.3, 1],
    });
    const fade = animate(opacity, 1, {
      duration: reduced ? 0.1 : 0.34,
      ease: [0.16, 1, 0.3, 1],
    });
    animations.current = [arrival, fade];
    return () => {
      arrival.stop();
      fade.stop();
    };
  }, [id, x, opacity, reduced, scale]);
  return { scale, stopArrival };
}
