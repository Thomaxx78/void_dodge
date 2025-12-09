# ⚖️ Zone de Jeu Équitable

## Problème résolu

Avant, la taille de l'écran affectait la difficulté :
- **Grand écran** = Plus d'espace → Plus facile
- **Petit écran** = Moins d'espace → Plus difficile
- Nombre de projectiles variable selon la résolution

## Solution

### Zone de Jeu Fixe : 1200x800 pixels

Tous les joueurs jouent maintenant sur un terrain **exactement identique** :
- ✅ Même espace de jeu pour tous
- ✅ Même nombre de projectiles
- ✅ Même difficulté
- ✅ Scores comparables équitablement

### Design Visuel

- **Bordure cyan néon** délimitant la zone de jeu
- **Zone de jeu centrée** sur l'écran
- **Background noir** autour de la zone
- **Indicateur "Arena: 1200x800"** en haut de la zone

### Comportement

1. Le jeu est toujours centré à l'écran
2. Les ennemis apparaissent uniquement aux bords de la zone fixe
3. Le joueur ne peut pas sortir de la zone de jeu
4. Les grilles et particules restent dans la zone

## Recommandations

Pour une expérience optimale :
- **Résolution minimale** : 1280x900 (pour voir toute la zone + UI)
- **Plein écran** recommandé pour une meilleure immersion

## Code

Les changements sont dans [components/GameCanvas.tsx](components/GameCanvas.tsx) :
- **Lignes 16-17** : Constantes `GAME_WIDTH` et `GAME_HEIGHT`
- **Ligne 236-260** : Centrage et bordure de la zone de jeu
- Toutes les coordonnées utilisent maintenant les dimensions fixes

---

**Résultat** : Le leaderboard est désormais 100% équitable ! 🎯
