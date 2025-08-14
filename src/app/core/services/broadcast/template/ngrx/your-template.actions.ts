import { createAction, props } from '@ngrx/store';
import {
  TemplateResponse,
  WhatsAppTemplate,
  WhatsAppTemplateResponse,
} from '../../../../models/whatsapp-twmplate.model';
import { CreateTemplateRequest, WorkingTemplateRequest } from '../../../../models/whatsapp-yourtemplate.model';

export const loadTemplates = createAction(
  '[Template/API] Load Templates',
  props<{
    page_number?: number;
    limit?: number;
  }>()
);

export const loadTemplatesSuccess = createAction(
  '[Template/API] Load Templates Success',
  props<{ templates: WhatsAppTemplateResponse }>()
);

export const loadTemplatesFailure = createAction(
  '[Template/API] Load Templates Failure',
  props<{ error: any }>()
);

export const createTemplate = createAction(
  '[Template] Create Template',
  props<{ request: CreateTemplateRequest }>()
);

export const createTemplateWithWorkingStructure = createAction(
  '[Template] Create Template With Working Structure',
  props<{ request: WorkingTemplateRequest }>()
);

export const createTemplateSuccess = createAction(
  '[Template] Create Template Success',
  props<{ template: any }>()
);

export const createTemplateFailure = createAction(
  '[Template/API] Create Template Failure',
  props<{ error: any }>()
);



export const deleteTemplate = createAction(
  '[Template] Delete Template',
  props<{ name: string; template_id?: string }>()
);

export const deleteTemplateSuccess = createAction(
  '[Template] Delete Template Success',
  props<{ response: any }>()
);

export const deleteTemplateFailure = createAction(
  '[Template] Delete Template Failure',
  props<{ error: any }>()
);

export const uploadMedia = createAction(
  '[Template] Upload Media',
  props<{ file: FormData; mediaType: string }>()
);

export const uploadMediaSuccess = createAction(
  '[Template] Upload Media Success',
  props<{ response: any; mediaType: string }>()
);

export const uploadMediaFailure = createAction(
  '[Template] Upload Media Failure',
  props<{ error: any }>()
);
