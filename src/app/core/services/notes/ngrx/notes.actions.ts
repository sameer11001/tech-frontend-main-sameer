import { createAction, props } from '@ngrx/store';
import { Note } from '../../../models/note.model';

// Get Notes Actions
export const getNotes = createAction(
  '[Notes] Get Notes',
  props<{ contactId: string; page: number; limit: number }>()
);

export const getNotesSuccess = createAction(
  '[Notes] Get Notes Success',
  props<{ data: any }>()
);

export const getNotesError = createAction(
  '[Notes] Get Notes Error',
  props<{ error: any }>()
);

// Create Note Actions
export const createNote = createAction(
  '[Notes] Create Note',
  props<{ content: string; contact_id?: string }>()
);

export const createNoteSuccess = createAction(
  '[Notes] Create Note Success',
  props<{ data: any }>()
);

export const createNoteError = createAction(
  '[Notes] Create Note Error',
  props<{ error: any }>()
);

// Update Note Actions
export const updateNote = createAction(
  '[Notes] Update Note',
  props<{ noteId: string; content: string }>()
);

export const updateNoteSuccess = createAction(
  '[Notes] Update Note Success',
  props<{ data: any }>()
);

export const updateNoteError = createAction(
  '[Notes] Update Note Error',
  props<{ error: any }>()
);

// Delete Note Actions
export const deleteNote = createAction(
  '[Notes] Delete Note',
  props<{ noteId: string }>()
);

export const deleteNoteSuccess = createAction(
  '[Notes] Delete Note Success',
  props<{ data: any }>()
);

export const deleteNoteError = createAction(
  '[Notes] Delete Note Error',
  props<{ error: any }>()
); 