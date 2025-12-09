# Serveurs Backend

Ce dossier contient 2 serveurs :

## 1. `index.ts` - Serveur Leaderboard
- **Port** : 3003 (local) ou `process.env.PORT` (production)
- **API** : REST API pour le classement des scores
- **Endpoints** :
  - `GET /api/leaderboard` - Récupère le top 10
  - `POST /api/leaderboard` - Soumet un score
- **Stockage** : Fichier JSON local (`leaderboard.json`)

## 2. `multiplayer.ts` - Serveur Multiplayer
- **Port** : 3002 (local) ou `process.env.PORT` (production)
- **Protocole** : Socket.IO (WebSocket + polling fallback)
- **Features** :
  - Création de rooms avec code unique
  - Max 5 joueurs par room
  - Attribution de couleurs aléatoires
  - Synchronisation temps réel des positions
  - Détection de collision
  - Annonce du gagnant

## Lancer en local

```bash
# Tout en même temps
npm start

# Ou séparément
npm run server      # Leaderboard only
npm run multiplayer # Multiplayer only
npm run dev         # Frontend only
```

## Déployer en production

Le serveur multiplayer doit être déployé séparément sur une plateforme supportant WebSocket :
- ✅ Render.com (recommandé)
- ✅ Railway.app
- ✅ Heroku
- ❌ Vercel (ne supporte pas WebSocket persistant)

Voir [DEPLOYMENT-MULTIPLAYER.md](../DEPLOYMENT-MULTIPLAYER.md) pour le guide complet.

## Variables d'environnement

### En développement
Rien à configurer, utilise les ports par défaut.

### En production
- `PORT` - Port du serveur (auto-généré)
- `NODE_ENV=production`
- `FRONTEND_URL` - URL de votre app Vercel (pour CORS)
