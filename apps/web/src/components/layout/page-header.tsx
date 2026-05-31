import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@pecus/ui';
import { buttonVariants } from '@/components/ui';

export function PageHeader({
  title,
  description,
  icon,
  backHref,
  backLabel = 'Volver',
  actions,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'mb-3 -ml-2 text-muted-foreground',
          )}
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
