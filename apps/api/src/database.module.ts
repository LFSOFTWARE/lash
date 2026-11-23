import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Aula, AulaSchema, Modulo, ModuloSchema } from './content/content.schema';
import { Enrollment, EnrollmentSchema } from './enrollments/enrollment.schema';
import { Lead, LeadSchema } from './leads/lead.schema';
import { Product, ProductSchema } from './products/product.schema';
import { Progresso, ProgressoSchema } from './progress/progress.schema';
import { User, UserSchema } from './users/user.schema';

const MODELS = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: Product.name, schema: ProductSchema },
  { name: Modulo.name, schema: ModuloSchema },
  { name: Aula.name, schema: AulaSchema },
  { name: Enrollment.name, schema: EnrollmentSchema },
  { name: Progresso.name, schema: ProgressoSchema },
  { name: Lead.name, schema: LeadSchema },
]);

/** Todos os modelos do banco, disponíveis para qualquer módulo. */
@Global()
@Module({ imports: [MODELS], exports: [MODELS] })
export class DatabaseModule {}
