import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { Pedidos } from '@/components/Interativos';

export const metadata: Metadata = { title: 'Pedidos de inscrição' };

export default function Admin() {
  return (
    <AppShell area="admin" ativo="/admin">
      <div id="resumo" className="flex flex-col gap-6 px-5 pt-6 pb-10 lg:gap-8 lg:px-12 lg:pt-10 lg:pb-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1"><h1 className="t-h2">Pedidos de inscrição</h1><span className="text-muted">Libere o acesso depois de confirmar o pagamento no WhatsApp.</span></div>
          <button className="btn btn-sec lg:btn-pri" type="button"><Icon name="plus" size={18} />Liberar para uma aluna</button>
        </div>
        <Pedidos />
        <p id="alunas" className="text-sm text-muted">Teste: “Liberar acesso” muda o status só nesta página; nada é salvo.</p>
      </div>
    </AppShell>
  );
}
