// contact.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { 
    getContacts, getContactsSuccess, getContactsError, 
    deleteContact, deleteContactSuccess, deleteContactError, 
    createContact, createContactError, createContactSuccess,
    getContactAttributes, getContactAttributesSuccess, getContactAttributesError,
    getContactTags, getContactTagsSuccess, getContactTagsError,
    getContactNotes, getContactNotesSuccess, getContactNotesError,
    createContactNote, createContactNoteSuccess, createContactNoteError,
    updateContactNote, updateContactNoteSuccess, updateContactNoteError,
    deleteContactNote, deleteContactNoteSuccess, deleteContactNoteError
} from './contact.actions';
import { ContactModel } from '../../../models/contact.model';
import { ContactAttribute } from '../../../models/contact-attributes.model';
import { ContactTag } from '../../../models/contact-tags.model';
import { Note } from '../../../models/note.model';

export interface Pagination {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export interface ContactState {
    contacts: ContactModel[];
    pagination: Pagination;
    loading: boolean;
    error: any;
    contactAttributes: ContactAttribute[];
    contactTags: ContactTag[];
    contactNotes: Note[];
    contactAttributesLoading: boolean;
    contactTagsLoading: boolean;
    contactNotesLoading: boolean;
}

export const initialState: ContactState = {
    contacts: [],
    pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    },
    loading: false,
    error: null,
    contactAttributes: [],
    contactTags: [],
    contactNotes: [],
    contactAttributesLoading: false,
    contactTagsLoading: false,
    contactNotesLoading: false
};

export const contactReducer = createReducer(
    initialState,
    on(getContacts, (state, { page, limit }) => ({
        ...state,
        loading: true,
        error: null,
        pagination: {
            ...state.pagination,
            currentPage: page,
            limit: limit
        }
    })),
    on(getContactsSuccess, (state, { data }) => ({
        ...state,
        loading: false,
        contacts: data.contacts,
        pagination: {
            ...state.pagination,
            totalCount: data.total_count,
            totalPages: data.total_pages
        }
    })),
    on(getContactsError, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(createContact, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(createContactSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(createContactError, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    on(deleteContact, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(deleteContactSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(deleteContactError, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),
    // Contact Attributes Reducers
    on(getContactAttributes, (state) => ({
        ...state,
        contactAttributesLoading: true,
        error: null
    })),
    on(getContactAttributesSuccess, (state, { data }) => ({
        ...state,
        contactAttributesLoading: false,
        contactAttributes: data.data?.attributes || []
    })),
    on(getContactAttributesError, (state, { error }) => ({
        ...state,
        contactAttributesLoading: false,
        error
    })),
    // Contact Tags Reducers
    on(getContactTags, (state) => ({
        ...state,
        contactTagsLoading: true,
        error: null
    })),
    on(getContactTagsSuccess, (state, { data }) => ({
        ...state,
        contactTagsLoading: false,
        contactTags: data.data?.tags || []
    })),
    on(getContactTagsError, (state, { error }) => ({
        ...state,
        contactTagsLoading: false,
        error
    })),
    // Contact Notes Reducers
    on(getContactNotes, (state) => ({
        ...state,
        contactNotesLoading: true,
        error: null
    })),
    on(getContactNotesSuccess, (state, { data }) => ({
        ...state,
        contactNotesLoading: false,
        // If it's the first page, replace notes. Otherwise, append them
        contactNotes: data.data?.page === 1 
            ? data.data?.notes || []
            : [...state.contactNotes, ...(data.data?.notes || [])]
    })),
    on(getContactNotesError, (state, { error }) => ({
        ...state,
        contactNotesLoading: false,
        error
    })),
    on(createContactNote, (state, { noteData, user }) => ({
        ...state,
        contactNotesLoading: true,
        error: null,
        // Add the note optimistically to the UI
        contactNotes: [...state.contactNotes, {
            id: Date.now().toString(), // Temporary ID
            content: noteData.content,
            updated_at: new Date().toISOString(),
            user: {
                id: user?.id || 'current-user-id',
                username: user?.username || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Current User',
                email: user?.email || 'current@example.com'
            }
        }]
    })),
    on(createContactNoteSuccess, (state, { data }) => ({
        ...state,
        contactNotesLoading: false
    })),
    on(createContactNoteError, (state, { error }) => ({
        ...state,
        contactNotesLoading: false,
        error,
        // Remove the optimistically added note on error
        contactNotes: state.contactNotes.slice(0, -1)
    })),
    // Update Note Reducers
    on(updateContactNote, (state, { noteId, content }) => ({
        ...state,
        contactNotesLoading: true,
        error: null,
        // Update the note optimistically in the UI
        contactNotes: state.contactNotes.map(note => 
            note.id === noteId 
                ? { ...note, content, updated_at: new Date().toISOString() }
                : note
        )
    })),
    on(updateContactNoteSuccess, (state, { data }) => ({
        ...state,
        contactNotesLoading: false
    })),
    on(updateContactNoteError, (state, { error }) => ({
        ...state,
        contactNotesLoading: false,
        error
    })),
    // Delete Note Reducers
    on(deleteContactNote, (state, { noteId }) => ({
        ...state,
        contactNotesLoading: true,
        error: null,
        // Remove the note optimistically from the UI
        contactNotes: state.contactNotes.filter(note => note.id !== noteId)
    })),
    on(deleteContactNoteSuccess, (state, { data }) => ({
        ...state,
        contactNotesLoading: false
    })),
    on(deleteContactNoteError, (state, { error }) => ({
        ...state,
        contactNotesLoading: false,
        error
    }))
);

