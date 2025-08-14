import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ScheduledBroadcastState } from './scheduled-broadcast.reducer';

export const selectScheduledBroadcastState = createFeatureSelector<ScheduledBroadcastState>('scheduledBroadcast');

export const selectBroadcasts = createSelector(
  selectScheduledBroadcastState,
  (state) => state.broadcasts
);

export const selectBroadcastsLoading = createSelector(
  selectScheduledBroadcastState,
  (state) => state.loading
);

export const selectBroadcastsError = createSelector(
  selectScheduledBroadcastState,
  (state) => state.error
);

export const selectPublishLoading = createSelector(
  selectScheduledBroadcastState,
  (state) => state.publishLoading
);

export const selectPublishError = createSelector(
  selectScheduledBroadcastState,
  (state) => state.publishError
);

export const selectDeleteLoading = createSelector(
  selectScheduledBroadcastState,
  (state) => state.deleteLoading
);

export const selectDeleteError = createSelector(
  selectScheduledBroadcastState,
  (state) => state.deleteError
);

export const selectDeleteSuccess = createSelector(
  selectScheduledBroadcastState,
  (state) => state.deleteSuccess
); 