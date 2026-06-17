-- Ajout des credentials de connexion pour les agents backoffice
-- (jusqu'ici Agent etait une table purement referentielle, sans login).

ALTER TABLE agent
    ADD COLUMN IF NOT EXISTS mot_de_passe_hash VARCHAR(255);
