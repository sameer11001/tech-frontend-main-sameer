
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConversationsState } from './conversations.reducer';

export const selectConversationsFeature =
  createFeatureSelector<ConversationsState>('conversations');

export const selectAllConversations = createSelector(
  selectConversationsFeature,
  state => state.conversations
);

export const selectConversationsMeta = createSelector(
  selectConversationsFeature,
  state => state.meta
);

export const selectConversationsLoading = createSelector(
  selectConversationsFeature,
  state => state.loading
);

export const selectConversationsError = createSelector(
  selectConversationsFeature,
  state => state.error
);
