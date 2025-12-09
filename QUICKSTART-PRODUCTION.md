# 🚀 Guide Rapide - Mise en Production

## Étapes simples pour mettre le multiplayer en ligne

### 1️⃣ Déployer le serveur multiplayer sur Render

1. Allez sur **[render.com](https://render.com)** et créez un compte gratuit

2. Cliquez sur **"New +"** → **"Web Service"**

3. Connectez votre repository GitHub

4. **Configuration** :
   - Name: `dodge-multiplayer`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm run multiplayer:prod`
   - Plan: **Free**

5. **Variables d'environnement** (onglet "Environment") :
   ```
   NODE_ENV = production
   FRONTEND_URL = https://votre-app.vercel.app
   ```
   ⚠️ Vous obtiendrez l'URL Vercel à l'étape 2

6. Cliquez sur **"Create Web Service"**

7. **Notez l'URL** donnée par Render (ex: `https://dodge-multiplayer.onrender.com`)

---

### 2️⃣ Configurer Vercel

1. Allez sur **[vercel.com](https://vercel.com)** → votre projet

2. **Settings** → **Environment Variables** → **Add New**

3. Ajoutez :
   ```
   Name: VITE_MULTIPLAYER_URL
   Value: https://dodge-multiplayer.onrender.com
   ```
   (utilisez l'URL de l'étape 1)

4. **Redéployez** :
   ```bash
   git add .
   git commit -m "Add multiplayer production config"
   git push
   ```

---

### 3️⃣ Finaliser

1. **Retournez sur Render** et mettez à jour la variable `FRONTEND_URL` avec votre URL Vercel finale

2. **Redémarrez** le service sur Render (bouton "Manual Deploy" → "Deploy latest commit")

---

### ✅ Tester

1. Ouvrez votre app Vercel
2. Cliquez sur **"Multiplayer"**
3. Créez une room → vous obtenez un code
4. Ouvrez un autre onglet/navigateur
5. Rejoignez avec le code
6. Jouez ! 🎮

---

## ⚠️ Notes Importantes

### Tier gratuit de Render
- Le serveur **s'endort après 15 minutes d'inactivité**
- Il **redémarre automatiquement** à la première connexion (~30 secondes)
- Pour éviter ça : passer au plan payant ($7/mois) ou utiliser Railway

### Si ça ne marche pas

**Erreur de connexion :**
- Vérifiez que `VITE_MULTIPLAYER_URL` est bien configuré sur Vercel
- Vérifiez que le serveur Render est bien démarré (logs)

**Erreur CORS :**
- Assurez-vous que `FRONTEND_URL` correspond exactement à votre URL Vercel
- Pas de `/` à la fin

**Le serveur ne démarre pas :**
- Vérifiez les logs sur Render (onglet "Logs")
- Vérifiez que `npm run multiplayer:prod` fonctionne en local

---

## 💰 Coûts

| Service | Coût |
|---------|------|
| Vercel (Frontend) | **Gratuit** ✅ |
| Render (Serveur) | **Gratuit** ✅ (avec sleep) |
| Total | **0€/mois** 🎉 |

Upgrade possible à 7€/mois sur Render pour éviter le sleep.

---

## 📚 Plus de détails

Consultez [DEPLOYMENT-MULTIPLAYER.md](DEPLOYMENT-MULTIPLAYER.md) pour :
- Déploiement sur Railway.app
- Déploiement sur Heroku
- Troubleshooting avancé
- Architecture complète

---

Bon déploiement ! 🚀
