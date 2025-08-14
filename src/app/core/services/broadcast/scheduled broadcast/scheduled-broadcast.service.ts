import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../api/api.service';
import { BroadcastRequest, BroadcastResponse, ApiErrorResponse } from '../../../models/broadcast.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduledBroadcastService {
  constructor(private apiService: ApiService) {}

  publishBroadcast(broadcastData: BroadcastRequest): Observable<any> {
    console.log('Publishing broadcast:', broadcastData);
    return this.apiService.post<any>('v1/broadcast/publish', broadcastData).pipe(
      tap(response => console.log('Publish broadcast response:', response)),
      catchError(error => {
        console.error('Publish broadcast error:', error);
        throw error;
      })
    );
  }

  getBroadcasts(): Observable<BroadcastResponse> {
    console.log('Getting broadcasts from API...');
    return this.apiService.get<BroadcastResponse>('v1/broadcast/').pipe(
      tap(response => console.log('Get broadcasts response:', response)),
      catchError(error => {
        console.error('Get broadcasts error:', error);
        throw error;
      })
    );
  }

  deleteBroadcast(broadcast_id: string): Observable<any> {
    console.log('Deleting broadcast:', broadcast_id);
    const params = new HttpParams().set('broadcast_id', broadcast_id);
    return this.apiService.delete<any>('v1/broadcast/', { params }).pipe(
      tap(response => console.log('Delete broadcast response:', response)),
      catchError(error => {
        console.error('Delete broadcast error:', error);
        throw error;
      })
    );
  }
} 