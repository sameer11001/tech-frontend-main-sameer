import { Injectable } from "@angular/core";
import { ContactService } from "../contact.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { 
    createContact, createContactError, createContactSuccess, 
    deleteContact, deleteContactSuccess, 
    getContacts, getContactsError, getContactsSuccess,
    getContactAttributes, getContactAttributesSuccess, getContactAttributesError,
    getContactTags, getContactTagsSuccess, getContactTagsError,
    getContactNotes, getContactNotesSuccess, getContactNotesError,
    createContactNote, createContactNoteSuccess, createContactNoteError,
    updateContactNote, updateContactNoteSuccess, updateContactNoteError,
    deleteContactNote, deleteContactNoteSuccess, deleteContactNoteError
} from "./contact.actions";



@Injectable({
    providedIn: "root"
})
export class ContactEffects {

    constructor(
        private actions$: Actions,
        private contactService: ContactService
    ) { }

    loadContact$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getContacts),
            mergeMap(({ page, limit, searchTerm }) =>
                this.contactService.getContact(page, limit, searchTerm).pipe(
                    map((data) => getContactsSuccess({ data: data.data })),
                    catchError((error) =>
                        of(getContactsError({ error }))
                    )
                )
            )
        )
    );

    createContact$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createContact),
            mergeMap(({ name, phone_number, attributes }) =>
                this.contactService.createContact(name, phone_number, attributes).pipe(
                    map((data) => createContactSuccess({ data: data.data })),
                    catchError((error) =>
                        of(createContactError({ error }))
                    )
                )
            )
        )
    );

    deleteContact$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteContact),
            mergeMap(({ id }) =>
                this.contactService.deleteContact(id).pipe(
                    map((data) => deleteContactSuccess({ data: data.data })),
                    catchError((error) =>
                        of(getContactsError({ error }))
                    )
                )
            )
        )
    );

    // Contact Attributes Effects
    loadContactAttributes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getContactAttributes),
            mergeMap(({ contactId}) =>
                this.contactService.getContactAttributes(contactId).pipe(
                    map((data) => getContactAttributesSuccess({ data })),
                    catchError((error) =>
                        of(getContactAttributesError({ error }))
                    )
                )
            )
        )
    );

    // Contact Tags Effects
                loadContactTags$ = createEffect(() =>
                this.actions$.pipe(
                    ofType(getContactTags),
                    mergeMap(({ contact_id }) =>
                        this.contactService.getContactTags(contact_id).pipe(
                            map((data) => getContactTagsSuccess({ data })),
                            catchError((error) =>
                                of(getContactTagsError({ error }))
                            )
                        )
                    )
                )
            );

            loadContactNotes$ = createEffect(() =>
                this.actions$.pipe(
                    ofType(getContactNotes),
                    mergeMap(({ contactId, page = 1, limit = 10 }) =>
                        this.contactService.getContactNotes(contactId, page, limit).pipe(
                            map((data) => getContactNotesSuccess({ data })),
                            catchError((error) =>
                                of(getContactNotesError({ error }))
                            )
                        )
                    )
                )
            );

            createContactNote$ = createEffect(() =>
                this.actions$.pipe(
                    ofType(createContactNote),
                    mergeMap(({ noteData }) =>
                        this.contactService.createContactNote(noteData).pipe(
                            map((data) => createContactNoteSuccess({ data })),
                            catchError((error) =>
                                of(createContactNoteError({ error }))
                            )
                        )
                    )
                )
            );

            updateContactNote$ = createEffect(() =>
                this.actions$.pipe(
                    ofType(updateContactNote),
                    mergeMap(({ noteId, content }) =>
                        this.contactService.updateContactNote(noteId, content).pipe(
                            map((data) => updateContactNoteSuccess({ data })),
                            catchError((error) =>
                                of(updateContactNoteError({ error }))
                            )
                        )
                    )
                )
            );

            deleteContactNote$ = createEffect(() =>
                this.actions$.pipe(
                    ofType(deleteContactNote),
                    mergeMap(({ noteId }) =>
                        this.contactService.deleteContactNote(noteId).pipe(
                            map((data) => deleteContactNoteSuccess({ data })),
                            catchError((error) =>
                                of(deleteContactNoteError({ error }))
                            )
                        )
                    )
                )
            );
}