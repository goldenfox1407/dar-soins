# 📘 Guide GitHub — Projet DAR-SOINS

> **Repo :** [https://github.com/goldenfox1407/dar-soins](https://github.com/goldenfox1407/dar-soins)  
> **Visibilité :** 🔒 Privé  
> **Branche principale :** `master`

---

## 🚀 Commandes quotidiennes

### Envoyer tes modifications sur GitHub

```powershell
# 1. Ajouter tous les fichiers modifiés
git add .

# 2. Créer un commit avec une description
git commit -m "description de tes changements"

# 3. Pousser sur GitHub
git push
```

### Récupérer les dernières modifications (faites par un collègue)

```powershell
git pull
```

---

## 👥 Inviter des collaborateurs

1. Va sur [https://github.com/goldenfox1407/dar-soins/settings/access](https://github.com/goldenfox1407/dar-soins/settings/access)
2. Clique sur **Add people**
3. Entre le **username GitHub** ou l'**email** de ton collègue
4. Choisis le rôle (**Write** pour qu'il puisse modifier le code)
5. Le collègue recevra une invitation par email qu'il devra accepter

---

## 📥 Pour un nouveau collègue — Cloner le projet

```powershell
# Cloner le repo sur sa machine
git clone https://github.com/goldenfox1407/dar-soins.git

# Entrer dans le dossier
cd dar-soins
```

---

## 🔍 Commandes utiles

| Commande | Description |
|----------|-------------|
| `git status` | Voir les fichiers modifiés |
| `git log --oneline -10` | Voir les 10 derniers commits |
| `git diff` | Voir les modifications en détail |
| `git branch` | Voir la branche actuelle |
| `git stash` | Mettre de côté des modifications temporairement |
| `git stash pop` | Récupérer les modifications mises de côté |

---

## ⚠️ Bonnes pratiques

- **Toujours faire `git pull` avant de commencer** à travailler pour avoir la dernière version
- **Écrire des messages de commit clairs** : `"ajout page facturation"` plutôt que `"modif"`
- **Ne jamais pousser de fichiers sensibles** (`.env`, mots de passe) — le `.gitignore` est déjà configuré
- **Faire des petits commits réguliers** plutôt qu'un gros commit à la fin de la journée

---

## 🛠️ Configuration initiale (déjà faite)

```powershell
# Config Git
git config --global user.name "goldenfox1407"
git config --global user.email "masterjump@gmail.com"

# Authentification GitHub CLI
gh auth login
gh auth setup-git
```

---

## 📞 En cas de problème

### Conflit lors du pull
```powershell
# 1. Faire le pull
git pull

# 2. Résoudre les conflits dans les fichiers marqués
# 3. Ajouter les fichiers résolus
git add .

# 4. Terminer le merge
git commit -m "résolution des conflits"

# 5. Pousser
git push
```

### Annuler le dernier commit (pas encore poussé)
```powershell
git reset --soft HEAD~1
```

### Voir qui a modifié une ligne
```powershell
git blame nom_du_fichier
```
