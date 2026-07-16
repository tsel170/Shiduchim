import { useLayoutEffect, useState } from 'react';

/** Triggers enter transition one frame after mount so the browser paints the initial state first. */
export function useOverlayEnter(): boolean {
  const [entered, setEntered] = useState(false);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return entered;
}
