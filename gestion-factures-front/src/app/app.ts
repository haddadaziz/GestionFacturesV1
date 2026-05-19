import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactureListComponent } from './components/facture-list/facture-list';
import { FactureFormComponent } from './components/facture-form/facture-form';
import { NotificationComponent } from './components/notification/notification.component';
import { Facture } from './models/facture';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FactureListComponent, FactureFormComponent, NotificationComponent],
  template: `
    <!-- Global Notifications -->
    <app-notification></app-notification>

    <div style="min-height: 100vh; background-color: var(--bg-color); padding-bottom: 60px;">
      <!-- Navbar -->
      <nav style="background-color: var(--card-bg); border-bottom: 1px solid var(--border-color); padding: 16px 32px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, var(--primary-color), #60a5fa); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">M</div>
          <div>
            <h1 style="margin: 0; color: var(--text-main); font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">MATEK-IT</h1>
            <p style="margin: 0; color: var(--text-muted); font-size: 12px; font-weight: 5 00;">Pilotage d'activité & facturation électronique</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button (click)="openModal()" style="padding: 10px 20px; background-color: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-sm); transition: all 0.2s;"
            onmouseover="this.style.backgroundColor='var(--primary-hover)'" onmouseout="this.style.backgroundColor='var(--primary-color)'"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg>
            Nouvelle Facture</button>
          <!-- Dark mode toggle -->
          <button (click)="toggleDarkMode()" style="padding: 8px; background: none; border: none; cursor: pointer; color: var(--text-main); font-size: 20px;">
            <span *ngIf="!isDarkMode">&#9728;</span>
            <span *ngIf="isDarkMode">&#9790;</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main style="max-width: 1280px; margin: 40px auto 0; padding: 0 24px;">
        <app-facture-list (editFactureEvent)="openModal($event)"></app-facture-list>
      </main>

      <!-- Modal -->
      @if(isModalOpen) {
        <div style="position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; justify-content: center; align-items: center; padding: 20px; overflow-y: auto;">
          <div style="position: absolute; inset: 0;" (click)="closeModal()"></div>
          <div style="position: relative; width: 100%; max-width: 800px; z-index: 51; animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
            <app-facture-form [factureToEdit]="factureToEdit" (closeForm)="closeModal()"></app-facture-form>
          </div>
        </div>
      }

      <style>
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
    </div>
  `
})
export class AppComponent implements OnInit {
  isModalOpen = false;
  factureToEdit: Facture | null = null;
  isDarkMode = false;

  ngOnInit() {
    const stored = localStorage.getItem('darkMode');
    this.isDarkMode = stored === 'true';
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  openModal(facture?: Facture) {
    this.factureToEdit = facture ?? null;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    this.factureToEdit = null;
    document.body.style.overflow = '';
  }
}