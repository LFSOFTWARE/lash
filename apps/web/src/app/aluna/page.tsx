import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { PainelAluna } from '@/components/PainelAluna';

export const metadata: Metadata = { title: 'Meus cursos' };

export default function Aluna() {
  return (
    <AppShell area="aluna" ativo="/aluna">
      <PainelAluna />
    </AppShell>
  );
}
