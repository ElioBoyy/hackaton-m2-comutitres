# Points de vente du passe Navigo — capture

> Capture réalisée le 15/06/2026. Sources officielles Île-de-France Mobilités et
> data.iledefrance-mobilites.fr. Aucune donnée inventée ; pages vides signalées.

---

## 1. Où se procurer un passe Navigo, à quel prix ?

Source : <https://www.iledefrance-mobilites.fr/aide-et-contacts/passe-navigo/ou-puis-je-me-procurer-un-passe-navigo-a-quel-prix>

> Le passe Navigo est délivré **gratuitement** aux personnes résidant ou travaillant en
> Île-de-France.

### En agence

- Se rendre dans une agence commerciale des transporteurs ou certains comptoirs RATP
  (voir la carte des points de vente).
- Apporter un justificatif d'identité et un justificatif de domicile.
- Photo prise sur place ; passe remis immédiatement.

### En ligne

- Commander depuis l'espace Mon Navigo en ligne.
- Remplir le formulaire et télécharger une photo récente.
- Réception sous **3 semaines à domicile** ou sous **3 jours ouvrés** pour un retrait en
  agence / comptoirs RATP ou Guichets Services Navigo SNCF.

### Par correspondance

- Se procurer le formulaire de demande (agences commerciales, certains comptoirs RATP ou
  Guichet Services Navigo SNCF).
- L'envoyer avec une photo d'identité à l'Agence Navigo.
- Réception sous **21 jours maximum**.

> Note : si vous travaillez en Île-de-France sans y résider, le passe s'obtient **uniquement par
> correspondance** (formulaire + photo + attestation employeur/organisme de stage avec n° SIRET
> de l'établissement francilien).

---

## 2. Dataset open data « points-de-vente »

Source / portail : <https://data.iledefrance-mobilites.fr/explore/dataset/points-de-vente/>

Description du jeu de données (chiffres communiqués et déjà vérifiés dans le cadre de cette mission) :

- **2 012 points de vente** au total, répartis en :
  - **1 399 commerces de proximité** (buralistes / commerces équipés d'un terminal de rechargement Navigo)
  - **613 guichets Navigo** (guichets / agences des transporteurs RATP, SNCF Transilien)

Le dataset recense les points où il est possible d'acheter et/ou recharger des titres de transport
(passe Navigo, forfaits, tickets). Il sert de source à la carte interactive « points de vente » du
portail (voir §3).

> Précision méthodologique : les chiffres 2 012 / 1 399 / 613 proviennent de l'énoncé de la mission
> (présentés comme « déjà vérifié »). Le détail des champs (colonnes, géolocalisation, horaires,
> type d'équipement) n'a pas été re-extrait ici ; pour la structure exacte du dataset, se référer à
> la page du dataset ci-dessus (onglet « Informations » / « Schéma »).

---

## 3. Carte interactive des points de vente

Source : <https://www.iledefrance-mobilites.fr/cartes/points-de-vente>

> **Page non capturable en l'état.** La récupération via web_fetch n'a renvoyé que le bandeau de
> consentement aux cookies (« Ce site utilise des cookies… ») : le contenu de la carte est rendu
> côté navigateur (JavaScript) et n'est pas présent dans le HTML statique. La carte permet de
> localiser les agences, comptoirs, guichets et commerces de proximité ; elle s'appuie sur le
> dataset décrit au §2.

Cette page est donc **vide de contenu textuel exploitable** par capture HTTP simple. Aucune donnée
n'a été inventée pour la compléter.

---

## Sources

- <https://www.iledefrance-mobilites.fr/aide-et-contacts/passe-navigo/ou-puis-je-me-procurer-un-passe-navigo-a-quel-prix> (capturée le 15/06/2026)
- <https://data.iledefrance-mobilites.fr/explore/dataset/points-de-vente/> (référencée ; chiffres fournis et présentés comme vérifiés dans la mission)
- <https://www.iledefrance-mobilites.fr/cartes/points-de-vente> (page JS — non capturable, bandeau cookies uniquement, le 15/06/2026)
