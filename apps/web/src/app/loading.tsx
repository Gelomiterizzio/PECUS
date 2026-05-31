import { Logo } from '@pecus/ui';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex size-14 animate-pulse items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Logo className="size-8" />
      </div>
      <p className="text-sm text-muted-foreground">Cargando PECUS…</p>
    </div>
  );
}
