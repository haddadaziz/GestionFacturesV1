import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FactureService } from '../../services/facture.service';
import { Facture } from '../../models/facture';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [],
  template: `
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
      
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; background-color: #fafafa;">
        <h2 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Registre des factures émises</h2>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">
              <th style="padding: 14px 20px;">N° FACTURE</th>
              <th style="padding: 14px 20px;">MONTANT HT</th>
              <th style="padding: 14px 20px;">MONTANT TTC</th>
              <th style="padding: 14px 20px;">STATUT</th>
            </tr>
          </thead>
          <tbody style="color: #4b5563;">
            @for (f of factures(); track f.id) {
              <tr style="border-bottom: 1px solid #edf2f7;">
                <td style="padding: 14px 20px; font-weight: 600; color: #111827;">{{ f.numeroFacture }}</td>
                <td style="padding: 14px 20px;">{{ f.montantHT }} DH</td>
                <td style="padding: 14px 20px; color: #2563eb; font-weight: 600;">{{ f.montantTTC }} DH</td>
                <td style="padding: 14px 20px;">
                  <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                    En attente
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #9ca3af;">
                  Aucune donnée disponible dans le registre. Utilisez le formulaire ci-dessus.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
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
        next: (data) => this.factures.set(data),
        error: (err) => console.error(err)
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}