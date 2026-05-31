'use client';

import { useParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { Card, CardContent, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout/page-header';
import { CowForm } from '@/components/cows/cow-form';
import { useCow } from '@/lib/hooks';

export default function EditCowPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { data: cow, isLoading } = useCow(id);

  return (
    <div>
      <PageHeader
        icon={<Pencil className="size-6" />}
        title="Editar vaca"
        description={
          cow ? `${cow.nombre} · ${cow.codigoVaca}` : 'Modifica los datos del animal'
        }
        backHref={id ? `/cows/${id}` : '/'}
        backLabel="Detalle"
      />
      {isLoading ? (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-6 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : cow ? (
        <CowForm cow={cow} />
      ) : (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-10 text-center text-muted-foreground">
            No se encontró la vaca solicitada.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
