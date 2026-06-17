-- Suppression des statuts obsoletes
DELETE FROM statut_dossier WHERE code IN ('SOUMIS', 'PIECES_VALIDEES', 'SUSPENDU', 'RESILIATION_EN_COURS');

-- Renommage PIECES_MANQUANTES -> INCOMPLET
UPDATE statut_dossier SET code = 'INCOMPLET', libelle = 'Incomplet' WHERE code = 'PIECES_MANQUANTES';

-- Mise a jour du libelle EN_VERIFICATION
UPDATE statut_dossier SET libelle = 'En cours de verification' WHERE code = 'EN_VERIFICATION';

-- Reordonnancement
UPDATE statut_dossier SET ordre = 1 WHERE code = 'BROUILLON';
UPDATE statut_dossier SET ordre = 2 WHERE code = 'EN_VERIFICATION';
UPDATE statut_dossier SET ordre = 3 WHERE code = 'INCOMPLET';
UPDATE statut_dossier SET ordre = 4 WHERE code = 'EN_ATTENTE_PAIEMENT';
UPDATE statut_dossier SET ordre = 5 WHERE code = 'VALIDE';
UPDATE statut_dossier SET ordre = 6 WHERE code = 'ACTIF';
UPDATE statut_dossier SET ordre = 7 WHERE code = 'REJETE';
UPDATE statut_dossier SET ordre = 8 WHERE code = 'RESILIE';
UPDATE statut_dossier SET ordre = 9 WHERE code = 'EXPIRE';
