-- Postgres n'a pas de UNIQUE multi-table natif : un meme email pourrait sinon
-- exister a la fois dans utilisateur (client) et agent (backoffice), ce qui
-- rendrait le login unifie (/auth/login) ambigu. On l'empeche via triggers.

-- SQLSTATE 23505 (unique_violation) : permet a Hibernate de traduire l'erreur
-- en ConstraintViolationException/DataIntegrityViolationException reconnue,
-- au lieu d'une JpaSystemException generique mal interpretee plus haut dans la
-- pile (cf. GlobalExceptionHandler / adapters qui l'attrapent specifiquement).
CREATE OR REPLACE FUNCTION verifier_email_unique_utilisateur() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM agent WHERE email = NEW.email) THEN
        RAISE EXCEPTION 'email % deja utilise par un agent', NEW.email
            USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verifier_email_unique_agent() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM utilisateur WHERE email = NEW.email) THEN
        RAISE EXCEPTION 'email % deja utilise par un utilisateur', NEW.email
            USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_email_unique_utilisateur
    BEFORE INSERT OR UPDATE OF email ON utilisateur
    FOR EACH ROW EXECUTE FUNCTION verifier_email_unique_utilisateur();

CREATE TRIGGER trg_email_unique_agent
    BEFORE INSERT OR UPDATE OF email ON agent
    FOR EACH ROW EXECUTE FUNCTION verifier_email_unique_agent();
