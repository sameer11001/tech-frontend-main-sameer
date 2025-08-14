import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../api/api.service';
import {
  WhatsAppTemplateResponse,
} from '../../../models/whatsapp-twmplate.model';
import {
  CreateTemplateRequest,
  WorkingTemplateRequest,
} from '../../../models/whatsapp-yourtemplate.model';


@Injectable({
  providedIn: 'root',
})
export class YourTemplateService {
  constructor(private apiService: ApiService) {}

  getTemplates(
    page_number?: number,
    limit?: number
  ): Observable<WhatsAppTemplateResponse> {
    console.log('YourTemplateService.getTemplates called with:', { page_number, limit });
    
    let params = new HttpParams();
    if (page_number) {
      params = params.set('page', page_number);
    }
    
    if (limit) {
      params = params.set('limit', limit);
    }
    
    console.log('Making API call to: v1/template/ with params:', params.toString());
    
    return this.apiService.get<WhatsAppTemplateResponse>('v1/template/', {
      params,
    }).pipe(
      tap(response => console.log('API response received:', response)),
      catchError(error => {
        console.error('API call failed:', error);
        throw error;
      })
    );
  }

  createTemplate(
    createTemplateRequest: CreateTemplateRequest
  ): Observable<WhatsAppTemplateResponse> {
    console.log('Creating template with request:', createTemplateRequest);
    console.log('Request URL:', `${this.apiService['baseUrl']}/v1/template/`);
    
    return this.apiService.post<WhatsAppTemplateResponse>(
      'v1/template/',
      createTemplateRequest
    ).pipe(
      tap(response => console.log('Template creation response:', response)),
      catchError(error => {
        console.error('Template creation error:', error);
        throw error;
      })
    );
  }

  createTemplateWithWorkingStructure(
    workingTemplateRequest: WorkingTemplateRequest
  ): Observable<WhatsAppTemplateResponse> {
    console.log('Creating template with working structure request:', workingTemplateRequest);
    console.log('Request URL:', `${this.apiService['baseUrl']}/v1/template/`);
    
    return this.apiService.post<WhatsAppTemplateResponse>(
      'v1/template/',
      workingTemplateRequest
    ).pipe(
      tap(response => console.log('Template creation with working structure response:', response)),
      catchError(error => {
        console.error('Template creation with working structure error:', error);
        throw error;
      })
    );
  }



  deleteTemplate(name: string, template_id?: string): Observable<any> {
    let params = new HttpParams();
    if (template_id) {
      params = params.set('template_id', template_id);
    }
    return this.apiService.delete<any>(`v1/template/${name}`, { params });
  }

  uploadMedia(file: FormData): Observable<any> {
    console.log('Uploading media with FormData:', file);
    
    // Debug: Log all FormData entries
    console.log('=== FormData Debug ===');
    for (let [key, value] of file.entries()) {
      console.log(`FormData entry - ${key}:`, value);
      if (value instanceof File) {
        console.log(`  File details - name: ${value.name}, size: ${value.size}, type: ${value.type}`);
      }
    }
    console.log('=== End FormData Debug ===');
    
    // Remove token from FormData if present (interceptor will handle auth)
    const token = file.get('token') as string;
    if (token) {
      console.log('Token found in FormData, removing to avoid duplication');
      file.delete('token');
    }
    
    // Use the new template media upload endpoint
    return this.apiService.post<any>('v1/media/upload-template-media', file,{isMultipart: true}).pipe(
      tap(response => console.log('Template media upload response:', response)),
      catchError(error => {
        console.error('Template media upload error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });
        
        // Log the full error response if available
        if (error.error) {
          console.error('Server error response:', JSON.stringify(error.error, null, 2));
        }
        
        throw error;
      })
    );
  }

}
