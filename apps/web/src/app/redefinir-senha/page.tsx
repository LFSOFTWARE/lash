import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormRedefinir, TelaConta } from '@/components/Conta';

export const metadata: Metadata = { title: 'Criar senha', robots: { index: false } };

export default function RedefinirSenha() {
  return (
    <TelaConta>
      <Suspense>
        <FormRedefinir />
      </Suspense>
    </TelaConta>
  );
}
