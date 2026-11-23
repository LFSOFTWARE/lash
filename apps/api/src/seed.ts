/**
 * Dados iniciais: conta admin, catálogo do site e a grade do curso online.
 * Pode rodar mais de uma vez: atualiza os produtos pelo slug e não duplica nada.
 * Fora de produção cria também uma aluna de exemplo com pedidos.
 *
 *   pnpm --filter api seed
 */
import 'reflect-metadata';
import { hash } from '@node-rs/argon2';
import mongoose, { Types } from 'mongoose';
import { carregarDotenv } from './dotenv';
import { loadEnv } from './config/env';
import { AulaSchema, ModuloSchema } from './content/content.schema';
import { EnrollmentSchema } from './enrollments/enrollment.schema';
import { ProductSchema } from './products/product.schema';
import { UserSchema } from './users/user.schema';

const DIA1 = [
  'Preparação e higienização dos cílios naturais', 'Materiais e instrumentos', 'Mapeamento e escolha dos fios',
  'Segredos para maior durabilidade', 'Acoplamento e isolamento', 'Direcionamento correto dos fios', 'Treino no copo, boneca e esponja',
];
const DIA2 = [
  'Preparação da modelo e análise do olhar', 'Aplicação completa em modelo real, com acompanhamento',
  'Correções e dicas para resultados de excelência', 'Finalização, cuidados e manutenção',
];
const TECNICAS = ['Fio a Fio', 'Volume Brasileiro', 'Volume Europeu (4D)', 'Volume Mega Europeu', 'Volume Marrom'];
const KIT = [
  'Pinça de isolamento', 'Pinça de precisão', 'Esponjas para treino', 'Pump espumador', 'Pump para enxágue',
  'Fitas micropore', 'Fita transpore', 'Cola profissional', 'Higienizador de cílios', 'Mini ventilador portátil',
  'Caneta marcadora', 'Caixa de cílios 4D', 'Caixa de cílios Y', 'Escovinhas para cílios', 'Microbrush',
  'Florzinha para cola', 'Pads em gel', 'Higrômetro', 'Máscaras descartáveis', 'Toucas descartáveis',
];
const MODULOS = [
  { nome: 'Fundamentos', aulas: ['Biossegurança', 'Tufo, tela e extensão', 'Tipos de técnicas', 'Ciclo de vida dos cílios'] },
  { nome: 'Técnicas', aulas: TECNICAS },
  { nome: 'Prática', aulas: ['Mapeamento e escolha dos fios', 'Acoplamento e isolamento', 'Direcionamento dos fios'] },
];

// Preços em centavos. Online, apostila e sobrancelhas são EXEMPLOS até a Camilla definir; o "de R$ 1.200" também.
const PRODUTOS = [
  {
    slug: 'extensao-de-cilios-presencial', tipo: 'curso', formato: 'presencial', categoria: 'cilios', ordem: 1,
    titulo: 'Extensão de Cílios — Iniciante',
    resumo: 'Intensivo de 2 dias em Osasco: cinco técnicas, kit com 20 itens, apostila e prática com modelo.',
    capa: '/fotos/pdf-curso-p3-03.jpg', preco: 100000, precoOriginal: 120000, condicoes: 'à vista ou em até 12x',
    cargaHoraria: '2 dias', nivel: 'Iniciante', local: 'Osasco-SP',
    conteudo: [...DIA1.map((t) => `Dia 1 · ${t}`), ...DIA2.map((t) => `Dia 2 · ${t}`)], kit: KIT,
  },
  {
    slug: 'extensao-de-cilios-online', tipo: 'curso', formato: 'online', categoria: 'cilios', ordem: 2,
    titulo: 'Extensão de Cílios — Iniciante',
    resumo: 'As mesmas cinco técnicas em 12 aulas gravadas, com apostila e certificado.',
    capa: '/fotos/post-04.jpg', preco: 49700, condicoes: 'à vista ou em até 12x', cargaHoraria: '12 aulas', nivel: 'Iniciante',
    conteudo: TECNICAS,
  },
  {
    slug: 'design-de-sobrancelhas-presencial', tipo: 'curso', formato: 'presencial', categoria: 'sobrancelhas', ordem: 3,
    titulo: 'Design de Sobrancelhas',
    resumo: 'Mapeamento, desenho e acabamento sob medida. Próximas turmas pelo WhatsApp.',
    capa: '/fotos/post-12.jpg', preco: 60000, condicoes: 'à vista ou em até 12x', cargaHoraria: '1 dia', local: 'Osasco-SP',
  },
  {
    slug: 'apostila-extensao-de-cilios', tipo: 'apostila', categoria: 'cilios', ordem: 4,
    titulo: 'Apostila Profissional de Extensão de Cílios',
    resumo: 'Biossegurança, tipos de técnica, ciclo dos fios e mapeamento em 30 páginas.',
    capa: '/fotos/pdf-apostila-p1-07.jpg', preco: 9700, paginas: 30,
  },
] as const;

async function main() {
  carregarDotenv();
  const env = loadEnv();
  const prod = process.env.NODE_ENV === 'production';
  await mongoose.connect(env.mongoUri);
  const User = mongoose.model('User', UserSchema);
  const Product = mongoose.model('Product', ProductSchema);
  const Modulo = mongoose.model('Modulo', ModuloSchema);
  const Aula = mongoose.model('Aula', AulaSchema);
  const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
  await Promise.all([User, Product, Modulo, Aula, Enrollment].map((m) => m.syncIndexes()));

  // Admin
  const email = (process.env.ADMIN_EMAIL ?? 'camilla@example.com').toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (prod && !senha) throw new Error('Defina ADMIN_SENHA.');
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      nome: process.env.ADMIN_NOME ?? 'Camilla Gama', email, whatsapp: env.whatsappInstrutora, papel: 'admin',
      senhaHash: await hash(senha ?? 'admin12345'),
    });
    console.log(`Admin criada: ${email}`);
  } else if (admin.papel !== 'admin') {
    admin.papel = 'admin';
    await admin.save();
    console.log(`${email} agora é admin.`);
  }

  // Catálogo
  const ids: Record<string, Types.ObjectId> = {};
  for (const p of PRODUTOS) {
    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      { $set: p, $setOnInsert: { publicado: true } },
      { upsert: true, new: true, runValidators: true },
    );
    ids[p.slug] = doc._id;
  }
  console.log(`Produtos: ${PRODUTOS.length}`);

  // Grade do curso online (só se ainda não tiver módulos, para não apagar o que a instrutora editou).
  const online = ids['extensao-de-cilios-online'];
  if (!(await Modulo.exists({ courseId: online }))) {
    for (const [i, m] of MODULOS.entries()) {
      const mod = await Modulo.create({ courseId: online, titulo: m.nome, ordem: i });
      await Aula.insertMany(
        m.aulas.map((titulo, j) => ({
          courseId: online, moduleId: mod._id, titulo, ordem: j, duracao: 600,
          aulaGratis: i === 0 && j === 0,
        })),
      );
    }
    console.log('Grade do curso online criada (aulas ainda sem vídeo).');
  }

  // Exemplos
  if (!prod) {
    const exEmail = 'aluna@example.com';
    let aluna = await User.findOne({ email: exEmail });
    if (!aluna) {
      aluna = await User.create({ nome: 'Juliana Souza', email: exEmail, whatsapp: '11912345678', senhaHash: await hash('aluna12345') });
      await Enrollment.create([
        { userId: aluna._id, productId: online, status: 'ativa', liberadaEm: new Date(), liberadaPor: admin._id },
        { userId: aluna._id, productId: ids['apostila-extensao-de-cilios'], status: 'pendente' },
      ]);
      console.log(`Aluna de exemplo: ${exEmail} / aluna12345`);
    }
  }

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
