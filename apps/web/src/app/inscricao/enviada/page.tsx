import Link from 'next/link';
import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { Enviada } from '@/components/Inscricao';
import { Logo } from '@/components/Site';

export const metadata: Metadata = { title: 'Inscrição recebida' };

export default function PaginaEnviada() {
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-14 items-center justify-between lg:h-[72px]">
          <Logo />
          <Link className="btn btn-sec" href="/aluna"><Icon name="user" size={18} />Área da aluna</Link>
        </div>
      </header>
      <Enviada />
    </>
  );
}
