# 🚀 Déploiement sur Vercel

Votre jeu est maintenant configuré pour fonctionner sur Vercel avec un backend serverless !

## ✅ Ce qui a été fait

1. **Fonction serverless** créée dans [api/leaderboard.ts](api/leaderboard.ts)
   - Remplace le serveur Express traditionnel
   - Compatible avec l'infrastructure Vercel
   - Gère GET et POST pour le leaderboard

2. **Configuration Vercel** ajoutée dans [vercel.json](vercel.json)
   - Routes API configurées
   - Build optimisé pour Vite

3. **URLs API dynamiques** dans [services/leaderboardService.ts](services/leaderboardService.ts:2)
   - Utilise `/api` en production
   - Utilise `http://localhost:3001/api` en développement local

## 📝 Limitations Actuelles

⚠️ **IMPORTANT** : Le stockage actuel est **en mémoire** dans la fonction serverless. Cela signifie :
- Les scores seront **réinitialisés** à chaque nouveau déploiement
- Les scores peuvent être perdus lors du "cold start" de la fonction
- Ce n'est **pas adapté** pour une utilisation en production réelle

## 🔄 Pour un stockage persistant (Production)

Vous devez choisir une solution de base de données. Voici les options recommandées :

### Option 1 : Vercel KV (Redis) - Le plus simple
```bash
# Installer le client
npm install @vercel/kv

# Dans le dashboard Vercel :
# 1. Aller dans votre projet
# 2. Storage > Create Database > KV
# 3. Connecter à votre projet
```

### Option 2 : Vercel Postgres
```bash
npm install @vercel/postgres
```

### Option 3 : Base de données externe
- MongoDB Atlas (gratuit)
- PlanetScale (MySQL)
- Supabase (PostgreSQL)
- Firebase Realtime Database

## 🎯 Déploiement Actuel (avec stockage temporaire)

### Via le Dashboard Vercel
1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement la config
3. Le déploiement se fera automatiquement

### Via la CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ou déployer en production
vercel --prod
```

## 🔧 Configuration requise dans Vercel

Aucune variable d'environnement n'est requise pour la version actuelle.

Si vous ajoutez une base de données externe, vous devrez ajouter :
- `DATABASE_URL` (pour PostgreSQL/MySQL)
- Ou les credentials spécifiques à votre service

## 🧪 Tester en local

Le développement local continue de fonctionner comme avant :

```bash
# Terminal 1 : Serveur Express (pour le dev local)
npm run server

# Terminal 2 : Frontend
npm run dev
```

Ou tout en un :
```bash
npm start
```

## 📊 Migration vers un stockage persistant

Quand vous serez prêt, je peux vous aider à :
1. Choisir une solution de base de données
2. Migrer le code de [api/leaderboard.ts](api/leaderboard.ts)
3. Configurer les variables d'environnement
4. Tester la persistence

---

**Status actuel** : ✅ Prêt pour déploiement test
**Status production** : ⚠️ Nécessite une base de données persistante
