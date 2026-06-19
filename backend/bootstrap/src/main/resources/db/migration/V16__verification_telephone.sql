-- verification du telephone par OTP (Infobip 2FA) a l'onboarding
-- telephone existe deja (V3) ; on ajoute le statut de verification et le pinId courant
ALTER TABLE utilisateur
    ADD COLUMN telephone_verifie BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN telephone_pin_id  VARCHAR(64);
