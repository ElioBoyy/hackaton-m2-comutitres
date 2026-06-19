// Residence : lieu de résidence collecté à l'étape résidence du wizard.
// `resideEnIledeFrance` pilote le parcours de recommandation.
// `departement` remplace `region` — plus précis et permet d'afficher les aides locales.

export interface Departement {
  code: string
  nom: string
  resideEnIledeFrance: boolean
  aides?: { titre: string; detail: string }[]
}

const AIDES_IDF_COMMUNES = [
  {
    titre: 'Tarification Solidarité Transport (TST)',
    detail: 'Réduction importante sur l\'abonnement Navigo pour les ménages modestes (bénéficiaires RSA, CSS, AME, certaines cartes d\'invalidité).',
  },
  {
    titre: 'Forfait Améthyste',
    detail: 'Pour les personnes âgées ou en situation de handicap, attribué par le Conseil départemental. Géré par Comutitres.',
  },
]

export const DEPARTEMENTS: Departement[] = [
  // ── Île-de-France ──────────────────────────────────────────────────────────
  {
    code: '75',
    nom: 'Paris (75)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Carte Imagine R lycéen·ne', detail: 'Abonnement annuel toutes zones à tarif préférentiel pour les lycéens parisiens (sous conditions de ressources).' },
    ],
  },
  {
    code: '77',
    nom: 'Seine-et-Marne (77)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Chèque Transport mobilité CG77', detail: 'Aide financière jusqu\'à 75 €/an pour les personnes en recherche d\'emploi ou en insertion professionnelle.' },
    ],
  },
  {
    code: '78',
    nom: 'Yvelines (78)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Chèque Transport Yvelines', detail: 'Aide aux demandeurs d\'emploi et bénéficiaires du RSA pour financer un abonnement de transport.' },
    ],
  },
  {
    code: '91',
    nom: 'Essonne (91)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Aide à la mobilité solidaire CG91', detail: 'Prise en charge partielle (jusqu\'à 50 %) de l\'abonnement pour les bénéficiaires du RSA et de l\'ASS.' },
    ],
  },
  {
    code: '92',
    nom: 'Hauts-de-Seine (92)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Chèque-Mobilité 92', detail: 'Remboursement partiel de l\'abonnement Navigo pour les bénéficiaires du RSA et de minima sociaux résidant dans les Hauts-de-Seine.' },
    ],
  },
  {
    code: '93',
    nom: 'Seine-Saint-Denis (93)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Aide au transport CG93', detail: 'Prise en charge des frais de transport pour les bénéficiaires du RSA en parcours d\'insertion professionnelle.' },
    ],
  },
  {
    code: '94',
    nom: 'Val-de-Marne (94)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Aide mobilité Val-de-Marne', detail: 'Aide financière pour les bénéficiaires de minima sociaux et les jeunes de 16 à 25 ans en insertion.' },
    ],
  },
  {
    code: '95',
    nom: 'Val-d\'Oise (95)',
    resideEnIledeFrance: true,
    aides: [
      ...AIDES_IDF_COMMUNES,
      { titre: 'Aide mobilité durable CG95', detail: 'Subvention pour l\'abonnement Navigo destinée aux demandeurs d\'emploi et aux bénéficiaires de l\'ASS ou du RSA.' },
    ],
  },

  // ── Hors Île-de-France ─────────────────────────────────────────────────────
  { code: '01', nom: 'Ain (01)', resideEnIledeFrance: false },
  { code: '02', nom: 'Aisne (02)', resideEnIledeFrance: false },
  { code: '03', nom: 'Allier (03)', resideEnIledeFrance: false },
  { code: '04', nom: 'Alpes-de-Haute-Provence (04)', resideEnIledeFrance: false },
  { code: '05', nom: 'Hautes-Alpes (05)', resideEnIledeFrance: false },
  { code: '06', nom: 'Alpes-Maritimes (06)', resideEnIledeFrance: false },
  { code: '07', nom: 'Ardèche (07)', resideEnIledeFrance: false },
  { code: '08', nom: 'Ardennes (08)', resideEnIledeFrance: false },
  { code: '09', nom: 'Ariège (09)', resideEnIledeFrance: false },
  { code: '10', nom: 'Aube (10)', resideEnIledeFrance: false },
  { code: '11', nom: 'Aude (11)', resideEnIledeFrance: false },
  { code: '12', nom: 'Aveyron (12)', resideEnIledeFrance: false },
  { code: '13', nom: 'Bouches-du-Rhône (13)', resideEnIledeFrance: false },
  { code: '14', nom: 'Calvados (14)', resideEnIledeFrance: false },
  { code: '15', nom: 'Cantal (15)', resideEnIledeFrance: false },
  { code: '16', nom: 'Charente (16)', resideEnIledeFrance: false },
  { code: '17', nom: 'Charente-Maritime (17)', resideEnIledeFrance: false },
  { code: '18', nom: 'Cher (18)', resideEnIledeFrance: false },
  { code: '19', nom: 'Corrèze (19)', resideEnIledeFrance: false },
  { code: '2A', nom: 'Corse-du-Sud (2A)', resideEnIledeFrance: false },
  { code: '2B', nom: 'Haute-Corse (2B)', resideEnIledeFrance: false },
  { code: '21', nom: 'Côte-d\'Or (21)', resideEnIledeFrance: false },
  { code: '22', nom: 'Côtes-d\'Armor (22)', resideEnIledeFrance: false },
  { code: '23', nom: 'Creuse (23)', resideEnIledeFrance: false },
  { code: '24', nom: 'Dordogne (24)', resideEnIledeFrance: false },
  { code: '25', nom: 'Doubs (25)', resideEnIledeFrance: false },
  { code: '26', nom: 'Drôme (26)', resideEnIledeFrance: false },
  { code: '27', nom: 'Eure (27)', resideEnIledeFrance: false },
  { code: '28', nom: 'Eure-et-Loir (28)', resideEnIledeFrance: false },
  { code: '29', nom: 'Finistère (29)', resideEnIledeFrance: false },
  { code: '30', nom: 'Gard (30)', resideEnIledeFrance: false },
  { code: '31', nom: 'Haute-Garonne (31)', resideEnIledeFrance: false },
  { code: '32', nom: 'Gers (32)', resideEnIledeFrance: false },
  { code: '33', nom: 'Gironde (33)', resideEnIledeFrance: false },
  { code: '34', nom: 'Hérault (34)', resideEnIledeFrance: false },
  { code: '35', nom: 'Ille-et-Vilaine (35)', resideEnIledeFrance: false },
  { code: '36', nom: 'Indre (36)', resideEnIledeFrance: false },
  { code: '37', nom: 'Indre-et-Loire (37)', resideEnIledeFrance: false },
  { code: '38', nom: 'Isère (38)', resideEnIledeFrance: false },
  { code: '39', nom: 'Jura (39)', resideEnIledeFrance: false },
  { code: '40', nom: 'Landes (40)', resideEnIledeFrance: false },
  { code: '41', nom: 'Loir-et-Cher (41)', resideEnIledeFrance: false },
  { code: '42', nom: 'Loire (42)', resideEnIledeFrance: false },
  { code: '43', nom: 'Haute-Loire (43)', resideEnIledeFrance: false },
  { code: '44', nom: 'Loire-Atlantique (44)', resideEnIledeFrance: false },
  { code: '45', nom: 'Loiret (45)', resideEnIledeFrance: false },
  { code: '46', nom: 'Lot (46)', resideEnIledeFrance: false },
  { code: '47', nom: 'Lot-et-Garonne (47)', resideEnIledeFrance: false },
  { code: '48', nom: 'Lozère (48)', resideEnIledeFrance: false },
  { code: '49', nom: 'Maine-et-Loire (49)', resideEnIledeFrance: false },
  { code: '50', nom: 'Manche (50)', resideEnIledeFrance: false },
  { code: '51', nom: 'Marne (51)', resideEnIledeFrance: false },
  { code: '52', nom: 'Haute-Marne (52)', resideEnIledeFrance: false },
  { code: '53', nom: 'Mayenne (53)', resideEnIledeFrance: false },
  { code: '54', nom: 'Meurthe-et-Moselle (54)', resideEnIledeFrance: false },
  { code: '55', nom: 'Meuse (55)', resideEnIledeFrance: false },
  { code: '56', nom: 'Morbihan (56)', resideEnIledeFrance: false },
  { code: '57', nom: 'Moselle (57)', resideEnIledeFrance: false },
  { code: '58', nom: 'Nièvre (58)', resideEnIledeFrance: false },
  { code: '59', nom: 'Nord (59)', resideEnIledeFrance: false },
  { code: '60', nom: 'Oise (60)', resideEnIledeFrance: false },
  { code: '61', nom: 'Orne (61)', resideEnIledeFrance: false },
  { code: '62', nom: 'Pas-de-Calais (62)', resideEnIledeFrance: false },
  { code: '63', nom: 'Puy-de-Dôme (63)', resideEnIledeFrance: false },
  { code: '64', nom: 'Pyrénées-Atlantiques (64)', resideEnIledeFrance: false },
  { code: '65', nom: 'Hautes-Pyrénées (65)', resideEnIledeFrance: false },
  { code: '66', nom: 'Pyrénées-Orientales (66)', resideEnIledeFrance: false },
  { code: '67', nom: 'Bas-Rhin (67)', resideEnIledeFrance: false },
  { code: '68', nom: 'Haut-Rhin (68)', resideEnIledeFrance: false },
  { code: '69', nom: 'Rhône (69)', resideEnIledeFrance: false },
  { code: '70', nom: 'Haute-Saône (70)', resideEnIledeFrance: false },
  { code: '71', nom: 'Saône-et-Loire (71)', resideEnIledeFrance: false },
  { code: '72', nom: 'Sarthe (72)', resideEnIledeFrance: false },
  { code: '73', nom: 'Savoie (73)', resideEnIledeFrance: false },
  { code: '74', nom: 'Haute-Savoie (74)', resideEnIledeFrance: false },
  { code: '76', nom: 'Seine-Maritime (76)', resideEnIledeFrance: false },
  { code: '79', nom: 'Deux-Sèvres (79)', resideEnIledeFrance: false },
  { code: '80', nom: 'Somme (80)', resideEnIledeFrance: false },
  { code: '81', nom: 'Tarn (81)', resideEnIledeFrance: false },
  { code: '82', nom: 'Tarn-et-Garonne (82)', resideEnIledeFrance: false },
  { code: '83', nom: 'Var (83)', resideEnIledeFrance: false },
  { code: '84', nom: 'Vaucluse (84)', resideEnIledeFrance: false },
  { code: '85', nom: 'Vendée (85)', resideEnIledeFrance: false },
  { code: '86', nom: 'Vienne (86)', resideEnIledeFrance: false },
  { code: '87', nom: 'Haute-Vienne (87)', resideEnIledeFrance: false },
  { code: '88', nom: 'Vosges (88)', resideEnIledeFrance: false },
  { code: '89', nom: 'Yonne (89)', resideEnIledeFrance: false },
  { code: '90', nom: 'Territoire de Belfort (90)', resideEnIledeFrance: false },
  { code: '971', nom: 'Guadeloupe (971)', resideEnIledeFrance: false },
  { code: '972', nom: 'Martinique (972)', resideEnIledeFrance: false },
  { code: '973', nom: 'Guyane (973)', resideEnIledeFrance: false },
  { code: '974', nom: 'La Réunion (974)', resideEnIledeFrance: false },
  { code: '976', nom: 'Mayotte (976)', resideEnIledeFrance: false },
]

export const DEPARTEMENTS_IDF = DEPARTEMENTS.filter((d) => d.resideEnIledeFrance)
export const DEPARTEMENTS_HORS_IDF = DEPARTEMENTS.filter((d) => !d.resideEnIledeFrance)

export function getDepartement(code: string): Departement | undefined {
  return DEPARTEMENTS.find((d) => d.code === code)
}

export interface Residence {
  departement: string
  resideEnIledeFrance: boolean
}

export const RESIDENCE_DEFAULT: Residence = {
  departement: '75',
  resideEnIledeFrance: true,
}
