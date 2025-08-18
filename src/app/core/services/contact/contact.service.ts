import { Injectable } from "@angular/core";
import { ApiService } from "../../api/api.service";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ContactModel, ContactUpdateRequest } from "../../models/contact.model";
import { ContactAttributesResponse } from "../../models/contact-attributes.model";
import { ContactTagsResponse } from "../../models/contact-tags.model";
import { NotesResponse, CreateNoteRequest } from "../../models/note.model";

@Injectable({
    providedIn: 'root',
})
export class ContactService {
    constructor(private apiService: ApiService) { }

    getContact(page: number, limit: number, searchTerm?: string): Observable<any> {
        let params = new HttpParams().set('page', page).set('limit', limit);

        if (searchTerm) {
            params = new HttpParams()
                .set('page', page)
                .set('limit', limit)
                .set('search', searchTerm);
        }
        return this.apiService.get('v1/contact/', { params });
    }

    createContact(name: string, phone_number: string, attributes: { name: string, value: string }[]): Observable<any> {
        return this.apiService.post('v1/contact/', { name, phone_number, attributes });
    }

    updateContact(contact: ContactModel): Observable<any> {
        console.log('Original contact data:', contact);
        
        // Transform ContactModel to ContactUpdateRequest format
        const updateRequest: ContactUpdateRequest = {
            id: contact.id,
            name: contact.name,
            phone_number: contact.country_code + contact.phone_number, // Combine country code with phone number
            source: 'WhatsApp', // Default source as shown in the UI
            allow_broadcast: contact.allow_broadcast,
            allow_sms: contact.allow_sms,
            contact_attributes: contact.attribute_links?.map(attr => ({
                name: attr.attribute.name,
                value: attr.value
            })) || [],
            contact_tags: contact.tag_links?.map(tag => ({
                name: tag.name || tag.tag?.name || ''
            })) || []
        };
        
        console.log('Sending update request:', updateRequest);
        return this.apiService.put(`v1/contact/`, updateRequest);
    }

    deleteContact(contactId: string): Observable<any> {
        let params = new HttpParams().set('contact_id', contactId);
        return this.apiService.delete('v1/contact/', { params });
    }

    getContactAttributes(contactId: string): Observable<ContactAttributesResponse> {
        return this.apiService.get(`v1/attributes/contact_id/${contactId}`);
    }

    getContactTags(contactId: string): Observable<ContactTagsResponse> {
        return this.apiService.get(`v1/tags/contact_id/${contactId}`);
    }

        createContactTag(tagData: { name: string; contact_id: string }): Observable<any> {
        return this.apiService.post('v1/tags/', tagData);
    }



    createContactAttribute(attributeData: { name: string; value: string; contact_id: string }): Observable<any> {
        return this.apiService.post(`v1/attributes/`, {
            name: attributeData.name,
            contact_id: attributeData.contact_id,
            value: attributeData.value
        });
    }

    getContactNotes(contactId: string, page: number = 1, limit: number = 10): Observable<NotesResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
         
        return this.apiService.get(`v1/notes/${contactId}`, { params });
    }

    createContactNote(noteData: CreateNoteRequest): Observable<any> {
        return this.apiService.post('v1/notes/', noteData);
    }

    updateContactNote(noteId: string, content: string): Observable<any> {
        let params = new HttpParams().set('content', content);
        return this.apiService.put(`v1/notes/${noteId}`, {}, { params });
    }

    deleteContactNote(noteId: string): Observable<any> {
        return this.apiService.delete(`v1/notes/${noteId}`);
    }

}
