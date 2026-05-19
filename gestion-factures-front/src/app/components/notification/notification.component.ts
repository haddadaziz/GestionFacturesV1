import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position: fixed; top: 20px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;">
      @for (notif of notificationService.notifications(); track notif.id) {
        <div
          [style.animation]="notif.removing ? 'toastSlideOut 0.4s ease-in forwards' : 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'"
          style="pointer-events: all; background: var(--card-bg); border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); width: 380px; overflow: hidden; display: flex; align-items: stretch;">
          
          <!-- Bande de couleur latérale -->
          <div [style.background]="notif.type === 'success' ? '#16a34a' : '#dc2626'" style="width: 5px; flex-shrink: 0;"></div>

          <!-- Contenu -->
          <div style="padding: 16px 16px 16px 14px; display: flex; gap: 14px; align-items: center; flex: 1;">
            
            <!-- Icône -->
            <div [style.background]="notif.type === 'success' ? '#f0fdf4' : '#fef2f2'"
                 [style.color]="notif.type === 'success' ? '#16a34a' : '#dc2626'"
                 style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              @if (notif.type === 'success') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              }
              @if (notif.type === 'error') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
            </div>

            <!-- Texte -->
            <div style="flex: 1;">
              <p [style.color]="notif.type === 'success' ? '#15803d' : '#b91c1c'"
                 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700;">
                {{ notif.type === 'success' ? 'Succès' : 'Erreur' }}
              </p>
              <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.4;">{{ notif.message }}</p>
            </div>

            <!-- Bouton Fermer -->
            <button (click)="notificationService.dismiss(notif.id)"
              style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.2s, background 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
              onmouseover="this.style.color='#475569'; this.style.background='#f1f5f9';"
              onmouseout="this.style.color='#94a3b8'; this.style.background='none';">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>

    <style>
      @keyframes toastSlideIn {
        0% { opacity: 0; transform: translateX(40px) scale(0.95); }
        100% { opacity: 1; transform: translateX(0) scale(1); }
      }
      @keyframes toastSlideOut {
        0% { opacity: 1; transform: translateX(0) scale(1); }
        100% { opacity: 0; transform: translateX(40px) scale(0.95); }
      }
    </style>
  `
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}
}
