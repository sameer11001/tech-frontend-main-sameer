// api.service.ts
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { environment } from "../env/environment";
import { catchError, retryWhen, delay, take, retry } from "rxjs/operators";
import { AuthError, AuthErrorType } from "../models/auth.types";

export interface RequestOptions {
    headers?: HttpHeaders;
    params?: HttpParams;
    isJson?: boolean;
    isMultipart?: boolean;
    retries?: number;

}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    private retryStrategy = {
        maxRetries: 1,
        backoff: 1000
    };

    constructor(private http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            return throwError(() => new AuthError(AuthErrorType.NETWORK_ERROR, 'Network error occurred'));
        }
        return throwError(() => error);
    }

    private addRetryStrategy<T>(observable: Observable<T>): Observable<T> {
        return observable.pipe(
            retryWhen(errors => errors.pipe(delay(this.retryStrategy.backoff), take(this.retryStrategy.maxRetries))),
            catchError(this.handleError)
        );
    }

    get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
        return this.addRetryStrategy(this.http.get<T>(`${this.baseUrl}/${endpoint}`, options));
    }

    post<T>(endpoint: string, body?: any, options?: RequestOptions): Observable<T> {
        return this.addRetryStrategy(this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options));
    }

    put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
        return this.addRetryStrategy(this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, options));
    }

    delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
        return this.addRetryStrategy(this.http.delete<T>(`${this.baseUrl}/${endpoint}`, options));
    }
}
