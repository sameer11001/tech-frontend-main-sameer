import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { NotesService } from '../notes.service';
import { CreateNoteRequest } from '../../../models/note.model';
import * as NotesActions from './notes.actions';

@Injectable()
export class NotesEffects {
  constructor(
    private actions$: Actions,
    private notesService: NotesService
  ) {}

  getNotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotesActions.getNotes),
      mergeMap(({ contactId, page, limit }) =>
        this.notesService.getNotes(contactId, page, limit).pipe(
          map((data) => NotesActions.getNotesSuccess({ data })),
          catchError((error) =>
            of(NotesActions.getNotesError({ error }))
          )
        )
      )
    )
  );

  createNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotesActions.createNote),
      mergeMap(({ content, contact_id }) => {
        const noteData: CreateNoteRequest = { content, contact_id };
        return this.notesService.createNote(noteData).pipe(
          map((data) => NotesActions.createNoteSuccess({ data })),
          catchError((error) =>
            of(NotesActions.createNoteError({ error }))
          )
        );
      })
    )
  );

  updateNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotesActions.updateNote),
      mergeMap(({ noteId, content }) =>
        this.notesService.updateNote(noteId, content).pipe(
          map((data) => NotesActions.updateNoteSuccess({ data })),
          catchError((error) =>
            of(NotesActions.updateNoteError({ error }))
          )
        )
      )
    )
  );

  deleteNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotesActions.deleteNote),
      mergeMap(({ noteId }) =>
        this.notesService.deleteNote(noteId).pipe(
          map((data) => NotesActions.deleteNoteSuccess({ data })),
          catchError((error) =>
            of(NotesActions.deleteNoteError({ error }))
          )
        )
      )
    )
  );
} 