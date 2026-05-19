import { Component, OnInit, OnDestroy, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactureService } from '../../services/facture.service';
import { ClientService } from '../../services/client.service';
import { SocieteService } from '../../services/societe.service';
import { Facture } from '../../models/facture';
import { Client } from '../../models/client';
import { Societe } from '../../models/societe';

import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal de confirmation de suppression (Theme Bleu & Blanc) -->
    @if (showDeleteConfirm) {
      <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(6px); z-index: 9999; display: flex; justify-content: center; align-items: center; animation: fadeInOverlay 0.3s ease-out;">
        
        <div style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); width: 420px; overflow: hidden; animation: popupBounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border-top: 5px solid var(--primary-color, #2563eb);">
          
          <div style="padding: 32px 32px 24px 32px; text-align: center;">
            <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; box-shadow: 0 0 0 8px #f8fafc;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color, #2563eb)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            
            <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Supprimer ce brouillon ?</h3>
            <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible et supprimera toutes les lignes associées.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px 32px; display: flex; gap: 16px;">
            <button (click)="annulerSuppression()" style="flex: 1; padding: 12px; background: white; color: var(--primary-color, #2563eb); border: 2px solid var(--primary-color, #2563eb); border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#eff6ff'" onmouseout="this.style.backgroundColor='white'">
              Annuler
            </button>
            <button (click)="confirmerSuppression()" style="flex: 1; padding: 12px; background: var(--primary-color, #2563eb); color: white; border: 2px solid var(--primary-color, #2563eb); border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 8px -1px rgba(37, 99, 235, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(37, 99, 235, 0.2)';">
              Confirmer
            </button>
          </div>
          
        </div>
      </div>
    }

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
              <th style="padding: 16px 24px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (f of factures(); track f.id) {
              <tr style="border-bottom: 1px solid var(--border-color); background-color: white; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f1f5f9'" onmouseout="this.style.backgroundColor='white'">
                <td style="padding: 16px 24px; font-weight: 600; color: var(--text-main);">{{ f.numeroFacture }}</td>
                <td style="padding: 16px 24px; color: var(--text-muted);">
                  <div style="font-weight: 500; color: var(--text-main);">
                    {{ getClientName(f.clientId) }}
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    {{ getSocieteName(f.tenantId) }}
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
                <td style="padding: 16px 24px; text-align: right;">
                  @if (f.statut === 0) {
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                      <button (click)="modifierFacture(f)" style="padding: 6px 12px; background: #e0f2fe; color: #0284c7; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Modifier</button>
                      <button (click)="demanderSuppression(f.id!)" style="padding: 6px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Supprimer</button>
                    </div>
                  } @else {
                    <span style="color: var(--text-muted); font-size: 12px; font-style: italic;">Immuable</span>
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
        @keyframes fadeInOverlay {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes popupBounceIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      </style>
    </div>
  `
})
export class FactureListComponent implements OnInit, OnDestroy {
  factures = signal<Facture[]>([]); 
  clients = signal<Client[]>([]);
  societes = signal<Societe[]>([]);
  private pollingSubscription!: Subscription;

  constructor(
    private factureService: FactureService,
    private clientService: ClientService,
    private societeService: SocieteService
  ) {}

  ngOnInit(): void {
    // Charger les clients et les sociétés une seule fois
    this.clientService.getClients().subscribe({
      next: (data) => this.clients.set(data),
      error: (err) => console.error('Erreur chargement clients:', err)
    });

    this.societeService.getSocietes().subscribe({
      next: (data) => this.societes.set(data),
      error: (err) => console.error('Erreur chargement sociétés:', err)
    });

    // Polling des factures
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

  getClientName(id: string): string {
    const client = this.clients().find(c => c.id === id);
    return client ? 'Client ' + client.nom : 'Client inconnu (' + id.substring(0, 8) + ')';
  }

  getSocieteName(id: string): string {
    const societe = this.societes().find(s => s.id === id);
    return societe ? 'Société ' + societe.nom : 'Société inconnue (' + id.substring(0, 8) + ')';
  }

  @Output() editFactureEvent = new EventEmitter<Facture>();
  
  showDeleteConfirm = false;
  factureToDeleteId: string | null = null;

  modifierFacture(facture: Facture) {
    // Émet l'événement pour ouvrir le formulaire en mode édition (à implémenter dans le parent)
    this.editFactureEvent.emit(facture);
    console.log('Modification demandée pour la facture', facture.id);
  }

  demanderSuppression(id: string) {
    this.factureToDeleteId = id;
    this.showDeleteConfirm = true;
  }

  confirmerSuppression() {
    if (this.factureToDeleteId) {
      const id = this.factureToDeleteId;
      this.factureService.deleteFacture(id).subscribe({
        next: () => {
          // Mise à jour locale immédiate en attendant le prochain polling
          this.factures.update(facts => facts.filter(f => f.id !== id));
          this.annulerSuppression();
        },
        error: (err) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }

  annulerSuppression() {
    this.showDeleteConfirm = false;
    this.factureToDeleteId = null;
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}