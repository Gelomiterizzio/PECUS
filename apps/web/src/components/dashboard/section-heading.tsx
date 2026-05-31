import { cn } from '@pecus/ui';

export function SectionHeading({
  title,
  description,
  icon,
  className,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-4', className)}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
