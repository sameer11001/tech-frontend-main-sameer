import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { HttpParams } from '@angular/common/http';
import { NotesResponse, CreateNoteRequest, UpdateNoteRequest } from '../../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private apiService: ApiService) {}

  getNotes(contactId: string, page: number = 1, limit: number = 10): Observable<NotesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
     
    return this.apiService.get(`v1/notes/${contactId}`, { params });
  }

  createNote(noteData: CreateNoteRequest): Observable<any> {
    return this.apiService.post('v1/notes/', noteData);
  }

  updateNote(noteId: string, content: string): Observable<any> {
    // Send content as query parameter, not in request body
    let params = new HttpParams().set('content', content);
    return this.apiService.put(`v1/notes/${noteId}`, {}, { params });
  }

  deleteNote(noteId: string): Observable<any> {
    return this.apiService.delete(`v1/notes/${noteId}`);
  }
} 