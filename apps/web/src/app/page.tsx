import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Preco, SiteFooter, SiteNav } from '@/components/Site';
import { INSTAGRAM, WA, WA_LABEL, foto } from '@/lib/site';

const SERVICOS = [
  ['eye', 'Extensão de cílios', 'Fio a Fio, Volume Brasileiro, Volume Europeu (4D), Mega Europeu e Volume Marrom.'],
  ['pencil', 'Design de sobrancelhas', 'Desenho sob medida para o formato do seu rosto.'],
  ['shield', 'Depilação', 'Acabamento limpo, com biossegurança em cada etapa.'],
] as const;
const PASSOS = [
  ['pencil', 'Faça sua inscrição', 'Preencha seus dados e crie sua conta. Leva menos de um minuto.'],
  ['whatsapp', 'Combine o pagamento', 'Você fala comigo no WhatsApp e escolhe Pix ou cartão.'],
  ['lock', 'Receba seu acesso', 'Vaga confirmada e apostila liberada na sua área de aluna.'],
] as const;
const RESULTADOS = [
  ['post-02.jpg', 'Cliente com extensão de cílios'],
  ['post-11.jpg', 'Olho verde com extensão de cílios em volume'],
  ['post-05.jpg', 'Cliente com cílios e sobrancelhas feitos'],
  ['post-07.jpg', 'Cliente com extensão de cílios'],
] as const;
const DUVIDAS = [
  ['Como faço o pagamento?', 'Depois da inscrição, você combina direto comigo pelo WhatsApp: R$ 1.000 à vista ou em até 12x no cartão, com a taxa da maquininha.'],
  ['O curso é presencial ou online?', 'Os dois. O presencial é um intensivo de 2 dias em Osasco-SP, com kit e prática em modelo. O online tem as mesmas técnicas em aulas gravadas, com apostila e certificado.'],
  ['Preciso ter experiência?', 'Não. O curso é para iniciantes e começa do zero.'],
  ['O que está incluso no curso?', 'Kit profissional com 20 itens, apostila exclusiva e certificado de conclusão.'],
  ['Vou praticar em modelo?', 'Sim. No segundo dia você faz uma aplicação completa em modelo real, com o meu acompanhamento.'],
] as const;

export default function Landing() {
  return (
    <>
      <SiteNav />
      <main id="conteudo">
        <section className="wrap flex flex-col gap-8 pt-8 pb-14 lg:flex-row lg:items-center lg:gap-[72px] lg:pt-[72px] lg:pb-24">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <h1 className="t-h1 rise">Extensão de cílios com técnica. <span>E ensinada do zero.</span></h1>
            <p className="lead rise text-muted" style={{ '--n': 1 } as React.CSSProperties}>
              Atendimentos e curso profissional em Osasco-SP, com mais de 7&nbsp;anos realçando olhares e formando novas lash designers.
            </p>
            <div className="rise flex flex-col gap-3 lg:flex-row" style={{ '--n': 2 } as React.CSSProperties}>
              <Link className="btn btn-pri btn-lg" href="/#curso">Conhecer o curso<Icon name="arrow-right" size={18} /></Link>
              <a className="btn btn-sec btn-lg" href={WA}><Icon name="whatsapp" size={18} />Agendar atendimento</a>
            </div>
            <ul className="rise flex flex-col gap-3 border-t border-line pt-6 text-[15px] lg:flex-row lg:gap-8 lg:pt-7" style={{ '--n': 3 } as React.CSSProperties}>
              <li className="flex items-center gap-2.5"><Icon name="map-pin" className="text-accent" />Osasco-SP</li>
              <li className="flex items-center gap-2.5"><Icon name="clock" className="text-accent" />+7&nbsp;anos de experiência</li>
              <li className="flex items-center gap-2.5"><Icon name="award" className="text-accent" />Curso com certificado</li>
            </ul>
          </div>
          <div className="photo hero-photo h-[380px] flex-none lg:h-[620px] lg:w-[560px]">
            <img src={foto('pdf-curso-p2-02.jpg')} alt="Camilla Gama, lash designer" width={864} height={656} fetchPriority="high" style={{ objectPosition: '64% 0', height: '109%' }} />
          </div>
        </section>

        <section className="alt sec" id="sobre">
          <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-20">
            <div className="photo h-[420px] flex-none lg:h-[560px] lg:w-[480px]">
              <img src={foto('post-10.jpg')} alt="Camilla entregando o certificado a uma aluna no estúdio" width={480} height={640} loading="lazy" />
            </div>
            <div className="flex flex-col gap-6">
              <h2 className="t-h2">Muito prazer, <span>eu sou a Camilla.</span></h2>
              <p className="lead">Minha história na beleza começou aos 13&nbsp;anos, no meu primeiro curso de extensão de cílios. Desde então, nunca mais saí dessa área.</p>
              <p className="max-w-[62ch] text-muted">Sempre busquei uma profissão que me desse independência financeira, liberdade e a chance de ter o meu próprio negócio. Hoje, com 7&nbsp;anos de experiência, compartilho tudo o que aprendi para ajudar outras meninas a começarem essa jornada.</p>
              <a className="go self-start" href={INSTAGRAM}><Icon name="instagram" size={18} />Acompanhe no Instagram<Icon name="arrow-right" size={18} /></a>
            </div>
          </div>
        </section>

        <section className="sec" id="atendimentos">
          <div className="wrap flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="mb-8 flex max-w-[760px] flex-col gap-4 lg:mb-12">
                <h2 className="t-h2">Atendimentos <span>no estúdio</span></h2>
                <p className="text-muted">Cada olhar pede um mapeamento. Você escolhe o efeito e eu cuido da saúde dos seus fios.</p>
              </div>
              {SERVICOS.map(([ic, t, d]) => (
                <div key={t} className="flex items-start gap-5 border-t border-line py-6 last-of-type:border-b">
                  <div className="ficon"><Icon name={ic} /></div>
                  <div className="flex flex-col gap-2"><h3 className="t-h3">{t}</h3><p className="text-muted">{d}</p></div>
                </div>
              ))}
              <a className="btn btn-pri mt-8 lg:self-start" href={WA}><Icon name="whatsapp" size={18} />Agendar no WhatsApp</a>
            </div>
            <div className="grid flex-none grid-cols-2 gap-3 lg:w-[560px] lg:gap-6">
              <figure className="flex flex-col gap-3">
                <div className="photo arch h-[260px] lg:h-[400px]"><img src={foto('pdf-curso-p6-04.jpg')} alt="Olho com extensão de cílios em fio marrom" width={300} height={470} loading="lazy" /></div>
                <figcaption className="t-label">Fio marrom</figcaption>
              </figure>
              <figure className="flex flex-col gap-3 lg:mt-14">
                <div className="photo arch h-[260px] lg:h-[400px]"><img src={foto('pdf-curso-p7-05.jpg')} alt="Olho com extensão de cílios em volume europeu" width={300} height={470} loading="lazy" /></div>
                <figcaption className="t-label">Volume europeu</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="alt sec" id="curso">
          <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-20">
            <Link className="photo h-[300px] flex-none lg:h-[600px] lg:w-[480px]" href="/cursos/extensao-de-cilios">
              <img src={foto('pdf-curso-p3-03.jpg')} alt="Extensão de cílios vista de perfil" width={681} height={1210} loading="lazy" style={{ objectPosition: '50% 35%' }} />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="tag"><Icon name="map-pin" size={14} />Presencial · Osasco-SP</span>
                <span className="tag"><Icon name="video" size={14} />Online</span>
                <span className="tag">Iniciante</span>
              </div>
              <h2 className="t-h2">Curso de Extensão de Cílios. <span>Do zero ao primeiro atendimento.</span></h2>
              <p className="lead text-muted">Presencial ou online. No intensivo de 2&nbsp;dias em Osasco você treina e atende uma modelo real; no online, estuda pelas aulas gravadas, no seu ritmo.</p>
              <div className="num flex justify-between lg:justify-start lg:gap-12">
                <div className="stat"><b>2</b><span>dias intensivos</span></div>
                <div className="stat"><b>5</b><span>técnicas</span></div>
                <div className="stat"><b>20</b><span>itens no kit</span></div>
              </div>
              <ul className="checks">
                <li><Icon name="package" />Kit profissional com 20&nbsp;itens no presencial</li>
                <li><Icon name="book" />Apostila exclusiva com teoria e páginas de treino</li>
                <li><Icon name="award" />Certificado de conclusão</li>
              </ul>
              <div className="grid gap-3 pt-2 md:grid-cols-2 lg:gap-6">
                <Link className="card flex flex-col gap-3 p-5" href="/inscricao">
                  <span className="t-label flex items-center gap-2"><Icon name="map-pin" size={16} />Presencial · 2&nbsp;dias em Osasco-SP</span>
                  <Preco sufixo="à vista ou em até 12x" />
                  <span className="go self-start">Quero me inscrever<Icon name="arrow-right" size={18} /></span>
                </Link>
                <Link className="card flex flex-col gap-3 p-5" href="/inscricao">
                  <span className="t-label flex items-center gap-2"><Icon name="video" size={16} />Online · aulas gravadas</span>
                  <span className="leading-7 text-muted">Valor sob consulta</span>
                  <span className="go self-start">Quero me inscrever<Icon name="arrow-right" size={18} /></span>
                </Link>
              </div>
              <Link className="go self-start" href="/catalogo">Ver também o curso de Design de Sobrancelhas<Icon name="arrow-right" size={18} /></Link>
            </div>
          </div>
        </section>

        <section className="sec" id="apostila">
          <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <span className="tag self-start"><Icon name="file" size={14} />Apostila · PDF · 30&nbsp;páginas</span>
              <h2 className="t-h2">Apostila Profissional. <span>Toda a teoria para ler e reler.</span></h2>
              <p className="lead text-muted">O conteúdo teórico de extensão de cílios em um material só, vendido separado dos cursos.</p>
              <ul className="checks">
                {['Biossegurança e higienização', 'Tufo, tela e extensão: as diferenças', 'Tipos de técnicas e de fios', 'Ciclo de vida dos cílios'].map((t) => (
                  <li key={t}><Icon name="check" />{t}</li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 pt-2 lg:flex-row lg:items-center lg:gap-6">
                <Link className="btn btn-pri btn-lg" href="/inscricao">Quero a apostila</Link>
                <span className="text-sm text-muted">Valor sob consulta</span>
              </div>
            </div>
            <Link className="photo h-[480px] flex-none lg:h-[594px] lg:w-[420px]" href="/catalogo#apostilas">
              <img src={foto('pdf-apostila-p1-07.jpg')} alt="Capa da apostila profissional de extensão de cílios" width={1131} height={1600} loading="lazy" />
            </Link>
          </div>
        </section>

        <section className="deep sec lg:pb-[120px]">
          <div className="wrap">
            <h2 className="t-h2 mb-8 max-w-[760px] lg:mb-12">Da inscrição à sua vaga em três passos</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {PASSOS.map(([ic, t, d]) => (
                <div key={t} className="flex flex-col gap-4 border-t border-white/20 pt-7">
                  <div className="ficon"><Icon name={ic} /></div>
                  <h3 className="t-h3">{t}</h3>
                  <p className="soft">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="resultados">
          <div className="wrap">
            <div className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="t-h2">Resultados <span>de quem passou por aqui</span></h2>
              <a className="go self-start lg:self-auto" href={INSTAGRAM}><Icon name="instagram" size={18} />Ver mais no Instagram<Icon name="arrow-right" size={18} /></a>
            </div>
            <div className="gal grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
              {RESULTADOS.map(([f, alt]) => (
                <div key={f} className="photo aspect-[4/5]"><img src={foto(f)} alt={alt} width={480} height={640} loading="lazy" /></div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10 pb-14 lg:pt-12 lg:pb-[72px]" id="duvidas">
          <div className="wrap flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-24">
            <h2 className="t-h2 flex-none lg:w-[380px]">Dúvidas <span>frequentes</span></h2>
            <div className="min-w-0 flex-1">
              {DUVIDAS.map(([q, a], i) => (
                <details key={q} className="faq" open={i === 0}>
                  <summary>{q}<Icon name="chevron" /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap pb-14 lg:pb-24">
          <div className="alt flex flex-col items-center gap-6 rounded-[20px] px-5 py-12 text-center lg:flex-row lg:gap-14 lg:p-[72px] lg:text-left">
            <img className="round h-[120px] w-[120px] flex-none rounded-full object-cover lg:h-[200px] lg:w-[200px]" src={foto('pdf-curso-p10-06.jpg')} alt="Camilla Gama sorrindo" width={360} height={360} loading="lazy" />
            <div className="flex flex-col items-center gap-6 lg:items-start">
              <h2 className="t-h2">Vamos começar essa jornada juntas?</h2>
              <div className="flex flex-col items-center gap-4 lg:flex-row">
                <a className="btn btn-pri btn-lg" href={WA}><Icon name="whatsapp" size={18} />Chamar no WhatsApp</a>
                <span className="num text-muted">{WA_LABEL}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
