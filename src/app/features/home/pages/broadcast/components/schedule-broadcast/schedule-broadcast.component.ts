import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import * as ScheduledBroadcastActions from '../../../../../../core/services/broadcast/scheduled broadcast/ngrx/scheduled-broadcast.actions';
import {
  selectBroadcasts,
  selectBroadcastsLoading,
  selectBroadcastsError,
  selectDeleteLoading,
  selectDeleteSuccess,
} from '../../../../../../core/services/broadcast/scheduled broadcast/ngrx/scheduled-broadcast.selectors';
import { BroadcastResponse, BroadcastData } from '../../../../../../core/models/broadcast.model';
import { ScheduledBroadcastService } from '../../../../../../core/services/broadcast/scheduled broadcast/scheduled-broadcast.service';
import { ToastService } from '../../../../../../core/services/toast-message.service';
import { BroadcastDetailsDialogComponent, BroadcastDialogData } from './components/broadcast-details-dialog/broadcast-details-dialog.component';

@Component({
  selector: 'app-schedule-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatDialogModule],
  templateUrl: './schedule-broadcast.component.html',
  styleUrl: './schedule-broadcast.component.css'
})
export class ScheduleBroadcastComponent implements OnInit {
  broadcasts$: Observable<BroadcastResponse | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  deleteLoading$: Observable<boolean>;
  deleteSuccess$: Observable<boolean>;
  
  // Search functionality
  searchTerm: string = '';
  private searchSubject = new BehaviorSubject<string>('');
  filteredBroadcasts$: Observable<BroadcastData[]>;

  // Pagination properties - commented out as per requirements
  // limit = 10;
  // page = 1;

  constructor(
    private store: Store,
    private router: Router,
    private scheduledBroadcastService: ScheduledBroadcastService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {
    this.broadcasts$ = this.store.select(selectBroadcasts);
    this.loading$ = this.store.select(selectBroadcastsLoading);
    this.error$ = this.store.select(selectBroadcastsError);
    this.deleteLoading$ = this.store.select(selectDeleteLoading);
    this.deleteSuccess$ = this.store.select(selectDeleteSuccess);
    
    // Initialize filtered broadcasts
    this.filteredBroadcasts$ = combineLatest([
      this.broadcasts$,
      this.searchSubject
    ]).pipe(
      map(([broadcasts, searchTerm]) => {
        if (!broadcasts?.data) return [];
        
        if (!searchTerm.trim()) {
          return broadcasts.data;
        }
        
        const searchLower = searchTerm.toLowerCase().trim();
        return broadcasts.data.filter(broadcast => 
          broadcast.template_name?.toLowerCase().includes(searchLower) ||
          broadcast.name?.toLowerCase().includes(searchLower)
        );
      })
    );
  }

  ngOnInit() {
    console.log('ScheduleBroadcastComponent initialized');
    this.loadBroadcasts();
    
    // Subscribe to broadcasts to debug
    this.broadcasts$.subscribe(broadcasts => {
      console.log('Broadcasts loaded:', broadcasts);
    });
    
    // Subscribe to errors to debug
    this.error$.subscribe(error => {
      if (error) {
        console.error('Broadcast loading error:', error);
      }
    });

    // Subscribe to delete loading state
    this.deleteLoading$.subscribe(loading => {
      console.log('Delete loading state:', loading);
    });

    // Subscribe to delete success state
    this.deleteSuccess$.subscribe(success => {
      if (success) {
        console.log('Delete operation successful');
        this.toastService.showToast('Broadcast deleted successfully', 'success');
      }
    });
  }

  loadBroadcasts() {
    console.log('Loading broadcasts...');
    // Note: limit and page parameters removed as per requirements
    this.store.dispatch(ScheduledBroadcastActions.loadBroadcasts());
  }

  onNewBroadcast() {
    this.router.navigate(['/dashboard/broadcast/scheduled-broadcasts/new']);
  }

  onDeleteBroadcast(broadcast_id: string, broadcastName?: string) {
    const broadcastDisplayName = broadcastName || 'this broadcast';
    
    if (confirm(`Are you sure you want to delete "${broadcastDisplayName}"?`)) {
      console.log('Deleting broadcast with ID:', broadcast_id, 'Name:', broadcastName);
      this.store.dispatch(ScheduledBroadcastActions.deleteBroadcast({ broadcast_id }));
      
      // Subscribe to error state to show user-friendly messages
      this.error$.pipe(take(1)).subscribe(error => {
        if (error) {
          let errorMessage = 'An error occurred while deleting the broadcast.';
          
          if (error.name === 'BroadcastNotFoundError') {
            errorMessage = 'This broadcast no longer exists or has already been deleted.';
          } else if (error.name === 'PermissionDeniedError') {
            errorMessage = 'You do not have permission to delete this broadcast.';
          } else if (error.name === 'BadRequestError') {
            errorMessage = 'Invalid broadcast ID. Please refresh the page and try again.';
          } else if (error.status === 404) {
            errorMessage = 'Broadcast not found. It may have been deleted by another user.';
          } else if (error.status === 403) {
            errorMessage = 'Access denied. You do not have permission to delete this broadcast.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid request. Please check the broadcast details and try again.';
          }
          
          // Show error message using toast service
          console.error('Delete broadcast error:', errorMessage);
          this.toastService.showToast(errorMessage, 'error');
        }
      });
    }
  }

  trackByBroadcastId(index: number, broadcast: any): string {
    return broadcast.id;
  }

  onSearchChange(event: any): void {
    const searchValue = event.target.value;
    this.searchTerm = searchValue;
    this.searchSubject.next(searchValue);
  }

  onViewBroadcast(broadcast: BroadcastData) {
    const dialogRef = this.dialog.open(BroadcastDetailsDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { 
        broadcast: broadcast,
        template: undefined // We'll need to fetch template data if needed
      } as BroadcastDialogData,
      panelClass: 'broadcast-details-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle dialog result if needed
        console.log('Dialog closed with result:', result);
      }
    });
  }

  // Pagination methods - commented out as per requirements
  // onNextPage() {
  //   this.broadcasts$.pipe(take(1)).subscribe((data) => {
  //     if (data && this.page < data.total_pages) {
  //       this.page++;
  //       this.loadBroadcasts();
  //     }
  //   });
  // }

  // onPreviousPage() {
  //   if (this.page > 1) {
  //     this.page--;
  //     this.loadBroadcasts();
  //   }
  // }

  // onLimitChange(event: any) {
  //   this.limit = parseInt(event.target.value, 10);
  //   this.page = 1; // Reset to first page when changing limit
  //   this.loadBroadcasts();
  // }
}
