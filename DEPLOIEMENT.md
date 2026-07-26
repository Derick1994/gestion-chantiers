# Déploiement sur hébergement mutualisé (cPanel)

Guide pas à pas pour mettre l'application en ligne sur un hébergement cPanel disposant de **Setup Node.js App**.

> ⚠️ **Important avant de rendre l'URL publique** : cette version (phase 1) n'a pas encore d'écran de connexion. Toute personne qui a le lien peut créer des chantiers, saisir ou supprimer des dépenses. Pour une mise en ligne de test, gardez le lien privé, ou protégez le dossier avec un mot de passe temporaire via **cPanel > Confidentialité du répertoire (Directory Privacy)**. La connexion sécurisée (comptes admin/opérateur) arrive en phase 2 — à faire avant une utilisation réelle en équipe.

## 1. Créer la base de données MySQL

Dans cPanel :

1. **Bases de données MySQL** → créer une base, ex. `chantiers` (cPanel l'appellera en réalité `votrecompte_chantiers`).
2. Créer un utilisateur MySQL avec un mot de passe robuste.
3. Ajouter cet utilisateur à la base, avec **tous les privilèges** (All Privileges).
4. Noter les trois informations : nom de la base, nom d'utilisateur, mot de passe. Vous en aurez besoin à l'étape 4.

## 2. Envoyer les fichiers du projet sur le serveur

Deux options :

- **Git** (si cPanel propose "Git Version Control") : connecter votre dépôt Git et le cloner directement dans un dossier, par exemple `chantiers-app` (en dehors de `public_html`, l'app Node.js n'a pas besoin d'y être).
- **Fichier ZIP** : sur votre machine, compressez le dossier `web/` **sans** `node_modules`, `.next`, `dev.db` (ces éléments sont déjà ignorés par `.gitignore`, donc s'ils sont absents du zip c'est normal). Envoyez le zip via **Gestionnaire de fichiers (File Manager)**, puis extrayez-le dans le dossier choisi.

## 3. Créer l'application Node.js

Dans cPanel : **Setup Node.js App** → **Create Application**.

| Champ | Valeur |
|---|---|
| Node.js version | La plus récente disponible, **20 minimum** (idéalement 22) |
| Application mode | Production |
| Application root | le dossier où vous avez mis les fichiers (ex. `chantiers-app`) |
| Application URL | votre domaine ou sous-domaine (ex. `gestion.mondomaine.com`) |
| Application startup file | `app.js` |

Cliquez sur **Create**.

## 4. Renseigner les variables d'environnement

Toujours dans l'écran de l'application Node.js créée, section **Environment variables**, ajoutez :

- `DATABASE_URL` = `mysql://UTILISATEUR:MOTDEPASSE@localhost:3306/NOMDELABASE` (avec les valeurs notées à l'étape 1)
- `NODE_ENV` = `production`

Cliquez sur **Save**.

## 5. Installer, construire et initialiser la base

Dans le même écran, cliquez sur **Run NPM Install** (installe les dépendances). Une fois terminé, ouvrez le terminal fourni par cPanel pour cette application (lien du type *"Enter to the virtual environment"* ou bouton **Terminal**), puis exécutez, dans le dossier de l'application :

```bash
npm run build
npx prisma migrate deploy
npx prisma db seed
```

- `npm run build` compile l'application pour la production.
- `npx prisma migrate deploy` crée les tables dans la base MySQL.
- `npx prisma db seed` charge les catégories de dépense par défaut et un compte administrateur (identifiant `admin`, mot de passe `admin1234` — sans usage réel tant que la connexion n'est pas en place en phase 2 ; pensez à le changer alors).

## 6. Démarrer / redémarrer l'application

Retour sur l'écran **Setup Node.js App**, cliquez sur **Restart**.

## 7. Activer le HTTPS

Dans cPanel : **Security → SSL/TLS Status**, activez **AutoSSL** pour votre domaine si ce n'est pas déjà fait (certificat Let's Encrypt gratuit, généralement automatique sur la plupart des hébergements).

## 8. Tester

Ouvrez `https://votre-domaine` dans un navigateur :

1. La liste des chantiers doit s'afficher (vide au départ).
2. Cliquez sur **+ Nouveau chantier**, créez un chantier de test.
3. Ouvrez ce chantier, ajoutez une dépense de test.
4. Vérifiez que le total dépensé et le reste sur budget s'affichent correctement, sur la fiche et dans la liste.
5. Supprimez la dépense et le chantier de test une fois la vérification faite.

## En cas de mise à jour ultérieure du code

1. Envoyer les nouveaux fichiers (Git pull, ou remplacement via File Manager).
2. Dans le terminal de l'application : `npm install` (si les dépendances ont changé), `npx prisma migrate deploy` (si le schéma a changé), `npm run build`.
3. Cliquer sur **Restart** dans Setup Node.js App.

## Sauvegardes

L'hébergement mutualisé propose généralement une sauvegarde automatique de la base MySQL (cPanel → Backup / Sauvegardes). Vérifiez qu'elle est activée et qu'elle inclut les bases MySQL, pas seulement les fichiers. C'est un point à confirmer avant une utilisation réelle (voir aussi la phase 2 : export à la demande).
