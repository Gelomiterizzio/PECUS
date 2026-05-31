'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { SidebarContent } from './sidebar';
import { Header } from './header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen mesh-bg">
      {/* Sidebar fija (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card/40 backdrop-blur-sm lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar móvil (overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="absolute right-2 top-3"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </Button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="lg:pl-64">
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
