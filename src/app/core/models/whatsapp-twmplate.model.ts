export type TemplateStatus = 'APPROVED' | 'PENDING_DELETION' | 'REJECTED' | 'DRAFT' | 'PAUSED' | 'DISABLED';

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: string | null;
  text?: string | null;
  example?: {
    header_handle:string[];
  } | null;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE';
    text: string;
  }> | null;
}

export interface WhatsAppTemplate {
  _id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  language: string;
  status: TemplateStatus;
  category: string;
  previous_category?: string;
  template_wat_id?: string;
  components: TemplateComponent[];
  reason?: string;
  client_id?: string;
  created_at?: string;
  updated_at?: string;
  cdnUrl?: string; // TODO: Future API response will include this field for image templates
}

export interface Paging {
  cursors: {
    before?: string;
    after?: string;
  };
}

export interface WhatsAppTemplateResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: AllTemplatesResponse;
  paging?: Paging;
}
export interface AllTemplatesResponse {
  templates: TemplateResponse;
}

export interface TemplateResponse {
  data: WhatsAppTemplate[];
  paging?: Paging;
}
