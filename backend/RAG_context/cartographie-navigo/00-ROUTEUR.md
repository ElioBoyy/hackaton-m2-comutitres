# 00 — ROUTEUR / Cartographie de la data souscription Navigo

**Rôle de ce fichier :** point d'entrée unique. Il cartographie toute la data capturée des sites **comutitres.fr**, **iledefrance-mobilites.fr** et **solidarite-transport.iledefrance-mobilites.fr**, organisée en arborescence. Chaque entrée pointe vers le fichier qui contient le contenu réel.

**Date de capture :** 15 juin 2026 · **Volume :** 94 fichiers, ~824 Ko · **Méthode :** fetch des pages publiques + open data, converties en Markdown (contenu réel, non résumé sauf blocs RGPD répétitifs des CGVU).

---

## ⚠️ Périmètre et limites (à lire d'abord)

- **Capturé :** tout le contenu **public** pertinent à la souscription (forfaits, parcours, FAQ/edge cases, corpus légal CGV/CGU/CGVU, RGPD, accessibilité, points de vente, solidarité, Améthyste).
- **NON capturé, par nature :**
  - **`jegeremacartenavigo.iledefrance-mobilites.fr/espace_client`** → espace personnel **authentifié** (données clients). Hors d'atteinte et hors-éthique à aspirer.
  - Pages **rendues en JavaScript** revenues vides au fetch : `je-gere-ma-carte`, certaines fiches `titres-et-tarifs/detail/*`, la carte interactive `cartes/points-de-vente`. Listées plus bas. Pour les extraire : navigateur headless.
  - **Sitemap IDFM tronqué** à 555 URL (s'arrête à la lettre « o » des actualités) → l'inventaire `index-urls.md` ne reflète pas le site entier.
- **Pas de page « IA Act » dédiée** sur le site IDFM (vérifié). Voir §7.

---

## 1. comutitres.fr — site vitrine corporate (`comutitres/`)

WordPress/Divi. **N'est PAS la plateforme de souscription** (renvoie vers IDFM). Capturé intégralement (14 pages).

| Fichier | Contenu |
|---|---|
| `comutitres/presentation.md` | Missions, réalisations, organisation, historique de Comutitres |
| `comutitres/relation-client.md` | Souscription/SAV/rechargement, renvoi vers IDFM, support tél., service sourds (Acceo) |
| `comutitres/actualites.md` | Actualités de l'entreprise |
| `comutitres/engagement-rh.md` · `rse.md` · `nos-metiers.md` · `5-raisons-nous-rejoindre.md` · `annonces.md` | Marque employeur, RSE, métiers, offres d'emploi |
| `comutitres/avis-de-marche.md` · `conditions-generales-achat.md` | Accès aux marchés + **CGA intégrales** (~90 Ko) |
| `comutitres/contact.md` | Coordonnées (21 bd Haussmann, 75009 Paris) |
| `comutitres/mentions-legales.md` · `politique-de-confidentialite.md` · `accessibilite.md` | Légal vitrine (accessibilité « partiellement conforme ») |

---

## 2. IDFM — Forfaits du périmètre (`idfm/forfaits/`)

| Fichier | Contenu | Réserve |
|---|---|---|
| `grille-tarifaire-2026.md` | **Grille tarifaire 2026 complète** (Navigo Annuel/Mois/Semaine/Jour, Senior 544,80 €, imagine R, Liberté+, Paris Visite, antipollution) | Fait foi pour les prix |
| `forfait-navigo-annuel.md` | Fiche produit Navigo Annuel | ⚠ affiche 976,80 € (tarif 2025) ≠ grille 2026 (998,80 €) |
| `forfait-imagine-r-etudiant.md` | imagine R Étudiant : conditions, justificatifs, SAV, perte/vol 15 € | Prix page = 392,30 € (2025-2026) |
| `liberte-plus.md` | Liberté+ : tarifs au trajet, périmètre, correspondances, SAV | |

> **Forfaits non capturés en fiche produit (rendu JS) :** Navigo Senior (fiche detail vide — voir `idfm/souscription/navigo-annuel-tarification-senior.md`), imagine R Scolaire/Junior (voir souscription), Améthyste (voir `amethyste/`), TST 75 %/Gratuité (voir `solidarite-transport/`).

---

## 3. IDFM — Parcours & souscription (`idfm/souscription/`)

| Fichier | Contenu |
|---|---|
| `aide-et-contacts-index.md` | **Index du portail d'aide IDFM** + URL des rubriques (utile comme sous-routeur) |
| `navigo-annuel-comment-souscrire.md` | Tunnel Navigo Annuel (étapes, pièces) |
| `navigo-annuel-tarification-senior.md` | Conditions Senior (62 ans+, activité < mi-temps, toutes zones, prélèvement) |
| `imagine-r-souscrire-renouveler-pieces-justificatives.md` | imagine R : souscription/renouvellement, **pièces justificatives**, **souscription pour tiers/mineur**, glossaire **titulaire/payeur** |
| `imagine-r-junior-souscrire.md` | imagine R Junior ⚠ contenu non actualisé (dates/prix 2024) |
| `liberte-plus-souscrire-sur-telephone.md` | Liberté+ dématérialisé sur smartphone |
| `comment-et-ou-acheter-mon-titre-de-transport.md` | Canaux d'achat |
| `recharger-passe-navigo-avec-telephone.md` · `quels-passes-navigo-recharges-avec-telephone.md` | Rechargement NFC, prérequis device |

---

## 4. IDFM — FAQ / Edge cases (`idfm/faq/`)

Les cas limites à ne pas oublier dans les parcours :

| Fichier | Edge case |
|---|---|
| `navigo-annuel-comment-resilier.md` · `navigo-annuel-comment-suspendre.md` · `navigo-annuel-difference-suspension-resiliation.md` | Résiliation vs suspension Navigo Annuel |
| `navigo-annuel-changer-les-zones.md` | Changement de zones + dézonage Senior |
| `imagine-r-comment-resilier.md` | Motifs résiliation imagine R (déménagement hors IDF, stage, décès…) |
| `imagine-r-puis-je-suspendre.md` | Suspension imagine R **impossible** |
| `imagine-r-boursier-tarif-reduit.md` | **Boursier** → réduction selon département (cf. `notions-metier.md` §3) |
| `liberte-plus-declarer-perte-vol-passe.md` | Perte/vol (15 € TTC) |
| `liberte-plus-dematerialiser-passe-sur-telephone.md` | Dématérialisation sur téléphone |
| `remboursement-faire-une-demande.md` | Demande de remboursement |
| `comment-choisir-la-zone-de-mon-titre-de-transport.md` | Choix des zones |

> **Edge cases identifiés mais NON capturés (slug/JS) :** régularisation d'impayé (Annuel & imagine R), attestation de forfait, changement d'établissement scolaire, création de compte IDFM Connect, Q&R Améthyste. → à récupérer via navigateur headless.

---

## 5. IDFM — Corpus légal / contractuel (`idfm/legal/`) — 50 fichiers

**CGU :** `cgu-compte.md`, `cgu-tst.md`, `cgu-achat-titre-android.md`, `cgu-jei.md`, `cgu-application-covoiturage-ile-de-france-mobilites.md`
**CGV :** `cgv-actes-de-service.md`
**Mentions / RGPD :** `mentions-legales.md`, `donnees-personnelles.md`, `politique-confidentialite-service-client-numero-unifie.md`, `politique-confidentialite-application-mobile-covoit-idfm.md`, `conditions-generales-application-vianavigo-regles-confidentialite.md`
**CGVU par produit (27) :** `cgvu.md` (index) + `cgvu-du-forfait-navigo-annuel.md`, `cgvu-forfaits-navigo-mois-navigo-semaine.md`, `cgvu-du-forfait-amethyste.md`, `cgvu-navigo-liberte.md`, `cgvu-navigo-liberte-telephone.md`, `cgvu-imagine-etudiant-2025-2026.md`, `cgvu-imagine-r-scolaire-junior.md` (+ millésimes 2023/2024), `cgvu-tarification-solidarite-transport-service-civique.md`, `cgvu-passe-navigo.md`, `cgvu-passe-navigo-easy.md`, `cgvu-passe-navigo-decouverte.md`, `cgvu-telephone-iphone.md`, `cgvu-tickets-*` (métro-train-rer, bus-tram, aéroport), `cgvu-paris-visite.md`, `cgvu-navigo-jour-sans-contact.md`, `cgvu-forfait-antipollution.md`, `cgvu-forfait-fete-de-la-musique.md`, `cgvu-orlybus-roissybus-sans-contact.md`, `cgvu-ticket-acces-a-bord.md`, `cgvu-du-ticket-dacces-a-bord-par-sms.md`, `cgvu-ticket-t-sans-contact.md`, `cgvu-lignes-covoiturage.md`
**Remboursement :** `conditions-generales-remboursement-imagine-2025-2026.md`, `conditions-generales-remboursement-ponctualite-2025.md`
**Accessibilité (déclarations RGAA, 8) :** `accessibilite-portail.md`, `accessibilite-android.md`, `accessibilite-ios.md`, `accessibilite-mon-espace.md`, `accessibilite-me-deplacer.md`, `accessibilite-du-reseau-de-transport.md`, `accessibilite-du-metro-historique.md`, `accessibilite-sur-le-reseau-ile-de-france-mobilites.md`

> **Anomalie :** `conditions-generales-de-vente-et-dutilisation-du-ticket-t-plus-magnetique.md` → la CGVU autonome n'existe plus (ticket carton supprimé le 01/11/2025), redirige vers une actualité. Noté dans le fichier.

---

## 6. TST, Améthyste, Points de vente

| Fichier | Contenu |
|---|---|
| `solidarite-transport/solidarite-transport.md` | **TST** : tableau d'éligibilité (8 situations → 3 niveaux : Réduction 50 % AME / Solidarité 75 % CSS-ASS / Gratuité RSA…), documents par profil, Agence Solidarité Transport |
| `idfm/legal/cgu-tst.md` · `cgvu-tarification-solidarite-transport-service-civique.md` | Conditions contractuelles TST |
| `amethyste/cgvu-forfait-amethyste.md` | **Améthyste** : CGVU intégrales (13 articles), circuit **départemental** |
| `points-de-vente/points-de-vente.md` | Canaux (agence / en ligne / correspondance) + **open data : 2 012 points (1 399 commerces de proximité + 613 guichets Navigo)** |

---

## 7. IA Act — état des lieux

**[Certain]** Aucune page de conformité « Règlement IA / IA Act » sur le site IDFM (sitemap + recherche). En revanche, IDFM **utilise** déjà l'IA :
- Agent IA grand public : `agent.ia.iledefrance-mobilites.fr`
- Tradivia (traduction d'info voyageur par IA), Hackathon 2024 « IA et mobilités »

→ Le cadrage IA Act du projet relève donc de **notre proposition** (cf. `../rapport-refonte-comutitres-idfm.md` §7.2 et `../parcours-pitch-imagineR-TST.md` §4 : « l'IA assiste, l'humain décide »), pas d'un existant IDFM.

---

## 8. Notions métier transverses → `notions-metier.md`

Porteur/payeur · validation asynchrone & incomplétude · bourse · renouvellement par produit · backoffice. **À lire pour modéliser le domaine.**

---

## 9. Inventaire & documents de synthèse

- `index-urls.md` — inventaire des 555 URL du sitemap IDFM par rubrique (actualités 386, légal/CGV/CGU/CGVU 38, titres-et-tarifs 22, accessibilité 8, autres 93). ⚠ sitemap tronqué.
- `../rapport-refonte-comutitres-idfm.md` — rapport de refonte (audit + archi + RGPD/IA Act).
- `../parcours-pitch-imagineR-TST.md` — script de pitch (parcours héros ImagineR + vitrine IA TST).

---

## 10. Pour compléter la capture (TODO si besoin de l'exhaustif)

1. **Navigateur headless** (rendu JS) pour : `je-gere-ma-carte`, fiches `titres-et-tarifs/detail/*` vides, carte `cartes/points-de-vente`, Q&R repliées en accordéon (impayés, attestation, IDFM Connect, Améthyste).
2. **Sitemap complet** : récupérer les sitemaps par langue non tronqués pour l'inventaire intégral des `/aide-et-contacts/*` profonds.
3. **Documents internes Comutitres** : volumétrie pic d'août, « TST — Septembre 2019 », durées de conservation RGPD réelles.
