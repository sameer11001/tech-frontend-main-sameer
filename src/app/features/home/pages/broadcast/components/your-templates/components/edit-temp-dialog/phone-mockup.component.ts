import { Component, Input } from '@angular/core';
import { TemplateComponent } from '../../../../../../../../core/models/whatsapp-twmplate.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phone-mockup',
  standalone: true,
  template: `
    <div class="phone-mockup-container">
      <div class="phone-mockup-bg">
        <div class="phone-mockup-content">
          <ng-container *ngIf="broadcastTitle">
            <h3 class="mockup-title">{{ broadcastTitle }}</h3>
          </ng-container>
          <ng-container *ngIf="bodyText">
            <p class="mockup-body">{{ bodyText }}</p>
          </ng-container>
          <ng-container *ngIf="footerText">
            <p class="mockup-footer">{{ footerText }}</p>
          </ng-container>
          <ng-container *ngIf="buttonComponents && buttonComponents.length">
            <ng-container *ngFor="let btn of buttonComponents; trackBy: trackByIndex">
              <p class="mockup-btn">{{ btn.text }}</p>
              <hr class="mockup-hr">
            </ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .phone-mockup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      flex-basis: 50%;
      max-width: 50%;
      margin: 0 auto;
    }
    .phone-mockup-bg {
      position: relative;
      width: 100%;
      aspect-ratio: 310 / 520;
      /* background-image: url("phone-mockup.png"); */
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-mockup-content {
      position: absolute;
      top: 18%;
      left: 5%;
      right: 5%;
      background: white;
      border-radius: 0.75rem;
      padding: 1rem;
      width: 90%;
      max-width: 260px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .mockup-title {
      font-size: 1.1rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .mockup-body {
      color: #222;
      margin-bottom: 0.5rem;
      word-break: break-word;
    }
    .mockup-footer {
      color: #bbb;
      font-size: 0.95rem;
      margin: 0.5rem 0;
    }
    .mockup-btn {
      color: #2563eb;
      text-align: center;
      font-size: 0.95rem;
      margin: 0.25rem 0;
    }
    .mockup-hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 0.25rem 0;
    }
    @media (max-width: 900px) {
      .phone-mockup-container {
        max-width: 100vw;
        flex-basis: 100%;
      }
      .phone-mockup-bg {
        max-width: 95vw;
        aspect-ratio: 310 / 520;
      }
      .phone-mockup-content {
        max-width: 95vw;
        padding: 0.5rem;
        font-size: 0.95rem;
      }
    }
  `],
  imports: [CommonModule],
})
export class PhoneMockupComponent {
  @Input() broadcastTitle?: string;
  @Input() bodyText?: string;
  @Input() footerText?: string;
  @Input() buttonComponents?: { label: string; text: string }[];
  @Input() templateComponents?: TemplateComponent[];

  trackByIndex(index: number) {
    return index;
  }
}
