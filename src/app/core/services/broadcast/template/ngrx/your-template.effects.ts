// template.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import * as TemplateActions from './your-template.actions';
import { YourTemplateService } from '../your-template.service';

@Injectable()
export class TemplateEffects {
  constructor(
    private actions$: Actions,
    private yourTemplateService: YourTemplateService
  ) {}

  loadTemplates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TemplateActions.loadTemplates),
      tap(action => console.log('Load templates action dispatched:', action)),
      mergeMap((action) =>
        this.yourTemplateService
          .getTemplates(
            action.page_number,
            action.limit
          )
          .pipe(
            tap(response => console.log('Load templates service response:', response)),
            map((response) => {
              console.log('Dispatching load templates success:', response);
              return TemplateActions.loadTemplatesSuccess({
                templates: response,
              });
            }),
            catchError((error) => {
              console.error('Load templates effect error:', error);
              return of(TemplateActions.loadTemplatesFailure({ error }));
            })
          )
      )
    )
  );

  createTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TemplateActions.createTemplate),
      tap(action => console.log('Create template action dispatched:', action)),
      mergeMap((action) =>
        this.yourTemplateService.createTemplate(action.request).pipe(
          tap(response => console.log('Create template service response:', response)),
          map((template) => {
            console.log('Dispatching create template success:', template);
            return TemplateActions.createTemplateSuccess({ template });
          }),
          catchError((error) => {
            console.error('Create template effect error:', error);
            return of(TemplateActions.createTemplateFailure({ error }));
          })
        )
      )
    )
  );

  createTemplateWithWorkingStructure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TemplateActions.createTemplateWithWorkingStructure),
      tap(action => console.log('Create template with working structure action dispatched:', action)),
      mergeMap((action) =>
        this.yourTemplateService.createTemplateWithWorkingStructure(action.request).pipe(
          tap(response => console.log('Create template with working structure service response:', response)),
          map((template) => {
            console.log('Dispatching create template success:', template);
            return TemplateActions.createTemplateSuccess({ template });
          }),
          catchError((error) => {
            console.error('Create template with working structure effect error:', error);
            return of(TemplateActions.createTemplateFailure({ error }));
          })
        )
      )
    )
  );



  deleteTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TemplateActions.deleteTemplate),
      mergeMap((action) =>
        this.yourTemplateService
          .deleteTemplate(action.name, action.template_id)
          .pipe(
            map((response) =>
              TemplateActions.deleteTemplateSuccess({ response })
            ),
            catchError((error) =>
              of(TemplateActions.deleteTemplateFailure({ error }))
            )
          )
      )
    )
  );

  uploadMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TemplateActions.uploadMedia),
      tap(action => console.log('Upload media action dispatched:', action)),
      mergeMap((action) =>
        this.yourTemplateService.uploadMedia(action.file).pipe(
          tap(response => console.log('Upload media service response:', response)),
          map((response) =>
            TemplateActions.uploadMediaSuccess({
              response,
              mediaType: action.mediaType,
            })
          ),
          catchError((error) => {
            console.error('Upload media effect error:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              message: error.message
            });
            
            // Log the full error response if available
            if (error.error) {
              console.error('Server error response:', JSON.stringify(error.error, null, 2));
            }
            
            return of(TemplateActions.uploadMediaFailure({ error }));
          })
        )
      )
    )
  );

}
