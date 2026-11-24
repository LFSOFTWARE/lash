import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { Cursos } from '@/components/Cursos';

export const metadata: Metadata = { title: 'Cursos e materiais' };

export default function Pagina() {
  return (
    <AppShell area="admin" ativo="/admin/curso">
      <Suspense>
        <Cursos />
      </Suspense>
    </AppShell>
  );
}
