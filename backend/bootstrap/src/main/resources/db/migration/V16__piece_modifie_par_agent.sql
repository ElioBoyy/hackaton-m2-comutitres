-- Indicateur "cette piece a ete deposee ou remplacee par un agent depuis le
-- backoffice". Permet d'afficher coté client une mention "Modifiée par un
-- agent" sans divulguer l'identite de l'agent.
ALTER TABLE piece_justificative
  ADD COLUMN modifie_par_agent BOOLEAN NOT NULL DEFAULT FALSE;
