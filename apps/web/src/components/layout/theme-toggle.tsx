'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative overflow-hidden"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-[1.15rem] text-warning transition-transform duration-300" />
        ) : (
          <Moon className="size-[1.15rem] text-tech transition-transform duration-300" />
        )
      ) : (
        <span className="size-[1.15rem]" />
      )}
    </Button>
  );
}
