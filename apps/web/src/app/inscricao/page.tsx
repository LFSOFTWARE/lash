import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inscricao } from '@/components/Inscricao';
import { Logo } from '@/components/Site';

export const metadata: Metadata = { title: 'Inscrição' };

export default function PaginaInscricao() {
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-14 items-center justify-between lg:h-[72px]">
          <Logo />
          <Link className="link-ul text-sm font-semibold text-accent" href="/aluna">Área da aluna</Link>
        </div>
      </header>
      <Suspense>
        <Inscricao />
      </Suspense>
    </>
  );
}
