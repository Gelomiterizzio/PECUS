'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Milk,
  Beef,
  PlusCircle,
  Radio,
} from 'lucide-react';
import { Logo, cn } from '@pecus/ui';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dairy', label: 'Vacas Lecheras', icon: Milk },
  { href: '/beef', label: 'Vacas de Carne', icon: Beef },
  { href: '/cows/new', label: 'Registrar Vaca', icon: PlusCircle },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  // `usePathname()` puede devolver null durante el prerender estático;
  // por eso lo normalizamos antes de usar .startsWith (evita el crash del build).
  const pathname = usePathname() ?? '';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2.5 px-3 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
          <Logo className="size-6" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg font-bold tracking-tight">PECUS</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Ganadería Inteligente
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-[1.15rem] transition-transform group-hover:scale-110',
                  active && 'text-primary',
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-2 mb-3 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-tech/5 p-4">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-primary">
          <Radio className="size-3.5 animate-pulse" />
          Telemetría IoT activa
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Sensores simulados transmitiendo en tiempo real. Listo para MQTT.
        </p>
      </div>
    </div>
  );
}
