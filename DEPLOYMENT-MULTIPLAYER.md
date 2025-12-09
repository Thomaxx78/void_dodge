# 🚀 Déploiement Multiplayer en Production

## Vue d'ensemble

Le système multiplayer nécessite 2 déploiements séparés :
1. **Frontend (Vercel)** - L'application React
2. **Serveur Multiplayer (Render/Railway)** - Le serveur Socket.IO

---

## Option 1 : Déployer sur Render.com (Recommandé - Gratuit)

### Étape 1 : Déployer le serveur multiplayer sur Render

1. **Créer un compte sur [Render.com](https://render.com)**

2. **Créer un nouveau Web Service** :
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository GitHub
   - Utilisez ces paramètres :
     - **Name** : `dodge-multiplayer-server`
     - **Environment** : `Node`
     - **Build Command** : `npm install`
     - **Start Command** : `npm run multiplayer:prod`
     - **Plan** : Free

3. **Ajouter les variables d'environnement** :
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://votre-app.vercel.app` (vous l'obtiendrez après l'étape 2)

4. **Déployer** → Notez l'URL de votre serveur (ex: `https://dodge-multiplayer-server.onrender.com`)

### Étape 2 : Déployer le frontend sur Vercel

1. **Ajouter la variable d'environnement sur Vercel** :
   - Allez dans Settings → Environment Variables
   - Ajoutez : `VITE_MULTIPLAYER_URL` = `https://dodge-multiplayer-server.onrender.com`

2. **Redéployer sur Vercel** :
   ```bash
   git add .
   git commit -m "Add multiplayer production config"
   git push
   ```

3. **Retourner sur Render** et mettez à jour `FRONTEND_URL` avec votre URL Vercel finale

---

## Option 2 : Déployer sur Railway.app

### Étape 1 : Déployer sur Railway

1. **Créer un compte sur [Railway.app](https://railway.app)**

2. **Créer un nouveau projet** :
   - Cliquez sur "New Project" → "Deploy from GitHub repo"
   - Sélectionnez votre repository
   - Railway détectera automatiquement le fichier `railway.json`

3. **Configurer les variables d'environnement** :
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://votre-app.vercel.app`
   - Railway génère automatiquement la variable `PORT`

4. **Déployer** → Notez votre URL Railway

### Étape 2 : Configurer Vercel

Même chose que l'Option 1, Étape 2.

---

## Option 3 : Heroku (Payant)

### Étape 1 : Déployer sur Heroku

```bash
# Installer Heroku CLI
brew install heroku/brew/heroku  # macOS
# ou télécharger depuis heroku.com

# Login
heroku login

# Créer l'app
heroku create dodge-multiplayer-server

# Configurer les variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://votre-app.vercel.app

# Déployer
git push heroku main

# Vérifier les logs
heroku logs --tail
```

### Étape 2 : Configurer Vercel

Ajoutez `VITE_MULTIPLAYER_URL` avec votre URL Heroku sur Vercel.

---

## Configuration Finale

### 1. Vérifier que tout fonctionne

- Ouvrez votre app Vercel
- Cliquez sur "Multiplayer"
- Créez une room
- Ouvrez un autre onglet/navigateur
- Rejoignez avec le code

### 2. CORS - Si vous avez des erreurs

Retournez sur votre serveur multiplayer et vérifiez que `FRONTEND_URL` est bien configuré.

---

## Architecture de Production

```
┌─────────────────────────────────────┐
│   Joueur 1 (Browser)                │
│   https://votre-app.vercel.app      │
└─────────────┬───────────────────────┘
              │
              │ WebSocket
              ├──────────────────────────┐
              │                          │
┌─────────────▼───────────────────┐    │
│   Joueur 2 (Browser)            │    │
│   https://votre-app.vercel.app  │    │
└─────────────┬───────────────────┘    │
              │                         │
              │ WebSocket               │
              │                         │
        ┌─────▼─────────────────────────▼─────┐
        │  Multiplayer Server (Socket.IO)     │
        │  Render/Railway/Heroku              │
        │  Port: process.env.PORT             │
        └─────────────────────────────────────┘
```

---

## Variables d'Environnement - Récapitulatif

### Sur le serveur multiplayer (Render/Railway/Heroku)
- `NODE_ENV` = `production`
- `FRONTEND_URL` = L'URL de votre app Vercel
- `PORT` = (Auto-généré par la plateforme)

### Sur Vercel (Frontend)
- `VITE_MULTIPLAYER_URL` = L'URL de votre serveur multiplayer
- `VITE_GEMINI_API_KEY` = Votre clé API Gemini (déjà configuré)

---

## Troubleshooting

### Erreur : "Failed to connect to multiplayer server"
- Vérifiez que `VITE_MULTIPLAYER_URL` est bien configuré sur Vercel
- Vérifiez que le serveur multiplayer est bien démarré (check les logs)

### Erreur CORS
- Assurez-vous que `FRONTEND_URL` sur le serveur correspond exactement à votre URL Vercel
- Pas de `/` à la fin de l'URL

### Le serveur s'endort (Render Free Tier)
- Le tier gratuit de Render met le serveur en veille après 15 min d'inactivité
- Il redémarre automatiquement à la première connexion (prend ~30 secondes)
- Pour éviter ça : upgrade au plan payant ($7/mois) ou utilisez Railway

---

## Coûts

| Service | Plan Gratuit | Plan Payant |
|---------|--------------|-------------|
| **Vercel** | Illimité (frontend) | - |
| **Render** | 750h/mois, se met en veille | $7/mois (toujours actif) |
| **Railway** | $5 crédit/mois | Pay-as-you-go |
| **Heroku** | ❌ Plus de tier gratuit | $7/mois minimum |

**Recommandation** : Render.com (gratuit) pour commencer, puis passer au plan payant si besoin.

---

## Tests après déploiement

1. ✅ Ouvrir l'app en production
2. ✅ Cliquer sur "Multiplayer"
3. ✅ Créer une room → Vérifier que le code s'affiche
4. ✅ Ouvrir un autre navigateur/onglet incognito
5. ✅ Rejoindre avec le code
6. ✅ Lancer la partie
7. ✅ Vérifier que les joueurs se voient bouger en temps réel

---

Bon déploiement ! 🎮
