# Anniversaire Paul V7.5

Correctifs ciblés uniquement :
- wording plus propre pour l'ajout d'accompagnants ;
- centre de contrôle : une ligne séparée par personne ;
- bouton SUPPRIMER sur chaque personne ;
- affichage explicite si aucune inscription n'est trouvée ;
- SQL V7.5 de remise en place de la vue et de ses droits.

## Installation
1. La V7.4 doit déjà être installée.
2. Exécuter `SUPABASE_V75_PATCH.sql` dans Supabase SQL Editor.
3. Vérifier que le SELECT final affiche bien une ligne par personne.
4. Pousser ensuite tous les fichiers du ZIP à la racine de GitHub.
