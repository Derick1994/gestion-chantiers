# Gestion des chantiers — version minimale

Application web de suivi des dépenses par chantier (BTP), en français.

## État actuel (phase 1)

- Liste des chantiers avec total dépensé
- Création d'un chantier (nom, lieu, date de début, budget prévu)
- Saisie rapide des dépenses sur la fiche d'un chantier (catégorie, montant, bénéficiaire, mode de paiement, référence)
- Comparaison budget prévu / dépensé par chantier

Pas encore inclus (phase 2 à venir) : connexion / comptes utilisateurs (admin / opérateur), tableaux de bord détaillés, export Excel/PDF, sauvegardes automatiques.

## Démarrer en local (Docker)

La base de données est MySQL/MariaDB (même moteur que l'hébergement mutualisé cible). Le plus simple en local est Docker Compose, qui lance à la fois la base et l'application :

```bash
docker compose up
```

Ouvrir [http://localhost:3000](http://localhost:3000). Au premier démarrage, Compose installe les dépendances, applique les migrations et recharge les catégories de dépense par défaut automatiquement.

Pour arrêter : `docker compose down` (les données restent dans le volume `web_mariadb_data` ; ajouter `-v` pour tout effacer).

### Sans Docker

Il faut alors une base MySQL/MariaDB accessible (ex. XAMPP en local), et renseigner son URL dans `.env` (`DATABASE_URL="mysql://utilisateur:motdepasse@hote:3306/base"`), puis :

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Base de données

Gérée avec Prisma (`prisma/schema.prisma`). Commandes utiles (à exécuter dans le conteneur via `docker compose exec app <commande>` si vous utilisez Docker) :

```bash
npx prisma migrate dev   # créer/appliquer une migration après une modification du schéma
npx prisma db seed       # recharger les catégories de dépense par défaut
npx prisma studio        # explorer les données dans un navigateur
```

## Déploiement en production

Voir [DEPLOIEMENT.md](DEPLOIEMENT.md) pour le guide pas à pas de mise en ligne sur un hébergement mutualisé cPanel (Setup Node.js App + base MySQL).
