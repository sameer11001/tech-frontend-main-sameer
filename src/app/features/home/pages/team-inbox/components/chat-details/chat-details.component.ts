import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, takeUntil, take } from 'rxjs';
import { Conversation } from '../../../../../../core/models/conversation.model';
import { ContactAttribute } from '../../../../../../core/models/contact-attributes.model';
import { ContactTag } from '../../../../../../core/models/contact-tags.model';
import { Note } from '../../../../../../core/models/note.model';
import { 
    getContactAttributes, 
    getContactTags,
    getContactNotes,
    createContactNote,
    updateContactNote,
    deleteContactNote
} from '../../../../../../core/services/contact/ngrx/contact.actions';
import { 
    selectContactAttributes, 
    selectContactAttributesLoading,
    selectContactTags, 
    selectContactTagsLoading,
    selectContactNotes,
    selectContactNotesLoading
} from '../../../../../../core/services/contact/ngrx/contact.selectors';
import { selectAuthUser } from '../../../../../../core/services/auth/ngrx/auth.selector';
import { SkeletonLoaderComponent } from '../../../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { TagsDialogComponent } from './components/tags-dialog/tags-dialog.component';
import { AttributesDialogComponent } from './components/attributes-dialog/attributes-dialog.component';

@Component({
  selector: 'app-chat-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './chat-details.component.html',
  styleUrl: './chat-details.component.css'
})
export class ChatDetailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() conversation!: Conversation;
  @Input() conversationId: string = '';
  @Input() contactName: string = '';

  // Observables for contact attributes and tags
  contactAttributes$: Observable<ContactAttribute[]>;
  contactAttributesLoading$: Observable<boolean>;
  contactTags$: Observable<ContactTag[]>;
  contactTagsLoading$: Observable<boolean>;
  contactNotes$: Observable<Note[]>;
  contactNotesLoading$: Observable<boolean>;

  // Notes functionality
  showNoteInput = false;
  noteContent = '';
  currentUser$: Observable<any>;
  
  // Note editing
  editingNoteId: string | null = null;
  editingContent = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Track if data has been loaded for current contact
  private currentContactId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog
  ) {
    this.contactAttributes$ = this.store.select(selectContactAttributes);
    this.contactAttributesLoading$ = this.store.select(selectContactAttributesLoading);
    this.contactTags$ = this.store.select(selectContactTags);
    this.contactTagsLoading$ = this.store.select(selectContactTagsLoading);
    this.contactNotes$ = this.store.select(selectContactNotes);
    this.contactNotesLoading$ = this.store.select(selectContactNotesLoading);
    this.currentUser$ = this.store.select(selectAuthUser);
  }

  ngOnInit() {
    // Load contact attributes and tags when conversation changes
    if (this.conversation?.contact_id) {
      this.loadContactData();
    }
  }

  ngOnChanges() {
    // Reload data when conversation changes
    if (this.conversation?.contact_id && this.conversation.contact_id !== this.currentContactId) {
      this.loadContactData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContactData() {
    if (this.conversation?.contact_id && this.conversation.contact_id !== this.currentContactId) {
      this.currentContactId = this.conversation.contact_id;
      
      this.store.dispatch(getContactAttributes({ 
        contactId: this.conversation.contact_id, 
      }));
      
      this.store.dispatch(getContactTags({ 
        contactId: this.conversation.contact_id, 
      }));

      this.store.dispatch(getContactNotes({ 
        contactId: this.conversation.contact_id,
        page: this.currentPage,
        limit: this.pageSize
      }));
      
      // Reset pagination when loading new contact
      this.currentPage = 1;
    }
  }

  openTagsDialog() {
    // Use cached data from store, no need to fetch again
    // Use take(1) to ensure subscription only fires once when dialog is opened
    this.contactTags$.pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(tags => {
      const dialogRef = this.dialog.open(TagsDialogComponent, {
        width: '500px',
        data: {
          tags: tags,
          contactName: this.conversation.contact_name,
          contactId: this.conversation.contact_id
        }
      });

      dialogRef.afterClosed().pipe(
        take(1),
        takeUntil(this.destroy$)
      ).subscribe((result: any) => {
        // Only refresh if new tags were actually added
        if (result?.refresh && result?.dataChanged) {
          this.loadContactData();
        }
      });
    });
  }

  openAttributesDialog() {
    // Use cached data from store, no need to fetch again
    // Use take(1) to ensure subscription only fires once when dialog is opened
    this.contactAttributes$.pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(attributes => {
      const dialogRef = this.dialog.open(AttributesDialogComponent, {
        width: '600px',
        data: {
          attributes: attributes,
          contactName: this.conversation.contact_name,
          contactId: this.conversation.contact_id
        }
      });

      dialogRef.afterClosed().pipe(
        take(1),
        takeUntil(this.destroy$)
      ).subscribe((result: any) => {
        // Only refresh if new attributes were actually added
        if (result?.refresh && result?.dataChanged) {
          this.loadContactData();
        }
      });
    });
  }

  // Notes functionality
  toggleNoteInput() {
    this.showNoteInput = !this.showNoteInput;
    if (!this.showNoteInput) {
      this.noteContent = '';
    }
  }

  addNote() {
    if (this.noteContent.trim() && this.conversation?.contact_id) {
      // Get current user data
      this.currentUser$.pipe(take(1)).subscribe(currentUser => {
        const noteData = {
          content: this.noteContent.trim(),
          contact_id: this.conversation.contact_id
        };

        this.store.dispatch(createContactNote({ 
          noteData,
          user: currentUser?.data || currentUser
        }));
        
        // Reset form
        this.noteContent = '';
        this.showNoteInput = false;
      });
    }
  }

  cancelNote() {
    this.noteContent = '';
    this.showNoteInput = false;
  }

  // Edit note functionality
  startEditNote(note: any) {
    this.editingNoteId = note.id;
    this.editingContent = note.content;
  }

  saveEditNote() {
    if (this.editingNoteId && this.editingContent.trim()) {
      this.store.dispatch(updateContactNote({
        noteId: this.editingNoteId,
        content: this.editingContent.trim()
      }));
      
      this.cancelEditNote();
    }
  }

  cancelEditNote() {
    this.editingNoteId = null;
    this.editingContent = '';
  }

  deleteNote(noteId: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.store.dispatch(deleteContactNote({ noteId }));
    }
  }

  loadMoreNotes() {
    this.currentPage++;
    this.store.dispatch(getContactNotes({ 
      contactId: this.conversation.contact_id,
      page: this.currentPage,
      limit: this.pageSize
    }));
  }
}
