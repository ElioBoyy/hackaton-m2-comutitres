CREATE TABLE sequence_annuelle_dossier (
    annee          INTEGER PRIMARY KEY,
    dernier_numero INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE dossier
    ADD COLUMN numero_dossier VARCHAR(20) UNIQUE;
