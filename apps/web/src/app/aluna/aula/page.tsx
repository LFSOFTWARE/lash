import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Aula } from '@/components/Aula';

export const metadata: Metadata = { title: 'Aula' };

export default function PaginaAula() {
  return (
    <Suspense>
      <Aula />
    </Suspense>
  );
}
