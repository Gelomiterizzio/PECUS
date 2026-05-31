'use client';

import Link from 'next/link';
import { Menu, PlusCircle, CloudOff } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui';
import { cn } from '@pecus/ui';
import { ThemeToggle } from './theme-toggle';
import { apiState } from '@/lib/api';
import { useDashboard } from '@/lib/hooks';

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  // Suscribe a una query para re-renderizar cuando cambie el modo mock.
  useDashboard();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Abrir menú"
        onClick={onOpenMenu}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex items-center gap-2">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          Monitoreo en vivo
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {apiState.usingMock && (
          <span className="hidden items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning sm:flex">
            <CloudOff className="size-3.5" />
            Modo demo (datos locales)
          </span>
        )}
        <ThemeToggle />
        <Link
          href="/cows/new"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'hidden sm:inline-flex',
          )}
        >
          <PlusCircle className="size-4" />
          Registrar
        </Link>
      </div>
    </header>
  );
}
