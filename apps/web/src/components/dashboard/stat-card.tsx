'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@pecus/ui';
import { AnimatedCounter } from './animated-counter';

export interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: 'primary' | 'tech' | 'warning' | 'success' | 'destructive' | 'muted';
  hint?: string;
  index?: number;
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'text-primary bg-primary/10',
  tech: 'text-tech bg-tech/10',
  warning: 'text-warning bg-warning/15',
  success: 'text-success bg-success/10',
  destructive: 'text-destructive bg-destructive/10',
  muted: 'text-muted-foreground bg-muted',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
  hint,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="card-hover group relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="font-display text-3xl font-bold tracking-tight">
              <AnimatedCounter value={value} />
            </p>
            {hint && (
              <p className="text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
          <div
            className={cn(
              'flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
              ACCENTS[accent],
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
        <div
          className={cn(
            'pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-20',
            accent === 'primary' && 'bg-primary',
            accent === 'tech' && 'bg-tech',
            accent === 'warning' && 'bg-warning',
            accent === 'success' && 'bg-success',
            accent === 'destructive' && 'bg-destructive',
            accent === 'muted' && 'bg-muted-foreground',
          )}
        />
      </Card>
    </motion.div>
  );
}
