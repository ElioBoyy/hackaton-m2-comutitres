# Notions métier — souscription Navigo (concepts transverses & edge cases)

> Ce fichier consolide les **notions métier structurantes** fournies par l'équipe projet (Comutitres) et les recoupe avec le contenu capturé dans cette arborescence. Ce sont les concepts à modéliser dans le domaine (backend Spring) et à respecter dans les parcours.
> Date : 15/06/2026. Tags : **[Métier — fourni par le commanditaire]**, **[Certain]** sourcé IDFM, **[À vérifier]**.

---

## 1. Porteur / Payeur (dissociation des rôles) — **[Métier]**

Deux rôles distincts, à ne jamais confondre dans le modèle de données :

- **Porteur** : la personne qui **utilise** le titre / le support sur le réseau. Peut être le payeur, ou non.
- **Payeur** : la personne qui **paie** lors de la souscription. Peut être le porteur, ou non.

**Cas d'usage de référence :**

| Situation | Payeur | Porteur |
|---|---|---|
| Parent souscrivant un imagine R pour son enfant mineur | Parent | Enfant (mineur) |
| Association payant l'abonnement TST d'un demandeur d'emploi | Association (personne morale) | Demandeur d'emploi |
| Salarié souscrivant un Navigo Annuel pour ses propres trajets | Salarié | Salarié (porteur-payeur) |

**Implications de conception :**
- Le payeur peut être une **personne morale** (association, employeur) → le modèle « payeur » n'est pas qu'une personne physique.
- La **signature du contrat et le mandat SEPA** relèvent du payeur ; les **justificatifs d'éligibilité** relèvent du porteur (ex. certificat de scolarité de l'enfant).
- Cas mineur : consentement/représentation légale du payeur.
- **[Certain]** Le glossaire titulaire/payeur et la souscription pour un tiers/mineur sont documentés côté IDFM (cf. `idfm/souscription/imagine-r-souscrire-renouveler-pieces-justificatives.md` et `idfm/souscription/navigo-annuel-comment-souscrire.md`).

---

## 2. Validation des justificatifs : **asynchrone** — **[Métier]**

- La **validation d'un justificatif n'est pas instantanée** : elle est **asynchrone** (traitement différé, intervention possible d'un agent).
- Conséquence parcours : l'usager reçoit un **accusé immédiat** (« dossier en cours de vérification »), le droit/passe n'est actif qu'**après validation** (cf. délais : Annuel ≤ 10 j ouvrés, TST 48 h après notification — `idfm/forfaits/` et `idfm/souscription/`).
- Conséquence archi : pattern **file d'événements + statut de dossier** (voir rapport de refonte, §6.4 — pic d'août). C'est ce découplage qui absorbe la charge.
- État « **incomplétude** » : un dossier peut être enregistré mais **incomplet** (justificatif manquant/illisible) → statut intermédiaire à gérer (relance, upload complémentaire), pas un rejet sec.

---

## 3. Bourse (boursiers) — **[Métier + Certain IDFM]**

- Certains élèves/étudiants sont **boursiers**. À ce titre, ils peuvent bénéficier d'une **réduction sur l'abonnement imagine R**, **selon le département**.
- Pour en bénéficier : fournir une **attestation d'attribution de bourse** lors de la souscription.
- **[Certain]** Source IDFM : « Je suis boursier, comment bénéficier d'un tarif réduit ? » — capturé dans `idfm/faq/imagine-r-boursier-tarif-reduit.md` (la subvention dépend du département).
- Implication : le **montant à payer dépend du département de résidence** → règle d'éligibilité paramétrable par département dans le module Éligibilité.

---

## 4. Renouvellement (logique annuelle, par produit) — **[Métier]**

Principe : chaque année, le client **renouvelle** son abonnement à la **date anniversaire** — **sauf le TST**, qui a ses propres périodes de renouvellement.

| Forfait | Logique de renouvellement |
|---|---|
| **Navigo Annuel / Navigo Senior** | **Renouvellement automatique** à date anniversaire — **SAUF paiement au comptant** : à renouveler par **paiement anticipé** de l'année à venir |
| **imagine R** | Renouvellement **annuel** (par campagne de rentrée) |
| **Améthyste** | **Selon le département** |
| **TST** | **Périodes propres** (réf. document « Tarification Solidarité Transport — Septembre 2019 » — **[À vérifier]** : document interne non capturé) |

**Implications de conception :**
- Distinguer **renouvellement automatique** (Annuel/Senior au prélèvement) du **renouvellement actif** (comptant, imagine R).
- Le **pic d'août** est précisément le **renouvellement de masse imagine R + nouvelles souscriptions de rentrée** (cf. parcours héros).
- TST = cycle dérogatoire → ne pas appliquer la règle « date anniversaire » au TST.

---

## 5. BackOffice — **[Métier]**

- Besoin explicite d'**outils en backoffice** pour **suivre et débloquer les clients** : suivi des dossiers, levée des incomplétudes, validation manuelle des justificatifs (corollaire de la validation asynchrone §2), gestion des litiges/SAV.
- À modéliser comme un **module d'administration** distinct des parcours clients, branché sur les mêmes cas d'usage (CQRS : les agents agissent via Commands, consultent via Queries).
- Fonctions pressenties : file de dossiers à valider, recherche client, déblocage, régularisation d'impayés, opposition/passe, traçabilité (audit RGPD / AI Act — « l'humain décide »).

---

## 6. Renvois utiles dans l'arborescence

- Édge cases souscription/SAV : `idfm/faq/` (résiliation, suspension, zones, perte/vol, remboursement) et `idfm/souscription/`.
- Conditions contractuelles par produit : `idfm/legal/cgvu-*.md`.
- TST (3 niveaux, éligibilité, documents) : `solidarite-transport/solidarite-transport.md` + `idfm/legal/cgu-tst.md`.
- Améthyste (circuit départemental) : `amethyste/cgvu-forfait-amethyste.md`.

> **[À vérifier]** Le document « Tarification Solidarité Transport — Septembre 2019 » cité pour les périodes de renouvellement TST n'a pas été retrouvé en ligne. À récupérer en interne pour préciser les cycles TST.
