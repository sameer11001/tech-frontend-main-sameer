import { createAction, props } from '@ngrx/store';

export const createChatbotMetaData = createAction(
  '[Chatbot] Create Chatbot',
  props<{ chatbot: any }>()
);

export const createChatbotMetaDataSuccess = createAction(
  '[Chatbot] Create Chatbot Success',
  props<{ data: any }>()
);

export const createChatbotMetaDataError = createAction(
  '[Chatbot] Create Chatbot Error',
  props<{ error: any }>()
);

export const getChatbotMetaData = createAction(
  '[Chatbot] Get Chatbot Meta Data',
  props<{ chatbotId: string }>()
);

export const getChatbotMetaDataSuccess = createAction(
  '[Chatbot] Get Chatbot Meta Data Success',
  props<{ data: any }>()
);

export const getChatbotMetaDataError = createAction(
  '[Chatbot] Get Chatbot Meta Data Error',
  props<{ error: any }>()
);

export const updateChatbotMetaData = createAction(
  '[Chatbot] Update Chatbot Meta Data',
  props<{ chatbot: any }>()
);

export const updateChatbotMetaDataSuccess = createAction(
  '[Chatbot] Update Chatbot Meta Data Success',
  props<{ data: any }>()
);

export const updateChatbotMetaDataError = createAction(
  '[Chatbot] Update Chatbot Meta Data Error',
  props<{ error: any }>()
);

export const deleteChatbot = createAction(
  '[Chatbot] Delete Chatbot Meta Data',
  props<{ chatbotId: string }>()
);

export const deleteChatbotSuccess = createAction(
  '[Chatbot] Delete Chatbot Meta Data Success',
  props<{ data: any }>()
);

export const deleteChatbotError = createAction(
  '[Chatbot] Delete Chatbot Meta Data Error',
  props<{ error: any }>()
);

export const updateChatbotFlowNodes = createAction(
  '[Chatbot] Update Chatbot Flow Nodes',
  props<{ flowNodes: any }>()
);

export const updateChatbotFlowNodesSuccess = createAction(
  '[Chatbot] Update Chatbot Flow Nodes Success',
  props<{ data: any }>()
);

export const updateChatbotFlowNodesError = createAction(
  '[Chatbot] Update Chatbot Flow Nodes Error',
  props<{ error: any }>()
);

export const triggerChatbot = createAction(
  '[Chatbot] Trigger Chatbot',
  props<{ chatbotId: string; message: string }>()
);

export const triggerChatbotSuccess = createAction(
  '[Chatbot] Trigger Chatbot Success',
  props<{ data: any }>()
);

export const triggerChatbotError = createAction(
  '[Chatbot] Trigger Chatbot Error',
  props<{ error: any }>()
);
