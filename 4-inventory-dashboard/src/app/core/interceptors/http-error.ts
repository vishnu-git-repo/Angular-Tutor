import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {

    console.log(error)
      if (error.status === 0) {
        alert("Server is not running");
      }

      return throwError(() => error);
    })
  );
};