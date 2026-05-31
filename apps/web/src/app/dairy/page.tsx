'use client';

import * as React from 'react';
import Link from 'next/link';
import { Milk, PlusCircle } from 'lucide-react';
import { CowType } from '@pecus/types';
import { cn } from '@pecus/ui';
import { buttonVariants } from '@/components/ui';
import { PageHeader } from '@/components/layout/page-header';
import { CowsTable } from '@/components/cows/cows-table';

export default function DairyPage() {
  return (
    <div>
      <PageHeader
        icon={<Milk className="size-6" />}
        title="Vacas Lecheras"
        description="Gestión y monitoreo del ganado de producción láctea"
        actions={
          <Link href="/cows/new" className={cn(buttonVariants({ size: 'sm' }))}>
            <PlusCircle className="size-4" />
            Registrar vaca
          </Link>
        }
      />
      {/* useSearchParams (filtros desde la URL) requiere un límite de Suspense. */}
      <React.Suspense fallback={null}>
        <CowsTable fixedType={CowType.DAIRY} showTypeColumn={false} />
      </React.Suspense>
    </div>
  );
}
