import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { ApiService } from "../../api/api.service";

@Injectable({
  providedIn: "root",
})
export class GetUserRepo {
  private basePath ="v1/user/";

  constructor(private apiService: ApiService) {}

  getUser(): Observable<any> {
    const endpoint = `${this.basePath}`;
    return this.apiService.get(endpoint).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: any) {
    return throwError(() => new Error(error.message || "Something went wrong"));
  }
}
