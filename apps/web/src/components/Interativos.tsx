'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from './Icon';
import { PrecoDe } from './Produto';
import { WA } from '@/lib/site';

/** Cartão de investimento da página do curso, com a escolha Presencial / Online. */
export function Investimento() {
  const [formato, setFormato] = useState<'presencial' | 'online'>('presencial');
  const presencial = formato === 'presencial';
  return (
    <div className="card flex flex-col gap-4 p-5 lg:p-8">
      <div className="seg" role="group" aria-label="Formato do curso">
        <button type="button" aria-pressed={presencial} onClick={() => setFormato('presencial')}><Icon name="map-pin" size={16} />Presencial</button>
        <button type="button" aria-pressed={!presencial} onClick={() => setFormato('online')}><Icon name="video" size={16} />Online</button>
      </div>
      <span className="t-label">Investimento · {formato}</span>
      <div aria-live="polite" className="flex flex-col gap-4">
        <PrecoDe key={formato} slug={`extensao-de-cilios-${formato}`} size={44} sufixo={presencial ? 'à vista' : undefined} />
        <p className="text-sm text-muted">
          {presencial ? 'Ou em até 12x no cartão, com a taxa da maquininha. ' : 'Aulas gravadas para assistir no seu ritmo. '}
          O pagamento é combinado pelo WhatsApp.
        </p>
      </div>
      <Link className="btn btn-pri btn-lg w-full" href={`/inscricao?produto=extensao-de-cilios-${formato}`}>Quero me inscrever</Link>
      <a className="btn btn-sec btn-lg w-full" href={WA}><Icon name="whatsapp" size={18} />Tirar dúvidas</a>
      <ul className="checks border-t border-line pt-4 text-sm">
        {presencial ? (
          <>
            <li><Icon name="package" size={18} />Kit completo com 20&nbsp;itens</li>
            <li><Icon name="book" size={18} />Apostila exclusiva</li>
            <li><Icon name="award" size={18} />Certificado de conclusão</li>
            <li><Icon name="users" size={18} />Prática com modelo real</li>
          </>
        ) : (
          <>
            <li><Icon name="video" size={18} />12 aulas gravadas</li>
            <li><Icon name="book" size={18} />Apostila exclusiva</li>
            <li><Icon name="award" size={18} />Certificado de conclusão</li>
          </>
        )}
      </ul>
    </div>
  );
}
