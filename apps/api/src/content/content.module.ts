import { Module } from '@nestjs/common';
import { AdminContentController } from './content.controller';

@Module({ controllers: [AdminContentController] })
export class ContentModule {}
