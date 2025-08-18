import { createReducer, on } from '@ngrx/store';
import * as ChatbotActions from './chatbot.actions';

export interface ChatbotState {
loading: boolean;
error: any;
data: any;

}

const initialState: ChatbotState = {
  loading: false,
  error: null,
  data: null
};


export const chatbotReducer = createReducer(

  // Create Chatbot Meta Data
  on(ChatbotActions.createChatbotMetaData, state => state),
  on(ChatbotActions.createChatbotMetaDataSuccess, (state, { data }) => state),
  on(ChatbotActions.createChatbotMetaDataError, (state, { error }) => state),

  // Get Chatbot Meta Data
  on(ChatbotActions.getChatbotMetaData, state => state),
  on(ChatbotActions.getChatbotMetaDataSuccess, (state, { data }) => state),
  on(ChatbotActions.getChatbotMetaDataError, (state, { error }) => state),

  // Update Chatbot Meta Data
  on(ChatbotActions.updateChatbotMetaData, state => state),
  on(ChatbotActions.updateChatbotMetaDataSuccess, (state, { data }) => state),
  on(ChatbotActions.updateChatbotMetaDataError, (state, { error }) => state),

  // Delete Chatbot
  on(ChatbotActions.deleteChatbot, state => state),
  on(ChatbotActions.deleteChatbotSuccess, (state, { data }) => state),
  on(ChatbotActions.deleteChatbotError, (state, { error }) => state),

  // Update chatbot flow nodes
  on(ChatbotActions.updateChatbotFlowNodes, state => state),
  on(ChatbotActions.updateChatbotFlowNodesSuccess, (state, { data }) => state),
  on(ChatbotActions.updateChatbotFlowNodesError, (state, { error }) => state),

  // Trigger chatbot
  on(ChatbotActions.triggerChatbot, state => state),
  on(ChatbotActions.triggerChatbotSuccess, (state, { data }) => state),
  on(ChatbotActions.triggerChatbotError, (state, { error }) => state),
);
