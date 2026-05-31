import Link from 'next/link';
import { cn } from '@pecus/ui';
import { buttonVariants } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold gradient-text">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        La página que buscas no existe o fue movida. Volvamos al monitoreo del
        rebaño.
      </p>
      <Link href="/" className={cn(buttonVariants(), 'mt-6')}>
        Ir al dashboard
      </Link>
    </div>
  );
}
