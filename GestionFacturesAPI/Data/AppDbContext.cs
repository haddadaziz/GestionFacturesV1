using GestionFacturesAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionFacturesAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Déclaration des tables
        public DbSet<Facture> Factures { get; set; }
        public DbSet<LigneFacture> LignesFacture { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // bien configurer les décimales
            modelBuilder.Entity<Facture>().Property(f => f.MontantHT).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Facture>().Property(f => f.MontantTVA).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Facture>().Property(f => f.MontantTTC).HasColumnType("decimal(18,2)");
            
            modelBuilder.Entity<LigneFacture>().Property(l => l.Quantite).HasColumnType("decimal(10,2)");
            modelBuilder.Entity<LigneFacture>().Property(l => l.PrixUnitaireHT).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<LigneFacture>().Property(l => l.TauxTVA).HasColumnType("decimal(5,2)");
            modelBuilder.Entity<LigneFacture>().Property(l => l.TotalLigneHT).HasColumnType("decimal(18,2)");
        }
    }
}