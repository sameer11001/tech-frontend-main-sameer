// import { Injectable } from '@angular/core';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { ConversationsService } from '../conversations.service';
// import * as ConversationsActions from './conversations.actions';
// import {
//   catchError,
//   filter,
//   map,
//   switchMap,
//   withLatestFrom,
// } from 'rxjs/operators';
// import { of } from 'rxjs';
// import { select, Store } from '@ngrx/store';
// import { selectAllConversations } from './conversations.selectors';

// @Injectable()
// export class ConversationsEffects {
//   constructor(
//     private actions$: Actions,
//     private store: Store,
//     private conversationsService: ConversationsService
//   ) {}

//   loadConversations$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(ConversationsActions.loadConversations),
//       switchMap(({ page, size }) =>
//         this.conversationsService.getConversations(page, size).pipe(
//           map((response) =>
//             ConversationsActions.loadConversationsSuccess({
//               conversations: response.data,
//               meta: response.meta,
//             })
//           ),
//           catchError((error) =>
//             of(ConversationsActions.loadConversationsFailure({ error }))
//           )
//         )
//       )
//     )
//   );

//   loadIfMissing$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(ConversationsActions.sortConversations),
//       withLatestFrom(this.store.pipe(select(selectAllConversations))),
//       filter(
//         ([{ conversationId }, list]) =>
//           !list.some((c) => c.id === conversationId)
//       ),
//       map(() => ConversationsActions.loadConversations({ page: 1, size: 10 }))
//     )
//   );

//   updateConversationStatus$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(ConversationsActions.updateConversationStatus),
//       switchMap(({ conversationId, status }) =>
//         this.conversationsService.changeConversationStatus(conversationId, status).pipe(
//           map(() => ConversationsActions.updateConversationStatusSuccess()),
//           catchError((error) =>
//             of(ConversationsActions.updateConversationStatusFailure({ error }))
//           )
//         )
//       )
//     )
//   );

//   assignConversation$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(ConversationsActions.assignConversation),
//       switchMap(({ conversationId, userId }) =>
//         this.conversationsService.assignConversation(conversationId, userId).pipe(
//           map(() => ConversationsActions.assignConversationSuccess()),
//           catchError((error) =>
//             of(ConversationsActions.updateConversationStatusFailure({ error }))
//           )
//         )
//       )
//     )
//   );

  
// }

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ConversationsService } from '../conversations.service';
import * as ConversationsActions from './conversations.actions';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectAllConversations } from './conversations.selectors';

@Injectable()
export class ConversationsEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private conversationsService: ConversationsService
  ) {}

  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationsActions.loadConversations),
      // ⬇️ include search_terms from the action
      switchMap(({ page, size, search_terms }) =>
        this.conversationsService.getConversations(page, size, search_terms ?? null).pipe(
          map((response) =>
            ConversationsActions.loadConversationsSuccess({
              conversations: response.data,
              meta: response.meta,
            })
          ),
          catchError((error) =>
            of(ConversationsActions.loadConversationsFailure({ error }))
          )
        )
      )
    )
  );

  loadIfMissing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationsActions.sortConversations),
      withLatestFrom(this.store.pipe(select(selectAllConversations))),
      filter(([{ conversationId }, list]) => !list.some((c) => c.id === conversationId)),
      // ⬇️ explicitly provide null for search_terms to satisfy the props shape
      map(() => ConversationsActions.loadConversations({ page: 1, size: 10, search_terms: null }))
    )
  );

  updateConversationStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationsActions.updateConversationStatus),
      switchMap(({ conversationId, status }) =>
        this.conversationsService.changeConversationStatus(conversationId, status).pipe(
          map(() => ConversationsActions.updateConversationStatusSuccess()),
          catchError((error) =>
            of(ConversationsActions.updateConversationStatusFailure({ error }))
          )
        )
      )
    )
  );

  assignConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationsActions.assignConversation),
      switchMap(({ conversationId, userId }) =>
        this.conversationsService.assignConversation(conversationId, userId).pipe(
          map(() => ConversationsActions.assignConversationSuccess()),
          catchError((error) =>
            of(ConversationsActions.assignConversationFailure({ error }))
          )
        )
      )
    )
  );
}
