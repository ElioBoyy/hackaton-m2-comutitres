-- Support du RecommendationWizard (front) : la situation de l'usager et le
-- nom du beneficiaire (si demande pour un tiers) sont stockes en texte libre
-- sur le dossier plutot que via une relation vers `situation`/`utilisateur`,
-- car ces tables-la ne sont fiables qu'en environnement seede (cf. CONTEXT.md).
ALTER TABLE dossier
    ADD COLUMN situation_code           VARCHAR(30) NOT NULL DEFAULT 'AUTRE',
    ADD COLUMN situation_precision      VARCHAR(200),
    ADD COLUMN boursier                 BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN beneficiaire_nom_complet VARCHAR(200);

-- Type de piece necessaire en fonctionnement reel (pas seulement en demo),
-- donc insere ici plutot que dans DataSeeder.
INSERT INTO type_piece_justificative (code, libelle, description, duree_validite_jours)
VALUES ('NOTIFICATION_BOURSE', 'Notification conditionnelle de bourse',
        'Document CROUS attestant du statut de boursier sur criteres sociaux', 365);
