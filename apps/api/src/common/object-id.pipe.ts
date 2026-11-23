import { BadRequestException, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export class ObjectIdPipe implements PipeTransform<string, string> {
  transform(v: string) {
    if (!isValidObjectId(v)) throw new BadRequestException('Id inválido.');
    return v;
  }
}
