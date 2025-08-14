import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotesState } from './notes.reducer';

export const selectNotesState = createFeatureSelector<NotesState>('notes');

export const selectNotes = createSelector(
  selectNotesState,
  (state) => state.notes
);

export const selectNotesLoading = createSelector(
  selectNotesState,
  (state) => state.loading
);

export const selectNotesError = createSelector(
  selectNotesState,
  (state) => state.error
);

export const selectNotesPagination = createSelector(
  selectNotesState,
  (state) => ({
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    hasNext: state.hasNext
  })
); 