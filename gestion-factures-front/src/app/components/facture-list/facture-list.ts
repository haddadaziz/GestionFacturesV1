import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactureService } from '../../services/facture.service';
import { Facture } from '../../models/facture';

import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="background: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); border: 1px solid var(--border-color); overflow: hidden;">
      
      <!-- Header du tableau -->
      <div style="padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background-color: white;">
        <div>
          <h2 style="margin: 0 0 4px 0; color: var(--text-main); font-size: 18px; font-weight: 600;">Historique des Factures</h2>
          <p style="margin: 0; color: var(--text-muted); font-size: 14px;">Consultez et suivez l'état de vos factures.</p>
        </div>
        <div style="background-color: var(--status-draft-bg); padding: 8px 12px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 8px; height: 8px; background-color: var(--primary-color); border-radius: 50%; animation: pulse 2s infinite;"></span>
          Synchronisation en temps réel
        </div>
      </div>

      <!-- Conteneur du tableau -->
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid var(--border-color);">
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">N° Facture</th>
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Client</th>
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Émission</th>
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Montant HT</th>
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Montant TTC</th>
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (f of factures(); track f.id) {
              <tr style="border-bottom: 1px solid var(--border-color); background-color: white; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f1f5f9'" onmouseout="this.style.backgroundColor='white'">
                <td style="padding: 16px 24px; font-weight: 600; color: var(--text-main);">{{ f.numeroFacture }}</td>
                <td style="padding: 16px 24px; color: var(--text-muted);">
                  <div style="font-weight: 500; color: var(--text-main);">
                    {{ f.clientId === '11111111-1111-1111-1111-111111111111' ? 'Tech Corp' : 
                       f.clientId === '22222222-2222-2222-2222-222222222222' ? 'Web Solutions' : 
                       'Client ' + (f.clientId | slice:0:8) }}
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    {{ f.tenantId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' ? 'MATEK-IT France' : 
                       f.tenantId === 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' ? 'MATEK-IT International' : 
                       'Société ' + (f.tenantId | slice:0:8) }}
                  </div>
                </td>
                <td style="padding: 16px 24px; color: var(--text-muted);">{{ f.dateEmission | date:'dd/MM/yyyy' }}</td>
                <td style="padding: 16px 24px; color: var(--text-muted);">{{ f.montantHT | number:'1.2-2' }} MAD</td>
                <td style="padding: 16px 24px; color: var(--text-main); font-weight: 600;">{{ f.montantTTC | number:'1.2-2' }} MAD</td>
                <td style="padding: 16px 24px;">
                  <!-- Badge Statut -->
                  @if (f.statut === 0) {
                    <span style="background-color: var(--status-draft-bg); color: var(--status-draft-text); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">Brouillon</span>
                  }
                  @if (f.statut === 1) {
                    <span style="background-color: var(--status-pending-bg); color: var(--status-pending-text); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">En attente</span>
                  }
                  @if (f.statut === 2) {
                    <span style="background-color: var(--status-paid-bg); color: var(--status-paid-text); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">Payée</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    <span>Aucune facture trouvée. Émettez votre première facture !</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Keyframes inline pour la petite animation de ping (peut être déplacé dans styles.css si désiré) -->
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
      </style>
    </div>
  `
})
export class FactureListComponent implements OnInit, OnDestroy {
  factures = signal<Facture[]>([]); 
  private pollingSubscription!: Subscription;

  constructor(private factureService: FactureService) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => this.factureService.getFactures())
      )
      .subscribe({
        next: (data) => {
          // On s'assure de trier les factures par date décroissante pour afficher les plus récentes en haut
          const sortedData = data.sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime());
          this.factures.set(sortedData);
        },
        error: (err) => console.error('Erreur API:', err)
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}