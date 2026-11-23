import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { carregarDotenv } from './dotenv';
import { configurar } from './setup';

async function main() {
  carregarDotenv();
  const app = await NestFactory.create(AppModule);
  const env = configurar(app);
  app.enableShutdownHooks();

  const doc = new DocumentBuilder()
    .setTitle('Camilla Lash — API')
    .setDescription('Catálogo, inscrições pelo WhatsApp, área da aluna e painel da instrutora. Preços em centavos.')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, doc));

  await app.listen(env.port);
  new Logger('API').log(`Rodando em ${env.apiUrl}/api · documentação em ${env.apiUrl}/api/docs`);
}

main();
