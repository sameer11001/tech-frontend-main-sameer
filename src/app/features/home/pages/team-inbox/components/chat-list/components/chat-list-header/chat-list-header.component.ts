import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewChatDialogComponent } from './new-chat-dialog/new-chat-dialog.component';

@Component({
  selector: 'app-chat-list-header',
  imports: [CommonModule],
  templateUrl: './chat-list-header.component.html',
  styleUrl: './chat-list-header.component.css'
})
export class ChatListHeaderComponent {
  isDropdownOpen = false;

  constructor(private dialog: MatDialog) {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onNewChat() {
    const dialogRef = this.dialog.open(NewChatDialogComponent, {
      width: 'auto',
      data: {}  // you can pass data to your dialog here
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New chat data:', result);
        // TODO: actually create a new chat with `result`
      }
    });
  }
}
