// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { NewChatDialogComponent } from './new-chat-dialog/new-chat-dialog.component';

// @Component({
//   selector: 'app-chat-list-header',
//   imports: [CommonModule],
//   templateUrl: './chat-list-header.component.html',
//   styleUrl: './chat-list-header.component.css'
// })
// export class ChatListHeaderComponent {
//   isDropdownOpen = false;

//   constructor(private dialog: MatDialog) {}

//   toggleDropdown() {
//     this.isDropdownOpen = !this.isDropdownOpen;
//   }

//   onNewChat() {
//     const dialogRef = this.dialog.open(NewChatDialogComponent, {
//       width: 'auto',
//       data: {}  // you can pass data to your dialog here
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if (result) {
//         console.log('New chat data:', result);
//         // TODO: actually create a new chat with `result`
//       }
//     });
//   }
  
// }
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NewChatDialogComponent } from './new-chat-dialog/new-chat-dialog.component';
import * as ConversationsActions from '../../../../../../../../core/services/conversations/ngrx/conversations.actions'; 
import { Observable } from 'rxjs';
import { selectConversationsTotalItems } from '../../../../../../../../core/services/conversations/ngrx/conversations.selectors';

@Component({
  selector: 'app-chat-list-header',
  imports: [CommonModule],
  templateUrl: './chat-list-header.component.html',
  styleUrl: './chat-list-header.component.css'
})
export class ChatListHeaderComponent {
  isDropdownOpen = false;
  searchTerm: string = '';
  totalItems$: Observable<number>;
  constructor(private dialog: MatDialog, private store: Store) {
    this.totalItems$ = this.store.select(selectConversationsTotalItems);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onNewChat() {
    const dialogRef = this.dialog.open(NewChatDialogComponent, {
      width: 'auto',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New chat data:', result);
        // TODO: actually create a new chat with `result`
      }
    });
  }

  // 🔎 Called when user types in the search box
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;

    // Dispatch action with search term
    this.store.dispatch(
      ConversationsActions.loadConversations({
        page: 1,
        size: 20,         // adjust page size as needed
        search_terms: this.searchTerm || null
      })
    );
  }
}
