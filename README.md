# Anniversaire Paul V7.6 - correctif centre de contrôle

La V7.5 est conservée. Seul le bug JavaScript empêchant le tableau du centre de contrôle de s’afficher a été corrigé.

Cause : le script appelait `dashboard_status`, alors que l’élément HTML a l’identifiant `dashboard-status`. L’exécution s’arrêtait avant de remplir le tableau.

## Installation
- Aucun nouveau SQL à exécuter si le SELECT `registration_people_dashboard_v74` retourne déjà les personnes.
- Pousser l’intégralité du ZIP dans GitHub.
- `admin.js` passe à `?v=76` pour forcer le rechargement du fichier corrigé.
