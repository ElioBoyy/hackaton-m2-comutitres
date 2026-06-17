-- Transports inclus et zones couvertes par type d'abonnement
ALTER TABLE type_abonnement
    ADD COLUMN transports TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN zones      TEXT[] NOT NULL DEFAULT '{}';

-- Tous les abonnements Navigo couvrent Metro, RER, Train, Tramway, Bus, zones 1-5
UPDATE type_abonnement
SET transports = ARRAY['METRO','RER','TRAIN','TRAMWAY','BUS'],
    zones      = ARRAY['Z1','Z2','Z3','Z4','Z5']
WHERE code IN ('NAVIGO_ANNUEL','NAVIGO_MENSUEL','NAVIGO_HEBDO','NAVIGO_LIBERTE_PLUS','NAVIGO_DECOUVERTE');

-- Imagine R : meme couverture que Navigo (toute l'Ile-de-France)
UPDATE type_abonnement
SET transports = ARRAY['METRO','RER','TRAIN','TRAMWAY','BUS'],
    zones      = ARRAY['Z1','Z2','Z3','Z4','Z5']
WHERE code IN ('IMAGINE_R_SCOLAIRE','IMAGINE_R_ETUDIANT','IMAGINE_R_APPRENTI');

-- Amethyste et Solidarite Transport : meme couverture
UPDATE type_abonnement
SET transports = ARRAY['METRO','RER','TRAIN','TRAMWAY','BUS'],
    zones      = ARRAY['Z1','Z2','Z3','Z4','Z5']
WHERE code IN ('AMETHYSTE','SOLIDARITE_TRANSPORT');

-- Transport Scolaire departemental : Bus uniquement, zones variables
UPDATE type_abonnement
SET transports = ARRAY['BUS'],
    zones      = ARRAY['Z1','Z2','Z3','Z4','Z5']
WHERE code = 'TRANSPORT_SCOLAIRE';
