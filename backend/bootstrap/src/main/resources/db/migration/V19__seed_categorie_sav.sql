-- Seed des categories de reclamation SAV. La table categorie_sav (creee en V1)
-- etait vide : l'ouverture d'une reclamation cote client a besoin d'une
-- categorie de reference. Les codes correspondent a ceux de l'UI (CategorieReclamation
-- cote front : PAIEMENT / ABONNEMENT / CARTE / REMBOURSEMENT / AUTRE).
-- Idempotent (ON CONFLICT sur le code unique) pour rester rejouable sans risque.

INSERT INTO categorie_sav (code, libelle, canal_prioritaire, description) VALUES
    ('PAIEMENT',      'Probleme de paiement',      'email',     'Prelevements, double facturation, moyen de paiement'),
    ('ABONNEMENT',    'Probleme d''abonnement',    'email',     'Souscription, suspension, resiliation, changement de forfait'),
    ('CARTE',         'Carte Navigo',              'telephone', 'Perte, vol, dysfonctionnement ou duplicata du passe Navigo'),
    ('REMBOURSEMENT', 'Demande de remboursement',  'email',     'Remboursements, avoirs, dedommagements'),
    ('AUTRE',         'Autre demande',             'chatbot',   'Toute autre demande non couverte par les categories ci-dessus')
ON CONFLICT (code) DO NOTHING;
