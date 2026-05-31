import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Envuelve respuestas exitosas en { success, data }.
 * Si el handler ya devuelve { data, meta } (paginación) se preserva la metadata.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        if (payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload) {
          return { success: true, ...payload };
        }
        return { success: true, data: payload };
      }),
    );
  }
}
