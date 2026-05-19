import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FactureService } from '../../services/facture.service';
import { Facture } from '../../models/facture';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="background: white; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Émettre une nouvelle facture</h2>
      
      <form [formGroup]="factureForm" (ngSubmit)="onSubmit()" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: flex-end;">
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: #374151;">Numéro de facture</label>
          <input formControlName="numeroFacture" type="text" placeholder="Ex: FAC-2026-0001" 
            style="padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: #374151;">Montant HT (DH)</label>
          <input formControlName="montantHT" type="number" (input)="calculerTTC()" placeholder="0.00"
            style="padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: #6b7280;">Montant TTC (TVA 20% Auto)</label>
          <input formControlName="montantTTC" type="number" readonly 
            style="padding: 10px 14px; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; color: #4b5563; font-weight: 600;">
        </div>

        <div>
          <button type="submit" [disabled]="factureForm.invalid" 
            style="width: 100%; padding: 11px 20px; background-color: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
            Enregistrer la facture
          </button>
        </div>

      </form>
    </div>
  `
})
export class FactureFormComponent {
  factureForm: FormGroup;

  constructor(private fb: FormBuilder, private factureService: FactureService) {
    this.factureForm = this.fb.group({
      numeroFacture: ['', Validators.required],
      montantHT: [null, [Validators.required, Validators.min(1)]],
      montantTTC: [0],
      montantTVA: [0]
    });
  }

  calculerTTC() {
    const ht = this.factureForm.value.montantHT || 0;
    const tva = ht * 0.20;
    this.factureForm.patchValue({
      montantTVA: tva,
      montantTTC: ht + tva
    });
  }

  onSubmit() {
    if (this.factureForm.valid) {
      const formValues = this.factureForm.value;
      const nouvelleFacture: Facture = {
        id: 0,
        numeroFacture: formValues.numeroFacture,
        montantHT: formValues.montantHT,
        montantTVA: formValues.montantTVA,
        montantTTC: formValues.montantTTC,
        dateEmission: new Date().toISOString(),
        dateEcheance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        statut: 0
      };

      this.factureService.addFacture(nouvelleFacture).subscribe({
        next: () => this.factureForm.reset({ montantTTC: 0, montantTVA: 0 }),
        error: (err) => console.error(err)
      });
    }
  }
}