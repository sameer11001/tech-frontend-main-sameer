import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ScheduledBroadcastService } from '../scheduled-broadcast.service';
import * as ScheduledBroadcastActions from './scheduled-broadcast.actions';

@Injectable()
export class ScheduledBroadcastEffects {
  loadBroadcasts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduledBroadcastActions.loadBroadcasts),
      tap(action => console.log('Load broadcasts action dispatched:', action)),
      mergeMap(() =>
        this.scheduledBroadcastService.getBroadcasts().pipe(
          tap(response => console.log('Load broadcasts service response:', response)),
          map((data) => {
            console.log('Dispatching load broadcasts success:', data);
            return ScheduledBroadcastActions.loadBroadcastsSuccess({ data });
          }),
          catchError((error) => {
            console.error('Load broadcasts effect error:', error);
            return of(ScheduledBroadcastActions.loadBroadcastsFailure({ error }));
          })
        )
      )
    )
  );

  publishBroadcast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduledBroadcastActions.publishBroadcast),
      switchMap(({ broadcastData }) =>
        this.scheduledBroadcastService.publishBroadcast(broadcastData).pipe(
          map((data) => ScheduledBroadcastActions.publishBroadcastSuccess({ data })),
          catchError((error) => of(ScheduledBroadcastActions.publishBroadcastFailure({ error })))
        )
      )
    )
  );

  publishBroadcastSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduledBroadcastActions.publishBroadcastSuccess),
      tap(() => {
        this.router.navigate(['/dashboard/broadcast/scheduled-broadcasts']);
      })
    ),
    { dispatch: false }
  );

  deleteBroadcast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduledBroadcastActions.deleteBroadcast),
      tap(action => console.log('Delete broadcast action dispatched:', action)),
      switchMap(({ broadcast_id }) =>
        this.scheduledBroadcastService.deleteBroadcast(broadcast_id).pipe(
          tap(response => console.log('Delete broadcast service response:', response)),
          map(() => {
            console.log('Dispatching delete broadcast success for ID:', broadcast_id);
            return ScheduledBroadcastActions.deleteBroadcastSuccess({ broadcast_id });
          }),
          catchError((error) => {
            console.error('Delete broadcast effect error:', error);
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              status: error.status,
              statusText: error.statusText
            });
            
            // Log the full error response if available
            if (error.error) {
              console.error('Server error response:', JSON.stringify(error.error, null, 2));
            }
            
            return of(ScheduledBroadcastActions.deleteBroadcastFailure({ error }));
          })
        )
      )
    )
  );

  // Refresh broadcasts after successful deletion
  deleteBroadcastSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduledBroadcastActions.deleteBroadcastSuccess),
      tap(action => console.log('Delete broadcast success, refreshing broadcasts list:', action)),
      map(() => ScheduledBroadcastActions.loadBroadcasts())
    )
  );

  constructor(
    private actions$: Actions,
    private scheduledBroadcastService: ScheduledBroadcastService,
    private router: Router
  ) {}
} 