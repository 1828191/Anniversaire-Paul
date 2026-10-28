# Anniversaire Paul V7.2 - Invitation générique

Version basée sur la V7.1 Cartoon Final.

Seules les modifications nécessaires au passage d'une invitation personnalisée à une invitation générique ont été effectuées :
- saisie du prénom et du nom directement dans le formulaire ;
- enregistrement dans la table Supabase `registrations` ;
- centre de contrôle alimenté par `registrations` ;
- remplacement de la statistique « En attente » par « Absents » car il n'existe plus de liste préalable d'invités.

## Installation
1. Exécuter `SUPABASE_MIGRATION.sql` dans Supabase > SQL Editor.
2. Déposer tous les fichiers du ZIP à la racine du dépôt GitHub.
3. Conserver `supabase.js` avec l'URL et la clé publiable du projet actuel.

L'ancien contenu des tables `guests` et `responses` n'est pas supprimé. Le script retire seulement leurs droits aux rôles publics `anon` et `authenticated`.
