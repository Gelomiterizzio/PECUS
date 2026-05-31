'use client';

import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { CowForm } from '@/components/cows/cow-form';

export default function NewCowPage() {
  return (
    <div>
      <PageHeader
        icon={<PlusCircle className="size-6" />}
        title="Registrar nueva vaca"
        description="Añade un animal al rebaño. El código se asigna automáticamente."
        backHref="/"
        backLabel="Dashboard"
      />
      <CowForm />
    </div>
  );
}
