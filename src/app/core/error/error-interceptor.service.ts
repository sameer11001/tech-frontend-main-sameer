import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `${error.error.message}`;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = 'Bad Request (400)';
              break;
            case 401:
              errorMessage = 'Unauthorized (401) - Please login again';
              this.router.navigate(['/login']);
              break;
            case 403:
              errorMessage = 'Forbidden (403) - Access Denied';
              break;
            case 404:
              errorMessage = 'Not Found (404)';
              break;
            case 500:
              errorMessage = 'Internal Server Error (500)';
              break;
            default:
              errorMessage = `${error.status}: ${error.message}`;
          }
        }

        console.error('Custom HTTP Error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
