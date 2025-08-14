import { createReducer, on } from '@ngrx/store';
import * as TemplateActions from './your-template.actions';
import { TemplateResponse, WhatsAppTemplateResponse } from '../../../../models/whatsapp-twmplate.model';

export interface TemplateState {
  templates: WhatsAppTemplateResponse | null;
  loading: boolean;
  error: any;
  createNewTemplate: boolean;
  newTemplateError: any;
  mediaIds: { [key: string]: string };
}

export const initialState: TemplateState = {
  templates: null,
  loading: false,
  error: null,
  createNewTemplate: false,
  newTemplateError: null,
  mediaIds: {}
};

export const templateReducer = createReducer(
  initialState,
  on(TemplateActions.loadTemplates, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TemplateActions.loadTemplatesSuccess, (state, { templates }) => ({
    ...state,
    templates,
    loading: false,
  })),
  on(TemplateActions.loadTemplatesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(TemplateActions.createTemplate, (state) => ({
    ...state,
    createNewTemplate: true,
    newTemplateError: null,
  })),
  on(TemplateActions.createTemplateSuccess, (state) => ({
    ...state,
    createNewTemplate: false,
    newTemplateError: null,
  })),
  on(TemplateActions.createTemplateFailure, (state, { error }) => ({
    ...state,
    createNewTemplate: false,
    newTemplateError: error,
  })),

  on(TemplateActions.uploadMedia, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(TemplateActions.uploadMediaSuccess, (state, { response, mediaType }) => {
    // Handle the new template media upload response format
    let mediaId: string = '';

    console.log('Reducer - Full template upload response:', response);
    console.log('Reducer - Response data:', response?.data);

    // Extract media ID from the new response format: response.data.h
    if (response?.data?.h) {
      mediaId = response.data.h;
      console.log('Reducer - Extracted media ID from response.data.h:', mediaId);
    } else {
      console.warn('Could not extract media ID from template upload response:', response);
      console.log('Reducer - Available response paths:', {
        'response.data.h': response?.data?.h,
        'response.data': response?.data,
        'response': response
      });
      mediaId = '';
    }

    console.log('Reducer - Final media ID for', mediaType, ':', mediaId);

    return {
      ...state,
      loading: false,
      mediaIds: {
        ...state.mediaIds,
        [mediaType]: mediaId, // Store the media ID by type
      },
    };
  }),
  on(TemplateActions.uploadMediaFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);
