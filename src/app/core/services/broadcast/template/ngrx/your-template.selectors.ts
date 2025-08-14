import { createSelector } from '@ngrx/store';
import { TemplateState } from './your-template.reducer';

export const getTemplateState = (state: any) => state.whatsappTemplates;

export const selectTemplates = createSelector(
  getTemplateState,
  (state) => {
    console.log('Selector - Full state:', state);
    console.log('Selector - state.templates:', state.templates);
    
    // Handle the actual API response structure: {data: {templates: {data: Array}}}
    if (state.templates?.data?.templates?.data && Array.isArray(state.templates.data.templates.data)) {
      return { data: state.templates.data.templates.data };
    }
    
    // Fallback for different response structures
    if (state.templates?.data && Array.isArray(state.templates.data)) {
      return { data: state.templates.data };
    }
    
    // Default fallback
    return { data: [] };
  }
);

export const selectTemplateLoading = createSelector(
  getTemplateState,
  (state) => state.loading
);

export const selectTemplateError = createSelector(
  getTemplateState,
  (state) => state.error
);

export const selectCreateNewTemplate = createSelector(
  getTemplateState,
  (state) => state.createNewTemplate
);

export const selectNewTemplateError = createSelector(
  getTemplateState,
  (state) => state.newTemplateError
);

export const selectMediaIds = createSelector(
  getTemplateState,
  (state) => state.mediaIds
);


