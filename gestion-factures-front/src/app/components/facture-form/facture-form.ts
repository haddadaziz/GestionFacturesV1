import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FactureService } from '../../services/facture.service';
import { ClientService } from '../../services/client.service';
import { SocieteService } from '../../services/societe.service';
import { Facture, LigneFacture } from '../../models/facture';
import { Client } from '../../models/client';
import { Societe } from '../../models/societe';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="background: var(--card-bg); padding: 32px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); border: 1px solid var(--border-color); max-height: 90vh; overflow-y: auto; position: relative;">
      
      <!-- Modal Ajouter Client -->
      <div *ngIf="showClientModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px); z-index: 9999; display: flex; justify-content: center; align-items: center;">
        <div style="background: var(--card-bg); padding: 24px; border-radius: var(--radius-md); width: 400px; box-shadow: var(--shadow-lg);">
          <h3 style="margin-top: 0;">Ajouter un nouveau client</h3>
          <form [formGroup]="clientForm" (ngSubmit)="onAddClient()" style="display: flex; flex-direction: column; gap: 12px;">
            <input formControlName="nom" type="text" placeholder="Nom du client *" style="padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <input formControlName="email" type="email" placeholder="Email *" style="padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <input formControlName="adresse" type="text" placeholder="Adresse *" style="padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div style="display: flex; gap: 12px; margin-top: 12px;">
              <button type="button" (click)="showClientModal = false" style="flex: 1; padding: 10px; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer;">Annuler</button>
              <button type="submit" [disabled]="clientForm.invalid" style="flex: 1; padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Ajouter</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Ajouter Société -->
      <div *ngIf="showSocieteModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px); z-index: 9999; display: flex; justify-content: center; align-items: center;">
        <div style="background: var(--card-bg); padding: 24px; border-radius: var(--radius-md); width: 400px; box-shadow: var(--shadow-lg);">
          <h3 style="margin-top: 0;">Ajouter une nouvelle société</h3>
          <form [formGroup]="societeForm" (ngSubmit)="onAddSociete()" style="display: flex; flex-direction: column; gap: 12px;">
            <input formControlName="nom" type="text" placeholder="Nom de la société *" style="padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <input formControlName="adresse" type="text" placeholder="Adresse *" style="padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <input formControlName="siret" type="text" placeholder="SIRET *" style="padding: 10px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
            <div style="display: flex; gap: 12px; margin-top: 12px;">
              <button type="button" (click)="showSocieteModal = false" style="flex: 1; padding: 10px; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer;">Annuler</button>
              <button type="submit" [disabled]="societeForm.invalid" style="flex: 1; padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">Ajouter</button>
            </div>
          </form>
        </div>
      </div>

      <div style="margin-bottom: 24px; position: sticky; top: -32px; background: var(--card-bg); z-index: 2; padding: 32px 0 10px 0; border-bottom: 1px solid var(--border-color);">
        <h2 style="margin: 0 0 8px 0; color: var(--text-main); font-size: 18px; font-weight: 600;">{{ factureToEdit ? 'Modifier la Facture' : 'Nouvelle Facture' }}</h2>
        <p style="margin: 0; color: var(--text-muted); font-size: 14px;">Saisissez les détails pour émettre ou modifier une facture comptable.</p>
      </div>
      
      <form [formGroup]="factureForm" (ngSubmit)="onSubmit()" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
        
        <!-- Ligne 1 -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">Numéro de facture *</label>
          <input formControlName="numeroFacture" type="text" placeholder="Ex: FAC-2026-0001" 
            style="padding: 10px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; outline: none; transition: border-color 0.2s;"
            onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='var(--border-color)'">
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">Statut</label>
          <select formControlName="statut" 
            style="padding: 10px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; outline: none; background-color: white; cursor: pointer;">
            <option [value]="0">Brouillon</option>
            <option [value]="1">Validée (En attente de paiement)</option>
            <option [value]="2">Payée</option>
          </select>
        </div>

        <!-- Ligne - Intervenants -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">Client</label>
            <button type="button" (click)="showClientModal = true" style="padding: 2px 8px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">+ Nouveau</button>
          </div>
          <select formControlName="clientId" 
            style="padding: 10px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; outline: none; background-color: white; cursor: pointer;">
            <option value="" disabled selected>Sélectionnez un client</option>
            <option *ngFor="let client of clients" [value]="client.id">{{ client.nom }}</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">Société / Tenant</label>
            <button type="button" (click)="showSocieteModal = true" style="padding: 2px 8px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">+ Nouvelle</button>
          </div>
          <select formControlName="tenantId" 
            style="padding: 10px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; outline: none; background-color: white; cursor: pointer;">
            <option value="" disabled selected>Sélectionnez une société</option>
            <option *ngFor="let societe of societes" [value]="societe.id">{{ societe.nom }}</option>
          </select>
        </div>

        <!-- Ligne 2 -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">Date d'émission</label>
          <input formControlName="dateEmission" type="date" 
            style="padding: 10px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; outline: none;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">Date d'échéance</label>
          <input formControlName="dateEcheance" type="date" 
            style="padding: 10px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; outline: none;">
        </div>

        <!-- LIGNES DE FACTURE -->
        <div style="grid-column: span 2; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 15px; color: var(--text-main);">Articles / Prestations</h3>
            <button type="button" (click)="ajouterLigne()" style="padding: 6px 12px; background-color: #f1f5f9; color: var(--primary-color); border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='#f1f5f9'">
              + Ajouter une ligne
            </button>
          </div>
          
          <div formArrayName="lignes" style="display: flex; flex-direction: column; gap: 12px;">
            <div *ngFor="let ligne of lignesControl.controls; let i = index" [formGroupName]="i" style="display: flex; gap: 12px; align-items: flex-start; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
              <div style="flex: 3; display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Désignation</label>
                <input formControlName="designation" type="text" placeholder="Description de l'article" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; width: 100%; box-sizing: border-box;">
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Quantité</label>
                <input formControlName="quantite" type="number" min="1" (input)="calculerTotal()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; width: 100%; box-sizing: border-box;">
              </div>
              <div style="flex: 1.5; display: flex; flex-direction: column; gap: 4px;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Prix U. (MAD)</label>
                <input formControlName="prixUnitaire" type="number" min="0" step="0.01" (input)="calculerTotal()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; width: 100%; box-sizing: border-box;">
              </div>
              <button type="button" (click)="supprimerLigne(i)" style="margin-top: 22px; padding: 8px; background: none; border: none; color: #ef4444; cursor: pointer;" title="Supprimer la ligne">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div *ngIf="lignesControl.length === 0" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px;">
              Aucune ligne n'a été ajoutée. La facture est vide.
            </div>
          </div>
        </div>

        <!-- Totaux (Calculés automatiquement) -->
        <div style="grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 10px; padding-top: 20px; border-top: 1px solid var(--border-color);">
          <div style="width: 300px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted);">
              <span>Total HT :</span>
              <span style="font-weight: 600; color: var(--text-main);">{{ factureForm.get('montantHT')?.value | number:'1.2-2' }} MAD</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted);">
              <span>TVA (20%) :</span>
              <span style="font-weight: 600; color: var(--text-main);">{{ factureForm.get('montantTVA')?.value | number:'1.2-2' }} MAD</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: var(--primary-color); padding-top: 12px; border-top: 1px dashed var(--border-color);">
              <span>Total TTC :</span>
              <span>{{ factureForm.get('montantTTC')?.value | number:'1.2-2' }} MAD</span>
            </div>
          </div>
        </div>

        <!-- Submit / Cancel Buttons -->
        <div style="grid-column: span 2; display: flex; gap: 16px; margin-top: 20px; position: sticky; bottom: -32px; background: var(--card-bg); padding: 16px 0 32px 0; border-top: 1px solid var(--border-color);">
          <button type="button" (click)="onCancel()"
            style="flex: 1; padding: 12px 24px; background-color: var(--bg-color); color: var(--text-main); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;"
            onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='var(--bg-color)'">
            Annuler
          </button>
          <button type="submit" [disabled]="factureForm.invalid || lignesControl.length === 0" 
            style="flex: 2; padding: 12px 24px; background-color: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: var(--shadow-sm); transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px;"
            onmouseover="if(!this.disabled) this.style.backgroundColor='var(--primary-hover)'" 
            onmouseout="if(!this.disabled) this.style.backgroundColor='var(--primary-color)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Enregistrer la facture
          </button>
        </div>

      </form>
    </div>
  `
})
export class FactureFormComponent implements OnInit {
  @Input() factureToEdit: Facture | null = null;
  @Output() closeForm = new EventEmitter<void>();
  factureForm: FormGroup;

  clients: Client[] = [];
  societes: Societe[] = [];

  showClientModal = false;
  showSocieteModal = false;

  clientForm: FormGroup;
  societeForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private factureService: FactureService,
    private clientService: ClientService,
    private societeService: SocieteService
  ) {
    const today = new Date();
    const echeance = new Date();
    echeance.setDate(today.getDate() + 30);

    const todayStr = today.toISOString().split('T')[0];
    const echeanceStr = echeance.toISOString().split('T')[0];

    this.factureForm = this.fb.group({
      numeroFacture: ['', Validators.required],
      clientId: ['', Validators.required],
      tenantId: ['', Validators.required],
      dateEmission: [todayStr, Validators.required],
      dateEcheance: [echeanceStr, Validators.required],
      statut: [0, Validators.required],
      montantHT: [0],
      montantTTC: [0],
      montantTVA: [0],
      lignes: this.fb.array([])
    });

    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required]
    });

    this.societeForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      siret: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadSocietes();

    if (this.factureToEdit) {
      // Patch the main form fields
      this.factureForm.patchValue({
        numeroFacture: this.factureToEdit.numeroFacture,
        clientId: this.factureToEdit.clientId,
        tenantId: this.factureToEdit.tenantId,
        dateEmission: new Date(this.factureToEdit.dateEmission).toISOString().split('T')[0],
        dateEcheance: new Date(this.factureToEdit.dateEcheance).toISOString().split('T')[0],
        statut: this.factureToEdit.statut,
        montantHT: this.factureToEdit.montantHT,
        montantTTC: this.factureToEdit.montantTTC,
        montantTVA: this.factureToEdit.montantTVA
      });

      // Patch the lines
      this.lignesControl.clear();
      this.factureToEdit.lignes.forEach(ligne => {
        const ligneForm = this.fb.group({
          designation: [ligne.designation, Validators.required],
          quantite: [ligne.quantite, [Validators.required, Validators.min(1)]],
          prixUnitaire: [ligne.prixUnitaire, [Validators.required, Validators.min(0)]]
        });
        this.lignesControl.push(ligneForm);
      });
      this.calculerTotal();
    } else {
      this.ajouterLigne();
    }
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Erreur chargement clients', err)
    });
  }

  loadSocietes() {
    this.societeService.getSocietes().subscribe({
      next: (data) => this.societes = data,
      error: (err) => console.error('Erreur chargement sociétés', err)
    });
  }

  onAddClient() {
    if (this.clientForm.valid) {
      this.clientService.addClient(this.clientForm.value as Client).subscribe({
        next: (nouveauClient) => {
          this.clients.push(nouveauClient);
          this.factureForm.patchValue({ clientId: nouveauClient.id });
          this.showClientModal = false;
          this.clientForm.reset();
        },
        error: (err) => console.error('Erreur ajout client', err)
      });
    }
  }

  onAddSociete() {
    if (this.societeForm.valid) {
      this.societeService.addSociete(this.societeForm.value as Societe).subscribe({
        next: (nouvelleSociete) => {
          this.societes.push(nouvelleSociete);
          this.factureForm.patchValue({ tenantId: nouvelleSociete.id });
          this.showSocieteModal = false;
          this.societeForm.reset();
        },
        error: (err) => console.error('Erreur ajout société', err)
      });
    }
  }

  get lignesControl() {
    return this.factureForm.get('lignes') as FormArray;
  }

  ajouterLigne() {
    const ligneForm = this.fb.group({
      designation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]]
    });
    this.lignesControl.push(ligneForm);
  }

  supprimerLigne(index: number) {
    this.lignesControl.removeAt(index);
    this.calculerTotal();
  }

  calculerTotal() {
    let ht = 0;
    this.lignesControl.controls.forEach(control => {
      const q = control.get('quantite')?.value || 0;
      const p = control.get('prixUnitaire')?.value || 0;
      ht += q * p;
    });

    const tva = ht * 0.20;
    this.factureForm.patchValue({
      montantHT: ht,
      montantTVA: tva,
      montantTTC: ht + tva
    });
  }

  onSubmit() {
    if (this.factureForm.valid && this.lignesControl.length > 0) {
      const formValues = this.factureForm.value;
      
      const nouvelleFacture: Facture = {
        numeroFacture: formValues.numeroFacture,
        clientId: formValues.clientId,
        tenantId: formValues.tenantId,
        dateEmission: new Date(formValues.dateEmission).toISOString(),
        dateEcheance: new Date(formValues.dateEcheance).toISOString(),
        montantHT: formValues.montantHT,
        montantTVA: formValues.montantTVA,
        montantTTC: formValues.montantTTC,
        statut: Number(formValues.statut),
        lignes: formValues.lignes
      };

      if (this.factureToEdit && this.factureToEdit.id) {
        nouvelleFacture.id = this.factureToEdit.id;
        this.factureService.updateFacture(this.factureToEdit.id, nouvelleFacture).subscribe({
          next: () => {
            this.closeForm.emit();
          },
          error: (err: any) => console.error('Erreur lors de la modification:', err) 
        });
      } else {
        this.factureService.addFacture(nouvelleFacture).subscribe({
          next: () => {
            this.closeForm.emit();
          },
          error: (err: any) => console.error("Erreur lors de l'ajout:", err) 
        });
      }
    }
  }

  onCancel() {
    this.closeForm.emit();
  }
}