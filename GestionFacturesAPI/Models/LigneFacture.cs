using System;
using System.Text.Json.Serialization;

namespace GestionFacturesAPI.Models
{
    public class LigneFacture
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FactureId { get; set; }
        public string Designation { get; set; } = string.Empty;
        public decimal Quantite { get; set; }
        public decimal PrixUnitaireHT { get; set; }
        public decimal TauxTVA { get; set; }
        public decimal TotalLigneHT { get; set; }

        // Empêche les boucles infinies lors de la lecture des données JSON
        [JsonIgnore]
        public Facture? Facture { get; set; }
    }
}