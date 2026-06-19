-- Flag pose sur chaque piece quand le client lance la pre-verification IA.
-- Reset a false lors d'un remplacement de fichier (le nouveau contenu n'a
-- pas ete vu par l'IA). Visible cote agent dans le backoffice.
ALTER TABLE piece_justificative ADD COLUMN verifie_par_ia BOOLEAN NOT NULL DEFAULT FALSE;
