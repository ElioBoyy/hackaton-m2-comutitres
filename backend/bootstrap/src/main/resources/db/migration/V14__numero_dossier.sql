-- Sequence pour les nouveaux numeros de dossier
CREATE SEQUENCE dossier_numero_seq START 1000;

-- Colonne numero_dossier avec DEFAULT automatique via sequence
ALTER TABLE dossier
    ADD COLUMN numero_dossier VARCHAR(12)
        DEFAULT 'DNV-' || LPAD(nextval('dossier_numero_seq')::TEXT, 6, '0');

-- Dossiers existants : numero derive de l'id
UPDATE dossier
SET numero_dossier = 'DNV-' || LPAD(id_dossier::TEXT, 6, '0')
WHERE numero_dossier IS NULL;

ALTER TABLE dossier
    ALTER COLUMN numero_dossier SET NOT NULL,
    ADD CONSTRAINT dossier_numero_dossier_unique UNIQUE (numero_dossier);
