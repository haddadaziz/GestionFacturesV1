using Microsoft.EntityFrameworkCore;

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

// POST : Créer une nouvelle facture
app.MapPost("/api/factures", async (GestionFacturesAPI.Models.Facture facture, GestionFacturesAPI.Data.AppDbContext context) =>
{
    context.Factures.Add(facture);
    await context.SaveChangesAsync();
    return Results.Created($"/api/factures/{facture.Id}", facture);
})
.WithName("CreateFacture");

app.Run();