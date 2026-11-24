import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Pedidos } from '@/components/Pedidos';

export const metadata: Metadata = { title: 'Pedidos de inscrição' };

export default function Pagina() {
  return (
    <AppShell area="admin" ativo="/admin">
      <Pedidos />
    </AppShell>
  );
}
