using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Configuration Swagger pour les Minimal APIs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//  Configuration CORS pour Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Connexion Base de données SQLite
builder.Services.AddDbContext<GestionFacturesAPI.Data.AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Ajout du service d'autorisation
builder.Services.AddAuthorization(); 

var app = builder.Build();

//Activer Swagger en mode développement
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); 
}

app.UseCors("AllowAngular");
app.UseAuthorization();

// routes minimal api
// GET : Récupérer toutes les factures
app.MapGet("/api/factures", async (GestionFacturesAPI.Data.AppDbContext context) =>
{
    var factures = await context.Factures.ToListAsync();
    return Results.Ok(factures);
})
.WithName("GetFactures");

// GET : Récupérer une facture par ID
app.MapGet("/api/factures/{id:guid}", async (Guid id, GestionFacturesAPI.Data.AppDbContext context) =>
{
    var facture = await context.Factures.Include(f => f.Lignes).FirstOrDefaultAsync(f => f.Id == id);
    return facture != null ? Results.Ok(facture) : Results.NotFound();
})
.WithName("GetFactureById");

// POST : Créer une nouvelle facture
app.MapPost("/api/factures", async (GestionFacturesAPI.Models.Facture facture, GestionFacturesAPI.Data.AppDbContext context) =>
{
    context.Factures.Add(facture);
    await context.SaveChangesAsync();
    return Results.Created($"/api/factures/{facture.Id}", facture);
})
.WithName("CreateFacture");

// PUT : Mettre à jour une facture
app.MapPut("/api/factures/{id:guid}", async (Guid id, GestionFacturesAPI.Models.Facture factureUpdate, GestionFacturesAPI.Data.AppDbContext context) =>
{
    if (id != factureUpdate.Id) return Results.BadRequest("L'ID de la facture ne correspond pas.");

    var factureDb = await context.Factures.Include(f => f.Lignes).FirstOrDefaultAsync(f => f.Id == id);
    if (factureDb == null) return Results.NotFound();

    if (factureDb.Statut != 0)
    {
        return Results.BadRequest("Seules les factures en brouillon peuvent être modifiées.");
    }

    // Mise à jour des propriétés
    factureDb.TenantId = factureUpdate.TenantId;
    factureDb.ClientId = factureUpdate.ClientId;
    factureDb.NumeroFacture = factureUpdate.NumeroFacture;
    factureDb.DateEmission = factureUpdate.DateEmission;
    factureDb.DateEcheance = factureUpdate.DateEcheance;
    factureDb.MontantHT = factureUpdate.MontantHT;
    factureDb.MontantTVA = factureUpdate.MontantTVA;
    factureDb.MontantTTC = factureUpdate.MontantTTC;
    
    // Remplacement des lignes
    context.LignesFacture.RemoveRange(factureDb.Lignes);
    
    if (factureUpdate.Lignes != null)
    {
        foreach (var ligne in factureUpdate.Lignes)
        {
            ligne.Id = Guid.NewGuid(); // S'assurer que ce sont de nouvelles lignes pour éviter les conflits d'ID
            ligne.FactureId = id;
            factureDb.Lignes.Add(ligne);
        }
    }

    await context.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("UpdateFacture");

// PATCH : Mettre à jour le statut d'une facture
app.MapPatch("/api/factures/{id:guid}/statut", async (Guid id, [FromBody] int nouveauStatut, GestionFacturesAPI.Data.AppDbContext context) =>
{
    var factureDb = await context.Factures.FirstOrDefaultAsync(f => f.Id == id);
    if (factureDb == null) return Results.NotFound();

    // Règles de transition : 0 -> 1 ou 2, 1 -> 2
    if (factureDb.Statut == 2)
    {
        return Results.BadRequest("Une facture payée ne peut plus changer de statut.");
    }
    if (factureDb.Statut == 1 && nouveauStatut == 0)
    {
        return Results.BadRequest("Une facture en attente ne peut pas redevenir un brouillon.");
    }
    if (nouveauStatut < 0 || nouveauStatut > 2)
    {
        return Results.BadRequest("Statut invalide.");
    }

    factureDb.Statut = nouveauStatut;
    await context.SaveChangesAsync();
    
    return Results.NoContent();
})
.WithName("UpdateFactureStatut");

// DELETE : Supprimer une facture
app.MapDelete("/api/factures/{id:guid}", async (Guid id, GestionFacturesAPI.Data.AppDbContext context) =>
{
    var factureDb = await context.Factures.Include(f => f.Lignes).FirstOrDefaultAsync(f => f.Id == id);
    if (factureDb == null) return Results.NotFound();

    if (factureDb.Statut != 0)
    {
        return Results.BadRequest("Seules les factures en brouillon peuvent être supprimées.");
    }

    context.Factures.Remove(factureDb);
    await context.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("DeleteFacture");

// GET : Récupérer tous les clients
app.MapGet("/api/clients", async (GestionFacturesAPI.Data.AppDbContext context) =>
{
    var clients = await context.Clients.ToListAsync();
    return Results.Ok(clients);
})
.WithName("GetClients");

// POST : Créer un client
app.MapPost("/api/clients", async (GestionFacturesAPI.Models.Client client, GestionFacturesAPI.Data.AppDbContext context) =>
{
    context.Clients.Add(client);
    await context.SaveChangesAsync();
    return Results.Created($"/api/clients/{client.Id}", client);
})
.WithName("CreateClient");

// GET : Récupérer toutes les sociétés
app.MapGet("/api/societes", async (GestionFacturesAPI.Data.AppDbContext context) =>
{
    var societes = await context.Societes.ToListAsync();
    return Results.Ok(societes);
})
.WithName("GetSocietes");

// POST : Créer une société
app.MapPost("/api/societes", async (GestionFacturesAPI.Models.Societe societe, GestionFacturesAPI.Data.AppDbContext context) =>
{
    context.Societes.Add(societe);
    await context.SaveChangesAsync();
    return Results.Created($"/api/societes/{societe.Id}", societe);
})
.WithName("CreateSociete");

app.Run();