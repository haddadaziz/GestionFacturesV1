using System;
using System.Collections.Generic;

namespace GestionFacturesAPI.Models
{
    public class Facture
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Guid ClientId { get; set; }
        public string NumeroFacture { get; set; } = string.Empty;
        public DateTime DateEmission { get; set; }
        public DateTime DateEcheance { get; set; }
        public decimal MontantHT { get; set; }
        public decimal MontantTVA { get; set; }
        public decimal MontantTTC { get; set; }
        public int Statut { get; set; } // 0=Brouillon, 1=Validée, etc.
        public DateTime CreeLe { get; set; } = DateTime.UtcNow;
        
        // Relation : Une facture possède plusieurs lignes
        public List<LigneFacture> Lignes { get; set; } = new List<LigneFacture>();
    }
}