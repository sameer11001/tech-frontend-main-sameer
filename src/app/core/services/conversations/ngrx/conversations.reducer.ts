import { createReducer, on } from '@ngrx/store';
import * as ConversationsActions from './conversations.actions';
import { Conversation, Meta } from '../../../models/conversation.model';

export interface ConversationsState {
  conversations: Conversation[];
  meta: Meta | null;
  loading: boolean;
  error: any;
}

export const initialConversationsState: ConversationsState = {
  conversations: [],
  meta: null,
  loading: false,
  error: null,
};

export const conversationsReducer = createReducer(
  initialConversationsState,

  on(ConversationsActions.loadConversations, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    ConversationsActions.loadConversationsSuccess,
    (state, { conversations, meta }) => ({
      ...state,
      conversations,
      meta,
      loading: false,
    })
  ),

  on(ConversationsActions.loadConversationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(
    ConversationsActions.updateLastMessage,
    (state, { conversationId, lastMessage, lastMessageTimestamp }) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              last_message: lastMessage,
              last_message_time: lastMessageTimestamp.toString(),
            }
          : conversation
      ),
    })
  ),

  on(ConversationsActions.sortConversations, (state, { conversationId }) => {
    const top = state.conversations.find((c) => c.id === conversationId);
    const others = state.conversations
      .filter((c) => c.id !== conversationId)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    return {
      ...state,
      conversations: top ? [top, ...others] : others,
    };
  }),

  on(
    ConversationsActions.updateConversationStatusLocally,
    (state, { conversationId, status }) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, status }
          : conversation
      ),
    })
  ),

  on(ConversationsActions.assignConversationSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(
    ConversationsActions.assignConversationFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  ),

  on(
    ConversationsActions.updateConversationUserAssignment,
    (state, { conversationId, userId }) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, assignments_id: userId }
          : conversation
      ),
    })
  ),

  on(
    ConversationsActions.updateConversationExpiration,
    (state, { conversationId, expirationTime, isExpired }) => ({
      ...state,
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              conversation_expiration_time: expirationTime,
              conversation_is_expired: isExpired,
            }
          : conversation
      ),
    })
  )
);
