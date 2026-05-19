using System;

namespace GestionFacturesAPI.Models
{
    public class Societe
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nom { get; set; } = string.Empty;
        public string Adresse { get; set; } = string.Empty;
        public string Siret { get; set; } = string.Empty;
    }
}
