import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { Alunas } from '@/components/Alunas';

export const metadata: Metadata = { title: 'Alunas' };

export default function Pagina() {
  return (
    <AppShell area="admin" ativo="/admin/alunas">
      <Suspense>
        <Alunas />
      </Suspense>
    </AppShell>
  );
}
