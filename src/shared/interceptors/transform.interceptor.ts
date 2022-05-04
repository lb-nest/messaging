import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  constructor(private readonly classRef: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<T> {
    return next
      .handle()
      .pipe(map((value) => plainToClass(this.classRef, value)));
  }
}
