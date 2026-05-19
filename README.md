#Système de Facturation Électronique & Pilotage (V1)

Il s'agit d'une application Full-Stack moderne permettant de créer, lister et suivre des factures en temps réel.

## 🚀 Architecture Technique

L'application repose sur une architecture découplée (Frontend / Backend) performante et légère :
*   **Frontend :** Angular (v19) avec architecture Standalone et gestion d'état via les **Angular Signals** pour une réactivité instantanée.
*   **Backend :** API REST développée avec **.NET 8 / Minimal APIs**, rapide et épurée.
*   **Base de données :** **SQLite**, intégrée sous forme de fichier local (gérée via Entity Framework Core).

---

## ✨ Fonctionnalités clés de la V1

1.  **Registre des factures :** Tableau de bord dynamique avec mise en forme moderne et responsive.
2.  **Calculateur de TVA automatique :** Lors de la saisie du montant HT dans le formulaire, l'application frontend calcule instantanément la TVA (20%) et le montant TTC avant l'envoi.
4.  **Base de données auto-générée :** Grâce à SQLite, aucune configuration de serveur de base de données externe n'est requise. La base se crée et se structure toute seule au premier lancement.

---

## 🛠️ Prérequis pour tester le projet

Avant de commencer, assurez-vous d'avoir installé :
*   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [Node.js (LTS)](https://nodejs.org/)
*   Angular CLI (`npm install -g @angular/cli`)

---

## 💻 Instructions de lancement

### 1. Démarrer le Backend
Ouvrez un terminal dans le dossier du backend :
cd GestionFacturesAPI
dotnet run

### 2. Démarrer le Front End Dans un autre terminal

cd gestion-factures-front
npm install
ng build
npx serve -o

Vous pouvez y accéder sur votre navigateur à l'adresse : http://localhost:4200.
