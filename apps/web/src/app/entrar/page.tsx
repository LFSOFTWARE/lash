import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormEntrar, TelaConta } from '@/components/Conta';

export const metadata: Metadata = { title: 'Área da aluna' };

export default function Entrar() {
  return (
    <TelaConta>
      <Suspense>
        <FormEntrar />
      </Suspense>
    </TelaConta>
  );
}
