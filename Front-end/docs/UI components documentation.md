# UI Components Documentation

## Goal

Créer des composants UI réutilisables et cohérents afin de standardiser l’interface utilisateur du projet.

---

## Scope & Checklist

Cette documentation couvre la création et l’utilisation des composants UI suivants :

### Components

- Button component
- Input component
- Modal component

### Styling

- Utilisation des classes utilitaires Tailwind CSS
- Cohérence visuelle basée sur le thème Tailwind

### Documentation

- Documentation rapide d’utilisation
- Exemples d’intégration

---

## Architecture & Styling

Les composants UI sont définis individuellement et importés directement depuis leurs fichiers respectifs.
Chaque composant est implémenté sous forme de composant React fonctionnel (JSX).

À ce stade, il n’existe pas encore de point d’export centralisé pour les composants UI.

Le styling repose sur les classes utilitaires de Tailwind CSS, permettant une mise en forme rapide et cohérente à partir du thème Tailwind (couleurs, espacements, rayons et états).
Les styles globaux de l’application sont chargés au démarrage via un fichier CSS principal.

---

## Components

### Button

Composant de bouton réutilisable.
Il accepte du contenu dynamique et permet de gérer les états standards (disabled, hover) via les classes Tailwind.

### Input

Composant de champ de saisie réutilisable destiné aux formulaires.
Il peut être enrichi pour gérer des labels, messages d’erreur ou indications supplémentaires.

### Modal

Composant de fenêtre modale permettant d’afficher du contenu contextuel.
Son implémentation vise à centraliser la gestion des overlays et interactions associées.

---

## Usage

Les composants sont importés directement dans les pages ou composants React selon les besoins.
Chaque composant expose une API simple basée sur les props React afin de faciliter son intégration.

## Exemple — Afficher un bouton sur la page Home

- Créer ou ouvrir la page Home (`Home.jsx`)
- Importer le composant Button depuis son fichier
- Ajouter le composant Button dans le JSX
- Lancer l’application et vérifier l’affichage

### Code dans Home.jsx:

import Button from "./components/ui/Button";

function Home() {
 return Click me;
}