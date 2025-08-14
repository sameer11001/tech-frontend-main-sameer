import { createReducer, on } from '@ngrx/store';
import { Note } from '../../../models/note.model';
import * as NotesActions from './notes.actions';

export interface NotesState {
  notes: Note[];
  loading: boolean;
  error: any;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

export const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  hasNext: false
};

export const notesReducer = createReducer(
  initialState,
  
  // Get Notes
  on(NotesActions.getNotes, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NotesActions.getNotesSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    notes: data.data?.notes || [],
    totalCount: data.data?.total_count || 0,
    totalPages: data.data?.total_pages || 0,
    currentPage: data.data?.page || 1,
    hasNext: data.data?.has_next || false
  })),
  
  on(NotesActions.getNotesError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create Note
  on(NotesActions.createNote, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NotesActions.createNoteSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    notes: [data.data, ...state.notes]
  })),
  
  on(NotesActions.createNoteError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Update Note
  on(NotesActions.updateNote, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NotesActions.updateNoteSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    notes: state.notes.map(note => 
      note.id === data.data.id ? data.data : note
    )
  })),
  
  on(NotesActions.updateNoteError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Delete Note
  on(NotesActions.deleteNote, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NotesActions.deleteNoteSuccess, (state, { data }) => ({
    ...state,
    loading: false,
    notes: state.notes.filter(note => note.id !== data.data.id)
  })),
  
  on(NotesActions.deleteNoteError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 