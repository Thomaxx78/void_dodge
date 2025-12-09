<div align="center">

# 🎮 NEON VOID: HYPER DODGE

<img src="https://img.shields.io/badge/React-19.2.1-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
<img src="https://img.shields.io/badge/TypeScript-5.8.2-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Vite-6.2.0-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io"/>

### *Un jeu d'esquive ultra-nerveux dans un univers cyberpunk néon*

[✨ Fonctionnalités](#-fonctionnalités) • [🚀 Installation](#-installation-rapide) • [🎯 Comment Jouer](#-comment-jouer) • [🔧 Technologies](#-technologies-utilisées)

---

</div>

## 📖 Description

**Neon Void: Hyper Dodge** est un jeu d'arcade moderne où vous devez survivre le plus longtemps possible dans une arène électronique infestée d'obstacles mortels. Contrôlez un point blanc lumineux et esquivez des carrés rouges qui apparaissent de plus en plus rapidement à mesure que votre score augmente.

### 🌟 Pourquoi ce jeu est unique ?

- **Difficulté progressive intelligente** : Le jeu devient plus difficile jusqu'à 1300 points, puis ralentit sa courbe pour maintenir un défi équilibré
- **Mode solo avec IA commentateur** : Gemini 2.5 Flash analyse votre performance et génère des commentaires personnalisés après chaque partie
- **Mode multijoueur en temps réel** : Affrontez vos amis via Socket.io avec synchronisation instantanée
- **Leaderboard global** : Soumettez vos scores et comparez-vous aux meilleurs joueurs
- **Design cyberpunk néon** : Interface soignée avec effets de lumière, grille animée et particules

---

## ✨ Fonctionnalités

### 🎮 Modes de jeu

#### Mode Solo
- Gameplay pur et intense axé sur la survie
- Système de scoring basé sur le temps de survie
- Sauvegarde automatique du meilleur score
- Commentaires IA générés par Gemini après chaque partie
- Arène de jeu fixe (1000×600) pour un gameplay équitable

#### Mode Multijoueur 🆕
- Créez ou rejoignez une salle avec un code unique (6 caractères)
- Jusqu'à **5 joueurs** simultanés par room
- Chaque joueur a une **couleur unique** parmi 5 couleurs vives
- Synchronisation en temps réel via **WebSocket** (Socket.IO)
- Voyez les autres joueurs bouger en direct
- **Le dernier survivant gagne !**
- Système de lobby avec statut "Ready"
- L'hôte lance la partie quand tout le monde est prêt

### 🏆 Système de Progression

- **Score dynamique** : Chaque frame de survie augmente votre score
- **Difficulté évolutive** :
  - Jusqu'à 1300 points : difficulté linéaire croissante
  - Après 1300 points : ralentissement de la courbe (×0.25)
  - Vitesse des ennemis augmente progressivement
  - Fréquence d'apparition accélérée
  - Multi-spawn à partir de 500 points

### 🎨 Expérience Visuelle

- **Effets néon** avec ombres lumineuses (glow effects)
- **Grille animée** en arrière-plan pour sensation de vitesse
- **Particules de mouvement** (speed lines)
- **Traînées d'ennemis** pour anticiper les trajectoires
- **Interface cyberpunk** inspirée des années 80
- **Arène délimitée** avec bordure néon cyan

### 🤖 Intelligence Artificielle

Intégration de **Gemini 2.5 Flash** pour générer des commentaires post-game personnalisés basés sur :
- Votre score final
- Le temps de survie
- Les patterns de jeu observés

---

## 🚀 Installation Rapide

### Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**

### Installation en Local

```bash
# 1. Cloner le repository
git clone <votre-repo-url>
cd dodge

# 2. Installer les dépendances
npm install

# 3. Configurer l'API Gemini
# Créer un fichier .env.local à la racine du projet
echo "VITE_GEMINI_API_KEY=votre_clé_api_ici" > .env.local

# 4. Lancer le jeu complet (frontend + serveurs)
npm start
```

Le jeu sera accessible sur **http://localhost:3001**

### Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance uniquement le frontend (Vite) |
| `npm run server` | Lance le serveur de leaderboard |
| `npm run multiplayer` | Lance le serveur multijoueur Socket.io |
| `npm start` | Lance tout simultanément |
| `npm run build` | Compile le projet pour production |

### 🌐 Déploiement en Production

Pour mettre le jeu en ligne avec le mode multiplayer fonctionnel :

**📖 Consultez le guide complet : [DEPLOYMENT-MULTIPLAYER.md](DEPLOYMENT-MULTIPLAYER.md)**

Résumé rapide :
1. **Frontend** → Vercel (gratuit, déjà configuré)
2. **Serveur Multiplayer** → Render.com ou Railway.app (gratuit)
3. Configurez `VITE_MULTIPLAYER_URL` sur Vercel
4. Configurez `FRONTEND_URL` sur votre serveur multiplayer

Le mode solo fonctionne directement sur Vercel sans configuration supplémentaire.

---

## 🎯 Comment Jouer

### Contrôles

| Touche | Action |
|--------|--------|
| **↑ W** | Déplacer vers le haut |
| **↓ S** | Déplacer vers le bas |
| **← A** | Déplacer vers la gauche |
| **→ D** | Déplacer vers la droite |

### Règles

1. **Objectif** : Survivez le plus longtemps possible
2. **Évitez** : Les carrés rouges qui apparaissent aux bords de l'écran
3. **Restez** : Dans la zone de jeu délimitée (1000×600 pixels)
4. **Scorez** : Chaque frame de survie = +1 point
5. **Un seul contact** avec un ennemi = Game Over

### Astuces Pro

- 🎯 **Anticipez les trajectoires** : Les ennemis ont des traînées pour vous aider
- 🌀 **Mouvements diagonaux** : Automatiquement normalisés pour une vitesse constante
- 📍 **Restez au centre** : Vous aurez plus d'espace pour esquiver
- ⚡ **Après 1300 points** : La difficulté ralentit, c'est le moment de viser le top !
- 👥 **Mode multi** : Utilisez les autres joueurs comme points de référence

---

## 🔧 Technologies Utilisées

### Frontend

- **React 19.2.1** - Framework UI moderne
- **TypeScript 5.8.2** - Typage statique pour plus de robustesse
- **Vite 6.2.0** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utilitaire pour l'interface cyberpunk
- **Canvas API** - Rendu 2D haute performance pour le gameplay

### Backend

- **Express 5.2.1** - Serveur HTTP pour le leaderboard
- **Socket.io 4.8.1** - WebSocket pour le multijoueur temps réel
- **CORS** - Gestion des requêtes cross-origin
- **tsx** - Exécution TypeScript côté serveur

### IA & Services

- **Google Gemini 2.5 Flash** - Génération de commentaires intelligents
- **LocalStorage** - Sauvegarde locale du high score

---

## 📁 Structure du Projet

```
dodge/
├── components/
│   ├── GameCanvas.tsx           # Canvas de jeu solo
│   ├── UIOverlay.tsx            # Interface utilisateur solo
│   ├── MultiplayerSetup.tsx     # Écran de config multijoueur
│   ├── MultiplayerLobby.tsx     # Salle d'attente
│   ├── MultiplayerGameCanvas.tsx # Canvas multijoueur
│   ├── MultiplayerUIOverlay.tsx  # UI multijoueur
│   └── Leaderboard.tsx          # Tableau des scores
├── services/
│   ├── geminiService.ts         # Intégration Gemini AI
│   ├── leaderboardService.ts    # API leaderboard
│   └── multiplayerService.ts    # Client Socket.io
├── server/
│   ├── index.ts                 # Serveur leaderboard
│   └── multiplayer.ts           # Serveur Socket.io
├── types/
│   ├── index.ts                 # Types du jeu
│   └── multiplayer.ts           # Types multijoueur
├── App.tsx                      # Point d'entrée principal
└── package.json                 # Dépendances et scripts
```

---

## 🎮 Captures d'Écran

### Menu Principal
Interface épurée style cyberpunk avec choix entre Solo, Multijoueur et Leaderboard.

### En Jeu
- Arène fixe de 1000×600 pixels avec bordure néon cyan
- Grille animée en arrière-plan
- HUD minimaliste affichant le score actuel et le record
- Particules de mouvement pour l'effet de vitesse

### Game Over
- Écran de fin avec bordure rouge pulsante
- Affichage du score et du meilleur score
- Commentaire IA personnalisé
- Formulaire de soumission au leaderboard
- Options : Retry ou View Leaderboard

---

## 🌐 API et Services

### Leaderboard API

Le serveur Express expose une API pour gérer les scores :

- **POST** `/api/submit-score` - Soumettre un score
  ```json
  {
    "playerName": "string",
    "score": "number"
  }
  ```

- **GET** `/api/leaderboard` - Récupérer le top scores

### Serveur Multijoueur

Socket.io gère les événements en temps réel :

- `create-room` - Créer une salle
- `join-room` - Rejoindre une salle
- `start-game` - Démarrer la partie
- `player-move` - Synchroniser les mouvements
- `player-died` - Signaler une élimination

---

## 🎨 Palette de Couleurs

| Couleur | Code | Utilisation |
|---------|------|-------------|
| Blanc Néon | `#ffffff` | Joueur, texte principal |
| Rouge Néon | `#ff0033` | Ennemis, danger |
| Cyan Néon | `#00ffff` | Bordures, leaderboard |
| Jaune Néon | `#ffc107` | High score |
| Violet Néon | `#a855f7` | Multijoueur |
| Noir Profond | `#000000` | Fond principal |

---

## 🚧 Développement

### Ajouter de nouvelles fonctionnalités

Le code est structuré de manière modulaire :

- **Mécanique de jeu** : Modifier `GameCanvas.tsx`
- **Difficulté** : Ajuster les constantes en haut de `GameCanvas.tsx`
- **UI** : Éditer `UIOverlay.tsx`
- **Multijoueur** : Serveur dans `server/multiplayer.ts`, client dans `services/multiplayerService.ts`

### Paramètres de Jeu Configurables

```typescript
// GameCanvas.tsx
const PLAYER_SIZE = 12;           // Taille du joueur
const PLAYER_SPEED = 6;           // Vitesse de déplacement
const SPAWN_RATE_INITIAL = 60;    // Frames entre spawns
const ENEMY_SPEED_BASE = 3;       // Vitesse de base des ennemis
const GAME_WIDTH = 1000;          // Largeur de l'arène
const GAME_HEIGHT = 600;          // Hauteur de l'arène
```

---

## 📝 Licence

Ce projet est un projet personnel. Libre d'utilisation pour l'apprentissage.

---

## 🙏 Crédits

- **Développement** : Thomas Filhol
- **IA Commentateur** : Google Gemini 2.5 Flash
- **Inspiration** : Jeux d'arcade classiques et esthétique cyberpunk

---

<div align="center">

### 🌟 Bon courage dans le Void ! 🌟

**Survivez. Esquivez. Dominez.**

Made with ⚡ and lots of ☕

</div>
