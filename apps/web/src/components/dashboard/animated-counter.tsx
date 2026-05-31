'use client';

import * as React from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';

export function AnimatedCounter({
  value,
  duration = 1.1,
}: {
  value: number;
  duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('es'));

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}
