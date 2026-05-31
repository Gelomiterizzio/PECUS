import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export function ChartCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="card-hover flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="h-[220px] w-full">{children}</div>
        {footer}
      </CardContent>
    </Card>
  );
}
