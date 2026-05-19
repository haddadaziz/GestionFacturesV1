export interface LigneFacture {
  id?: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Facture {
  id?: string; // optionnel car généré par le back
  numeroFacture: string;
  clientId: string;
  tenantId: string;
  dateEmission: string;
  dateEcheance: string;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  statut: number;
  lignes: LigneFacture[];
}