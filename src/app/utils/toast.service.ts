import { Injectable, OnDestroy } from '@angular/core';
import { ToastService } from '../core/services/toast-message.service';
import { Actions, ofType } from '@ngrx/effects';
import * as UserManagementActions from '../core/services/user-management/ngrx/user-management.actions';
import * as TagActions from '../core/services/tags/ngrx/tags.actions';
import * as ProfileSettingsActions from '../core/services/profile-settings/ngrx/profile-settings.actions';
import * as MessageActions from '../core/services/messages/ngrx/messages.actions';
import * as ContactActions from '../core/services/contact/ngrx/contact.actions';
import * as TemplateActions from '../core/services/broadcast/template/ngrx/your-template.actions';
import * as ScheduledBroadcastActions from '../core/services/broadcast/scheduled broadcast/ngrx/scheduled-broadcast.actions';
import * as AuthActions from '../core/services/auth/ngrx/auth.action';
import * as AttributeActions from '../core/services/attributes/ngrx/attributes.actions';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErroreToastService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService, private actions$: Actions) {
    this.userManagementToast();
    this.tagManagementToast();
    this.businessProfileToast();
    this.messageNotifications();
    this.contactNotifications();
    this.templateNotifications();
    this.scheduledBroadcastNotifications();
    this.authNotifications();
    this.attributeNotifications();

  }

  private userManagementToast() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if ( action.type === UserManagementActions.loadUsersFailure.type || action.type === UserManagementActions.loadRolesFailure.type || action.type === UserManagementActions.loadTeamsFailure.type) {
        this.toastService.showToast('Something went wrong try again', 'error');
      } else if (action.type === UserManagementActions.forceResetPasswordFailure.type) {
        this.toastService.showToast('Error forcing password reset', 'error');
      } else if (action.type === UserManagementActions.forceLogoutFailure.type) {
        this.toastService.showToast('Error forcing logout', 'error');
      }  else if (action.type === UserManagementActions.createUserFailure.type) {
        this.toastService.showToast('Error creating user', 'error');
      } else if (action.type === UserManagementActions.updateUserFailure.type) {
        this.toastService.showToast('Error updating user', 'error');
      } else if (action.type === UserManagementActions.deleteUserFailure.type) {
        this.toastService.showToast('Error deleting user', 'error');
      } else if (action.type === UserManagementActions.deleteUserSuccess.type) {
        this.toastService.showToast('User deleted successfully', 'success');
      } else if (action.type === UserManagementActions.forceLogoutSuccess.type) {
        this.toastService.showToast('User sessions logged out successfully', 'success');
      }else if (action.type === UserManagementActions.createUserSuccess.type) {
        this.toastService.showToast('User created successfully', 'success');
      }else if (action.type === UserManagementActions.updateUserSuccess.type) {
        this.toastService.showToast('User updated successfully', 'success');
      }else if (action.type === UserManagementActions.forceResetPasswordSuccess.type) {
        this.toastService.showToast('Password reset successfully', 'success');
      }
    });
  }

  private tagManagementToast() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action.type === TagActions.getTagsError.type) {
        this.toastService.showToast('Failed to load tags', 'error');
      } else if (action.type === TagActions.addTagError.type) {
        this.toastService.showToast('Failed to add tag', 'error');
      } else if (action.type === TagActions.deleteTagError.type) {
        this.toastService.showToast('Failed to delete tag', 'error');
      } else if (action.type === TagActions.updateTagError.type) {
        this.toastService.showToast('Failed to update tag', 'error');
      } else if (action.type === TagActions.addTagSuccess.type) {
        this.toastService.showToast('Tag added successfully', 'success');
      } else if (action.type === TagActions.deleteTagSuccess.type) {
        this.toastService.showToast('Tag deleted successfully', 'success');
      } else if (action.type === TagActions.updateTagSuccess.type) {
        this.toastService.showToast('Tag updated successfully', 'success');
      }
    });
  }

  private businessProfileToast() {
    // this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
    //   if (action.type === ProfileSettingsActions.businessProfileError.type) {
    //     alert('Failed to load business profile');
    //   } else if (action.type === ProfileSettingsActions.businessProfileSuccess.type) {
    //     alert('Business profile loaded successfully');
    //   }
    // });
  }

  private messageNotifications() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      // Text Messages
      if (action.type === MessageActions.sendTextMessageError.type) {
        this.toastService.showToast('Failed to send text message', 'error');
      } else if (action.type === MessageActions.sendTextMessageSuccess.type) {
        this.toastService.showToast('Text message sent successfully', 'success');
      }

      // Media Messages
      else if (action.type === MessageActions.sendMediaMessageError.type) {
        this.toastService.showToast('Failed to send media message', 'error');
      } else if (action.type === MessageActions.sendMediaMessageSuccess.type) {
        this.toastService.showToast('Media message sent successfully', 'success');
      }

      // Reaction Messages
      else if (action.type === MessageActions.sendReplyWithReactionMessageError.type) {
        this.toastService.showToast('Failed to send reaction', 'error');
      } else if (action.type === MessageActions.sendReplyWithReactionMessageSuccess.type) {
        this.toastService.showToast('Reaction sent successfully', 'success');
      }

      // Location Messages
      else if (action.type === MessageActions.sendLocationMessageError.type) {
        this.toastService.showToast('Failed to send location', 'error');
      } else if (action.type === MessageActions.sendLocationMessageSuccess.type) {
        this.toastService.showToast('Location sent successfully', 'success');
      }

      // Interactive Button Messages
      else if (action.type === MessageActions.sendInteractiveReplyButtonMessageError.type) {
        this.toastService.showToast('Failed to send interactive buttons', 'error');
      } else if (action.type === MessageActions.sendInteractiveReplyButtonMessageSuccess.type) {
        this.toastService.showToast('Interactive buttons sent successfully', 'success');
      }
    });
  }

  private contactNotifications() {
    // this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
    //   if (action.type === ContactActions.getContactsError.type) {
    //     alert('Failed to load contacts');
    //   } else if (action.type === ContactActions.getContactsSuccess.type) {
    //     alert('Contacts loaded successfully');
    //   } else if (action.type === ContactActions.deleteContactError.type) {
    //     alert('Failed to delete contact');
    //   } else if (action.type === ContactActions.deleteContactSuccess.type) {
    //     alert('Contact deleted successfully');
    //   }
    // });
  }

  private templateNotifications() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action.type === TemplateActions.loadTemplatesFailure.type) {
        this.toastService.showToast('Failed to load templates', 'error');
      } else if (action.type === TemplateActions.createTemplateFailure.type) {
        this.toastService.showToast('Failed to create template', 'error');
      } else if (action.type === TemplateActions.createTemplateSuccess.type) {
        this.toastService.showToast('Template created successfully', 'success');
      } else if (action.type === TemplateActions.deleteTemplateFailure.type) {
        this.toastService.showToast('Failed to delete template', 'error');
      } else if (action.type === TemplateActions.deleteTemplateSuccess.type) {
        this.toastService.showToast('Template deleted successfully', 'success');
      } else if (action.type === TemplateActions.uploadMediaFailure.type) {
        this.toastService.showToast('Failed to upload media', 'error');
      } else if (action.type === TemplateActions.uploadMediaSuccess.type) {
        this.toastService.showToast('Media uploaded successfully', 'success');
      }
    });
  }

  private authNotifications() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action.type === AuthActions.loginFailure.type) {
        this.toastService.showToast('Login failed. Please check your credentials.', 'error');
      } else if (action.type === AuthActions.loginSuccess.type) {
        this.toastService.showToast('Login successful!', 'success');
      } else if (action.type === AuthActions.refreshTokenFailure.type) {
        this.toastService.showToast('Session expired. Please login again.', 'error');
      } else if (action.type === AuthActions.logout.type) {
        this.toastService.showToast('Logged out successfully', 'success');
      }
    });
  }

  private scheduledBroadcastNotifications() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action.type === ScheduledBroadcastActions.loadBroadcastsFailure.type) {
        this.toastService.showToast('Failed to load broadcasts', 'error');
      } else if (action.type === ScheduledBroadcastActions.publishBroadcastFailure.type) {
        this.toastService.showToast('Failed to publish broadcast', 'error');
      } else if (action.type === ScheduledBroadcastActions.publishBroadcastSuccess.type) {
        this.toastService.showToast('Broadcast published successfully', 'success');
      }
    });
  }

  private attributeNotifications() {
    this.actions$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action.type === AttributeActions.getAttributesError.type) {
        this.toastService.showToast('Failed to load attributes', 'error');
      } else if (action.type === AttributeActions.addAttributeError.type) {
        this.toastService.showToast('Failed to add attribute', 'error');
      } else if (action.type === AttributeActions.addAttributeSuccess.type) {
        this.toastService.showToast('Attribute added successfully', 'success');
      } else if (action.type === AttributeActions.deleteAttributeError.type) {
        this.toastService.showToast('Failed to delete attribute', 'error');
      } else if (action.type === AttributeActions.deleteAttributeSuccess.type) {
        this.toastService.showToast('Attribute deleted successfully', 'success');
      } else if (action.type === AttributeActions.updateAttributeError.type) {
        this.toastService.showToast('Failed to update attribute', 'error');
      } else if (action.type === AttributeActions.updateAttributeSuccess.type) {
        this.toastService.showToast('Attribute updated successfully', 'success');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
