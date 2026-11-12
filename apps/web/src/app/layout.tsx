import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-cormorant', display: 'swap' });
const dm = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-dm', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Camilla Lash — Extensão de cílios e cursos em Osasco-SP', template: '%s · Camilla Lash' },
  description: 'Extensão de cílios, design de sobrancelhas e curso profissional com Camilla Gama, em Osasco-SP.',
};
export const viewport: Viewport = { themeColor: '#FBF5F4' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dm.variable}`}>
      <body>
        <a className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2" href="#conteudo">
          Pular para o conteúdo
        </a>
        <p className="bg-ink px-5 py-1.5 text-center text-[13px] text-white">Versão de teste: os dados de alunas e pedidos são exemplos.</p>
        {children}
      </body>
    </html>
  );
}
