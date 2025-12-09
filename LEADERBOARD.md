# 🏆 Leaderboard Global - Neon Void

Ce projet dispose maintenant d'un système de leaderboard global permettant à tous les joueurs de comparer leurs scores.

## 🚀 Démarrage

### Option 1: Démarrer tout en une commande
```bash
npm start
```

Cette commande lance automatiquement:
- Le serveur backend (port 3001)
- L'application frontend (port 5173)

### Option 2: Démarrer séparément

**Terminal 1 - Serveur Backend:**
```bash
npm run server
```

**Terminal 2 - Application Frontend:**
```bash
npm run dev
```

## 📋 Fonctionnalités

### Menu Principal
- **Bouton "Initialize Sequence"**: Démarre une nouvelle partie
- **Bouton "Leaderboard"**: Affiche le classement global des 10 meilleurs scores

### Écran Game Over
- **Input de nom**: Entrez votre nom (max 20 caractères)
- **Submit to Leaderboard**: Soumet votre score au classement global
- **View Leaderboard**: Consulte le classement après avoir soumis votre score
- **Retry**: Recommence une partie

### Leaderboard
- Affiche les 10 meilleurs scores
- Indique les médailles 🥇🥈🥉 pour le top 3
- Montre quand chaque score a été enregistré
- Surligne votre score récemment soumis en jaune

## 🔧 Architecture Technique

### Backend
- **Serveur**: Express.js (TypeScript)
- **Port**: 3001
- **Stockage**: Fichier JSON local (`server/leaderboard.json`)
- **API Endpoints**:
  - `GET /api/leaderboard` - Récupère les 10 meilleurs scores
  - `POST /api/leaderboard` - Soumet un nouveau score

### Frontend
- **Service**: `services/leaderboardService.ts` - Interface avec l'API
- **Composant**: `components/Leaderboard.tsx` - Affichage du classement
- **Intégration**: `components/UIOverlay.tsx` - Gestion du flux

## 🎮 Utilisation

1. Lancez le jeu avec `npm start`
2. Jouez et évitez les carrés rouges
3. À la fin de la partie, entrez votre nom
4. Cliquez sur "Submit to Leaderboard"
5. Consultez le classement pour voir votre position

## 📦 Données

Les scores sont stockés dans `server/leaderboard.json`. Le serveur conserve automatiquement les 100 meilleurs scores pour optimiser les performances.

## 🛡️ Sécurité

- Validation des entrées (nom limité à 20 caractères)
- Sanitization des données
- Protection CORS configurée

Profitez du jeu et montez dans le classement ! 🎯
