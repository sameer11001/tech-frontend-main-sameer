import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import * as TemplateActions from '../../../../../../core/services/broadcast/template/ngrx/your-template.actions';
import { selectTemplates, selectTemplateError } from '../../../../../../core/services/broadcast/template/ngrx/your-template.selectors';
import { WhatsAppTemplate, TemplateResponse } from '../../../../../../core/models/whatsapp-twmplate.model';
import {
  TemplateDetailsComponent,
  TemplateDialogData,
} from './components/edit-temp-dialog/edit-temp-dialog.component';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  selector: 'app-your-templates',
  templateUrl: './your-templates.component.html',
})
export class YourTemplatesComponent implements OnInit {
  template$: Observable<TemplateResponse>;
  error$: Observable<any>;
  newTemplate: boolean = false;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.template$ = this.store.select(selectTemplates);
    this.error$ = this.store.select(selectTemplateError);
  }

  ngOnInit() {
    this.store.dispatch(TemplateActions.loadTemplates({ limit: 10 }));
    this.template$.subscribe((data) => {
      console.log('Template Data length:', data?.data?.length);
    });
    
    this.error$.subscribe((error) => {
      if (error) {
        console.error('Template loading error:', error);
      }
    });
  }

  sortedBy = 'All';
  limit = 10;
  page_number = 1;

  onNextPage() {
    this.template$.pipe(take(1)).subscribe((data) => {
      const afterCursor = data?.paging?.cursors?.after;
      if (afterCursor) {
        this.store.dispatch(
          TemplateActions.loadTemplates({
            page_number: this.page_number,
            limit: this.limit,
          })
        );
      }
      this.sortedBy = 'All';
    });
  }

  onPreviousPage() {
    this.template$.pipe(take(1)).subscribe((data) => {
      const beforeCursor = data?.paging?.cursors?.before;
      if (beforeCursor) {
        this.store.dispatch(
          TemplateActions.loadTemplates({
            page_number: this.page_number,
            limit: this.limit,
          })
        );
      }
      this.sortedBy = 'All';
    });
  }
  
  onNewTemplate() {
    this.newTemplate = true;
  }

  onSearchChange(event: any) {
    // Implement search functionality
    console.log('Search:', event.target.value);
  }

  onSortedByChange(event: any) {
    // Implement sort functionality
    console.log('Sort by:', event.target.value);
  }

  onLimitChange(event: any) {
    // Implement limit change functionality
    console.log('Limit:', event.target.value);
  }

  sendBroadcast(template: WhatsAppTemplate) {
    this.router.navigate(['/dashboard/broadcast/scheduled-broadcasts/new'], {
      queryParams: {
        templateId: template._id,
        templateName: template.name
      }
    });
  }

  openDialog(template: WhatsAppTemplate) {
    const dialogRef = this.dialog.open(TemplateDetailsComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: { template } as TemplateDialogData,
      panelClass: 'template-details-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle dialog result if needed
      }
    });
  }

  onEditTemplate(template: WhatsAppTemplate) {
    this.router.navigate(['/dashboard/broadcast/your-templates/edit'], {
      queryParams: {
        templateId: template._id,
        templateName: template.name
      }
    });
  }

  onDeleteTemplate(template: WhatsAppTemplate) {
    if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      this.store.dispatch(TemplateActions.deleteTemplate({ 
        name: template.name,
        template_id: template._id
      }));
      
      // Reload templates after deletion
      this.store.dispatch(TemplateActions.loadTemplates({ limit: 10 }));
    }
  }

  onCopyTemplate(template: WhatsAppTemplate) {
    // Pass only the UI-relevant fields (components) for copying
    this.router.navigate(['new-template'], {
      state: { prefill: { components: template.components } },
      relativeTo: this.route
    });
  }
}
