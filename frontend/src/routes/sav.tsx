import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Baby,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Globe,
  Heart,
  HelpCircle,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Ticket,
  Train,
  Users,
  Wallet,
} from 'lucide-react'
import { isAuthenticated, me } from '~/lib/auth'
import { DashboardLayout } from '~/components/DashboardLayout'
import { ContactBanner } from '~/components/ContactBanner'
import { Button } from '~/components/Button'
import { Field } from '~/components/Field'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { m } from '~/paraglide/messages'
import {
  CATEGORIES_SAV,
  MOCK_RECLAMATIONS,
  categoriePourStatut,
  libelleCategorie,
  libelleStatut,
  type CategorieReclamation,
  type Reclamation,
} from '~/lib/sav'

export const Route = createFileRoute('/sav')({
  component: SavPage,
})

// ─── Types FAQ ────────────────────────────────────────────────────────────────

interface SousQuestion {
  question: string
  reponse: ReactNode
}

interface SectionFaq {
  id: string
  titre: string
  icon: typeof Train
  couleurBg: string
  couleurIcone: string
  couleurCercleHex?: string
  imageUrl?: string
  questions: SousQuestion[]
}

// ─── Données FAQ ──────────────────────────────────────────────────────────────

function buildFaqSections(): SectionFaq[] { return [
  {
    id: 'trouver',
    titre: m.sav_faq_section_trouver(),
    icon: Train,
    couleurBg: 'bg-faq-trouver',
    couleurIcone: 'text-primary',
    imageUrl: '/train-banner.png',
    questions: [
      {
        question: 'Je ne sais pas quel abonnement choisir',
        reponse: (
          <p>
            Tout dépend de votre fréquence et de votre situation. Vous déplacez-vous tous les
            jours ? Le <strong>Navigo Annuel</strong> est le plus économique. Vous êtes
            étudiant ? L'<strong>Imagine R Étudiant</strong> vous donne accès à un tarif
            préférentiel. Vous voyagez de façon irrégulière ? Le{' '}
            <strong>Navigo Liberté+</strong> (pay-as-you-go, dès 1,64 €/trajet) est idéal —
            vous ne payez que les trajets effectués, sans engagement. Notre outil de{' '}
            <Link to="/recommandation" className="text-primary underline">diagnostic mobilité</Link>{' '}
            vous guide en quelques questions.
          </p>
        ),
      },
      {
        question: 'Pourquoi plusieurs abonnements me sont-ils proposés ?',
        reponse: (
          <p>
            L'algorithme de recommandation calcule un <strong>score d'adaptation</strong> pour
            chaque abonnement selon votre situation (statut, fréquence, résidence). Plusieurs
            options peuvent convenir, ordonnées du plus adapté au moins adapté. Vous pouvez
            choisir librement parmi celles-ci.
          </p>
        ),
      },
      {
        question: 'Comment choisir la bonne zone de transport ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Le réseau est divisé en <strong>5 zones concentriques</strong> :</p>
            <ul className="list-disc pl-5 text-sm">
              <li><strong>Zone 1</strong> : Paris intramuros (tous arrondissements)</li>
              <li><strong>Zone 2</strong> : Petite couronne (92, 93, 94)</li>
              <li><strong>Zone 3</strong> : Saint-Denis, Courbevoie, Meudon…</li>
              <li><strong>Zone 4</strong> : Versailles, Orly, Essonne, Val-d'Oise…</li>
              <li><strong>Zone 5</strong> : Disneyland, Roissy CDG, Fontainebleau…</li>
            </ul>
            <p className="text-sm">Depuis 2024, le tarif est <strong>unique</strong> quelle que soit la combinaison de zones choisie (environ 86,40 €/mois toutes zones).</p>
          </div>
        ),
      },
      {
        question: 'Quelle est la différence entre Navigo Annuel et Liberté+ ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p><strong>Navigo Annuel</strong> : abonnement mensuel ou annuel à tarif fixe, valable sur toutes les lignes de la zone choisie. Idéal si vous prenez les transports tous les jours.</p>
            <p><strong>Navigo Liberté+</strong> : vous payez à l'unité (dès 1,64 €/trajet bus-tram, 2,04 €/trajet métro-RER-train). Pas d'engagement. Une fois le prix d'un Navigo Jour atteint dans la journée, le reste des trajets est offert. Idéal si vous vous déplacez 2 à 3 jours par semaine.</p>
          </div>
        ),
      },
      {
        question: 'Comment savoir si je fais des économies ?',
        reponse: (
          <p>
            Notre outil de recommandation calcule et affiche les économies annuelles estimées
            par rapport aux autres options. En général, le Navigo Annuel devient rentable à
            partir de <strong>3 à 4 jours de déplacement par semaine</strong>. En dessous,
            Navigo Liberté+ est souvent moins cher.
          </p>
        ),
      },
      {
        question: "Puis-je changer d'abonnement en cours d'année ?",
        reponse: (
          <p>
            Oui, sous conditions. Pour le Navigo Annuel, vous pouvez suspendre ou résilier
            (avec remboursement au prorata). Pour l'Imagine R, la résiliation en cours d'année
            n'est possible que sur justificatif (déménagement hors IDF, arrêt de scolarité…).
            Le Liberté+ n'a pas d'engagement, vous pouvez arrêter à tout moment.
          </p>
        ),
      },
    ],
  },
  {
    id: 'justificatifs',
    titre: m.sav_faq_section_justificatifs(),
    icon: FileCheck,
    couleurBg: 'bg-faq-justificatif',
    couleurIcone: 'text-success',
    imageUrl: '/justificatif-banner.png',
    questions: [
      {
        question: 'Pourquoi dois-je fournir un justificatif ?',
        reponse: (
          <p>
            Certains abonnements à tarif préférentiel (Imagine R Étudiant, tarif boursier,
            Améthyste, Solidarité Transport) sont réservés à des publics spécifiques. Les
            justificatifs permettent de vérifier votre éligibilité avant validation du dossier.
          </p>
        ),
      },
      {
        question: "Je suis boursier, comment bénéficier d'un tarif réduit (Imagine R) ?",
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Vous avez jusqu'au <strong>15 décembre</strong> pour transmettre votre notification d'attribution de bourse :</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Téléchargement depuis votre espace personnel en ligne</li>
              <li>OU envoi postal à l'Agence Imagine R (TSA 94444, 77213 Avon Cedex) avec le formulaire tamponné par votre établissement</li>
            </ul>
            <p className="text-sm text-gray-700">Le trop-perçu est remboursé par chèque ou vos prélèvements sont ajustés. Non applicable à l'Imagine R Junior.</p>
          </div>
        ),
      },
      {
        question: 'Quels formats de documents sont acceptés ?',
        reponse: (
          <p>
            Les justificatifs doivent être rédigés en <strong>langue française</strong>. Les
            documents scannés ou photographiés en bonne qualité sont généralement acceptés.
            Pour les justificatifs envoyés par courrier, des originaux ou copies certifiées
            conformes peuvent être demandés selon les cas.
          </p>
        ),
      },
      {
        question: 'Comment résilier mon forfait Imagine R ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Résiliation possible <strong>sans motif</strong> avant le début de validité ou pendant le 1er mois. Au-delà, sur justificatif uniquement :</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Interruption de scolarité (maladie, accident)</li>
              <li>Stage hors Île-de-France {'>'} 2 mois</li>
              <li>Déménagement hors Île-de-France</li>
              <li>Décès du porteur</li>
              <li>Bénéficiaire de la Tarification Solidarité Transport</li>
            </ul>
            <p className="text-sm">Par e-mail ou LRAR à : Agence Imagine R, TSA 94444, 77213 Avon Cedex.</p>
          </div>
        ),
      },
      {
        question: 'Mon document a été refusé, que faire ?',
        reponse: (
          <p>
            Vérifiez que le document est bien lisible, en français, et correspond au type
            demandé. En cas de refus injustifié, contactez l'agence concernée (Navigo Annuel,
            Imagine R) par téléphone ou courrier recommandé pour contester la décision.
          </p>
        ),
      },
    ],
  },
  {
    id: 'paiement',
    titre: m.sav_faq_section_paiement(),
    icon: Wallet,
    couleurBg: 'bg-faq-paiement',
    couleurIcone: 'text-purple-600',
    imageUrl: '/paiement-banner.png',
    questions: [
      {
        question: 'Quand mon abonnement arrive-t-il à échéance ?',
        reponse: (
          <p>
            La date de fin de droits est visible dans votre espace personnel. Pour le Navigo
            Annuel, le contrat dure 12 mois. Vous serez notifié avant l'échéance pour
            renouveler. Pour l'Imagine R, la validité correspond à l'année scolaire.
          </p>
        ),
      },
      {
        question: 'Comment faire une demande de remboursement ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Pour les campagnes de dédommagement (RER B, C, T12) :</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Accédez à l'espace dédommagement Île-de-France Mobilités</li>
              <li>Sélectionnez l'axe concerné et vérifiez votre éligibilité</li>
              <li>Connectez-vous avec votre compte IDF Mobilités Connect</li>
              <li>Cliquez sur "Faire une demande"</li>
            </ol>
            <p className="text-sm text-gray-700">Seuls les majeurs (ou mineurs émancipés) peuvent faire la demande. Les demandes en guichet RATP/SNCF ne sont pas traitées dans ce cadre.</p>
          </div>
        ),
      },
      {
        question: 'Quelle est la différence entre suspension et résiliation ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p><strong>Suspension</strong> : arrêt temporaire. Vous pourrez reprendre le forfait ultérieurement sans nouveaux frais de dossier. Finalisez-la en point de vente ou automate sous 48h.</p>
            <p><strong>Résiliation</strong> : arrêt définitif. Pour re-souscrire, de nouveaux frais de dossier s'appliquent. Le mois en cours de résiliation est dû en intégralité.</p>
          </div>
        ),
      },
      {
        question: 'Comment résilier mon Navigo Annuel ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Trois canaux possibles :</p>
            <ul className="list-disc pl-5 text-sm">
              <li>En ligne : Mon Navigo → Navigo Annuel → Suspendre ou résilier</li>
              <li>En agence RATP ou Guichet Services Navigo SNCF</li>
              <li>Par LRAR : Agence Navigo Annuel, TSA 74451, 77213 Avon Cedex</li>
            </ul>
            <p className="text-sm">Conservez votre passe Navigo : il reste utilisable pour des forfaits Jour, Semaine ou Mois.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'arrivant',
    titre: m.sav_faq_section_arrivant(),
    icon: Globe,
    couleurBg: 'bg-faq-arrivant',
    couleurIcone: 'text-amber-600',
    imageUrl: '/arrivant-banner.png',
    questions: [
      {
        question: "Je viens d'arriver en Île-de-France, par où commencer ?",
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Bienvenue ! Voici les premières étapes :</p>
            <ol className="list-decimal pl-5 text-sm">
              <li>Créez un compte sur ce service (inscription gratuite)</li>
              <li>Lancez le <strong>diagnostic mobilité</strong> pour trouver l'abonnement adapté à votre situation</li>
              <li>Obtenez un passe Navigo (en agence ou commande en ligne)</li>
              <li>Chargez votre abonnement sur le passe</li>
            </ol>
            <p className="text-sm text-gray-700">Le réseau IDF couvre métro, RER, bus, tramway et trains de banlieue avec un seul passe.</p>
          </div>
        ),
      },
      {
        question: 'Comment choisir ma zone de transport ?',
        reponse: (
          <p>
            Identifiez votre domicile et votre lieu de travail/études sur la carte des zones
            (1 = Paris, 5 = Grande couronne). Votre abonnement doit couvrir toutes les zones
            de votre trajet habituel. Depuis 2024, le prix est le même quelle que soit la
            combinaison de zones. Utilisez le calculateur d'itinéraires sur le site
            Île-de-France Mobilités pour connaître la zone exacte de vos stations.
          </p>
        ),
      },
      {
        question: 'Je ne connais pas le fonctionnement du métro et du RER',
        reponse: (
          <p>
            L'application <strong>Île-de-France Mobilités</strong> (iOS et Android) vous
            permet de calculer n'importe quel itinéraire en transports en commun, avec les
            horaires en temps réel. Le site me-deplacer.iledefrance-mobilites.fr propose le
            même service. Le réseau comprend 16 lignes de métro, 5 RER, de nombreuses lignes
            de bus et tramway.
          </p>
        ),
      },
      {
        question: 'Le service est-il disponible en plusieurs langues ?',
        reponse: (
          <p>
            Oui, ce service est disponible en <strong>français, anglais, espagnol et
            portugais</strong> — sélectionnez votre langue via le bouton en bas du menu
            de navigation. L'application Île-de-France Mobilités est également disponible
            en anglais.
          </p>
        ),
      },
    ],
  },
  {
    id: 'accessibilite',
    titre: m.sav_faq_section_accessibilite(),
    icon: Heart,
    couleurBg: 'bg-faq-accessibilite',
    couleurIcone: 'text-orange-600',
    imageUrl: '/accessibilite-banner.png',
    questions: [
      {
        question: 'Existe-t-il des aides pour les personnes en situation de handicap ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Oui, plusieurs dispositifs existent :</p>
            <ul className="list-disc pl-5 text-sm">
              <li><strong>Forfait Améthyste</strong> : pour les personnes âgées ou handicapées, attribué par les Conseils départementaux d'IDF. Géré par Comutitres.</li>
              <li><strong>Tarification Solidarité Transport</strong> : réductions importantes pour les ménages modestes (RSA, CSS sans participation, AME, certaines cartes d'invalidité).</li>
              <li><strong>Tarif réduit Liberté+</strong> : -50% sur présentation d'une carte de réduction.</li>
            </ul>
          </div>
        ),
      },
      {
        question: "Qu'est-ce que la Tarification Solidarité Transport ?",
        reponse: (
          <div className="flex flex-col gap-2">
            <p>
              Initiative de la Région Île-de-France lancée en 2004, elle offre des réductions
              importantes aux ménages modestes. Bénéficiaires éligibles :
            </p>
            <ul className="list-disc pl-5 text-sm">
              <li>CSS sans participation financière (ex-CMU-C)</li>
              <li>Bénéficiaires du RSA</li>
              <li>Bénéficiaires de l'AME</li>
              <li>Porteurs de certaines cartes d'invalidité (ONAC, CMI)</li>
            </ul>
            <p className="text-sm text-gray-700">Un passe Navigo est indispensable. Testez votre éligibilité sur solidarite-transport.iledefrance-mobilites.fr</p>
          </div>
        ),
      },
      {
        question: "Qu'est-ce que le forfait Améthyste ?",
        reponse: (
          <p>
            Le forfait Améthyste est créé par Île-de-France Mobilités et attribué par les
            Conseils départementaux d'Île-de-France pour les personnes âgées et les personnes
            en situation de handicap. Il est géré par Comutitres. Il se charge sur un passe
            Navigo nominatif et est valable sur toutes les lignes régulières de transport en
            commun d'Île-de-France.
          </p>
        ),
      },
      {
        question: 'Puis-je être accompagné dans mes démarches ?',
        reponse: (
          <p>
            Oui. Vous pouvez vous rendre dans une agence commerciale RATP, un Guichet Services
            Navigo SNCF, ou contacter l'Agence Navigo par téléphone au{' '}
            <strong>09 69 39 22 22</strong> (non surtaxé, lun–ven 7h–20h, sam 9h–17h).
          </p>
        ),
      },
    ],
  },
  {
    id: 'proche',
    titre: m.sav_faq_section_proche(),
    icon: Users,
    couleurBg: 'bg-faq-trouver',
    couleurIcone: 'text-primary',
    imageUrl: '/proche-banner.png',
    questions: [
      {
        question: 'Puis-je souscrire un abonnement pour mon enfant ?',
        reponse: (
          <p>
            Oui. Notre outil de diagnostic vous permet de faire une demande pour un tiers
            (enfant, proche). Sélectionnez "Pour un proche" à la première étape du wizard.
            Le payeur doit être majeur et capable. Pour les mineurs, le responsable légal
            effectue les démarches et signe les contrats.
          </p>
        ),
      },
      {
        question: 'Puis-je gérer plusieurs abonnements depuis un même compte ?',
        reponse: (
          <p>
            Votre espace personnel vous permet de suivre les dossiers que vous avez initiés.
            Chaque bénéficiaire dispose de son propre passe Navigo nominatif. Vous pouvez
            démarrer autant de demandes que nécessaire depuis votre compte.
          </p>
        ),
      },
      {
        question: 'Quels documents sont nécessaires pour un enfant mineur ?',
        reponse: (
          <div className="flex flex-col gap-2">
            <p>Pour un enfant mineur souscrivant à un forfait Imagine R :</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Pièce d'identité de l'enfant</li>
              <li>Certificat de scolarité de l'année en cours</li>
              <li>Notification de bourse si éligible (avant le 15 décembre)</li>
            </ul>
            <p className="text-sm text-gray-700">La demande de remboursement pour un mineur doit être effectuée par le responsable légal.</p>
          </div>
        ),
      },
      {
        question: 'Comment utiliser le diagnostic mobilité pour un proche ?',
        reponse: (
          <p>
            Au lancement du diagnostic, choisissez "Pour un proche" à la première étape.
            Répondez ensuite aux questions en décrivant la situation du bénéficiaire
            (statut, fréquence de déplacement, lieu de résidence). La recommandation sera
            adaptée à son profil, pas au vôtre.
          </p>
        ),
      },
    ],
  },
]}

function buildQuickHelp() {
  return [
    { label: m.sav_qh_find(), icon: Search },
    { label: m.sav_qh_newcomer(), icon: Globe },
    { label: m.sav_qh_docs(), icon: FileCheck },
    { label: m.sav_qh_relative(), icon: Baby },
    { label: m.sav_qh_help(), icon: HelpCircle },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Composants FAQ ───────────────────────────────────────────────────────────

function AccordionQuestion({ question, reponse }: SousQuestion) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-dark transition-colors hover:text-primary"
        aria-expanded={ouvert}
      >
        <span>{question}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {ouvert && (
        <div className="pb-4 text-sm leading-relaxed text-gray-700">{reponse}</div>
      )}
    </div>
  )
}

function SectionFaqCard({ section }: { section: SectionFaq }) {
  const [ouvert, setOuvert] = useState(false)
  const [toutesVues, setToutesVues] = useState(false)
  const Icon = section.icon
  const questionsAffichees = toutesVues ? section.questions : section.questions.slice(0, 3)
  const resteCount = section.questions.length - 3

  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 ${section.couleurBg}`}>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="relative flex w-full items-center justify-between gap-4 overflow-hidden p-5 text-left"
        aria-expanded={ouvert}
      >
        {section.imageUrl && (
          <img
            src={section.imageUrl}
            alt=""
            className="pointer-events-none absolute right-14 top-0 hidden h-full w-56 object-cover object-center sm:block"
          />
        )}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon size={20} className={section.couleurIcone} aria-hidden="true" />
          </div>
          <span className="font-heading text-base font-semibold text-dark">{section.titre}</span>
        </div>
        <ChevronDown
          size={18}
          className={`relative shrink-0 text-gray-400 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {ouvert && (
        <div className="border-t border-gray-200 bg-white px-5">
          {questionsAffichees.map((q) => (
            <AccordionQuestion key={q.question} {...q} />
          ))}
          {resteCount > 0 && (
            <button
              type="button"
              onClick={() => setToutesVues((v) => !v)}
              className="flex items-center gap-1.5 py-3 text-sm font-medium text-primary hover:underline"
            >
              {toutesVues
                ? m.sav_faq_show_less()
                : m.sav_faq_show_all({ count: String(section.questions.length) })}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${toutesVues ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SavPage() {
  const [authentifie, setAuthentifie] = useState(false)
  const [userName, setUserName] = useState('')
  const [activeTab, setActiveTab] = useState<'faq' | 'demandes'>('faq')

  // état tickets
  const [reclamations, setReclamations] = useState<Reclamation[]>(MOCK_RECLAMATIONS)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [categorie, setCategorie] = useState<CategorieReclamation>('PAIEMENT')
  const [objet, setObjet] = useState('')
  const [description, setDescription] = useState('')
  const [objetError, setObjetError] = useState<string | undefined>()
  const [descError, setDescError] = useState<string | undefined>()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthentifie(true)
      me()
        .then((u) => setUserName(`${u.prenom} ${u.nom}`))
        .catch(() => {})
    }
  }, [])

  function handleToggleForm() {
    if (showForm) {
      setObjet('')
      setDescription('')
      setCategorie('PAIEMENT')
      setObjetError(undefined)
      setDescError(undefined)
    }
    setShowForm((v) => !v)
  }

  function handleSubmitForm(e: FormEvent) {
    e.preventDefault()
    let valid = true
    if (!objet.trim()) {
      setObjetError(m.sav_form_subject_required())
      valid = false
    } else {
      setObjetError(undefined)
    }
    if (!description.trim()) {
      setDescError(m.sav_form_desc_required())
      valid = false
    } else {
      setDescError(undefined)
    }
    if (!valid) return

    const newRec: Reclamation = {
      id: `r${reclamations.length + 1}`,
      reference: `REC-2026-00${reclamations.length + 1}`,
      categorie,
      objet: objet.trim(),
      dateCreation: new Date().toISOString(),
      dateMiseAJour: new Date().toISOString(),
      statut: 'OUVERT',
      messages: [
        {
          id: `m${Date.now()}`,
          auteur: 'CLIENT',
          contenu: description.trim(),
          date: new Date().toISOString(),
        },
      ],
    }

    setReclamations((prev) => [newRec, ...prev])
    setExpandedId(newRec.id)
    setObjet('')
    setDescription('')
    setCategorie('PAIEMENT')
    setShowForm(false)
    setSuccessMsg(m.sav_form_success())
    setTimeout(() => setSuccessMsg(null), 6000)
  }

  function handleSendReply(recId: string) {
    const text = replyTexts[recId]?.trim()
    if (!text) return
    setReclamations((prev) =>
      prev.map((r) =>
        r.id !== recId
          ? r
          : {
              ...r,
              dateMiseAJour: new Date().toISOString(),
              messages: [
                ...r.messages,
                {
                  id: `m${Date.now()}`,
                  auteur: 'CLIENT',
                  contenu: text,
                  date: new Date().toISOString(),
                },
              ],
            },
      ),
    )
    setReplyTexts((prev) => ({ ...prev, [recId]: '' }))
  }

  const openTickets = reclamations.filter(
    (r) => r.statut === 'OUVERT' || r.statut === 'EN_COURS',
  ).length

  return (
    <DashboardLayout title={m.sav_page_title()} userName={userName} alertes={[]}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">

        {/* Bandeau numéro de téléphone */}
        <ContactBanner />

        {/* Onglets — uniquement si connecté */}
        {authentifie && <div
          role="tablist"
          aria-label={m.sav_tabs_aria()}
          className="flex gap-1 rounded-2xl border border-gray-200 bg-white p-1"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'faq'}
            aria-controls="tab-panel-faq"
            id="tab-faq"
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              activeTab === 'faq'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-700 hover:bg-blue-pale'
            }`}
          >
            <HelpCircle size={15} aria-hidden="true" />
            {m.sav_tab_faq()}
          </button>
          {authentifie && (
            <button
              role="tab"
              aria-selected={activeTab === 'demandes'}
              aria-controls="tab-panel-demandes"
              id="tab-demandes"
              type="button"
              onClick={() => setActiveTab('demandes')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                activeTab === 'demandes'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:bg-blue-pale'
              }`}
            >
              <MessageSquare size={15} aria-hidden="true" />
              {m.sav_tab_demandes()}
              {openTickets > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    activeTab === 'demandes'
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {openTickets}
                </span>
              )}
            </button>
          )}
        </div>}

        {/* Panneau FAQ */}
        {activeTab === 'faq' && (
          <div
            role="tabpanel"
            id="tab-panel-faq"
            aria-labelledby="tab-faq"
            className="flex flex-col gap-6"
          >
            {/* Barre de recherche */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder={m.sav_search_placeholder()}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-dark shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Quick help */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="mb-4 font-heading font-semibold text-primary">
                {m.sav_help_today()}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {buildQuickHelp().map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-3 text-center text-xs font-medium text-gray-700 transition hover:border-primary hover:bg-blue-pale hover:text-primary"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-pale">
                      <Icon size={18} className="text-primary" aria-hidden="true" />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections FAQ */}
            <div className="flex flex-col gap-3">
              {buildFaqSections().map((section) => (
                <SectionFaqCard key={section.id} section={section} />
              ))}
            </div>

            {/* Footer CTA */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <p className="font-heading font-semibold text-dark">
                {m.sav_faq_footer_title()}
              </p>
              <p className="mb-4 mt-1 text-sm text-gray-700">
                {m.sav_faq_footer_desc()}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/sav"
                  hash="contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-dark transition hover:bg-gray-50"
                >
                  <Phone size={16} aria-hidden="true" />
                  {m.sav_call_advisor()}
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab('demandes')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  {m.sav_open_request()}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Panneau Mes demandes */}
        {activeTab === 'demandes' && (
          <div
            role="tabpanel"
            id="tab-panel-demandes"
            aria-labelledby="tab-demandes"
            className="flex flex-col gap-6"
          >
            {/* En-tête + bouton */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-gray-900">
                  {m.sav_title()}
                </h2>
                <p className="mt-0.5 text-sm text-gray-700">{m.sav_subtitle()}</p>
              </div>
              <Button
                variant={showForm ? 'ghost' : 'primary'}
                className="w-auto"
                onClick={handleToggleForm}
                aria-expanded={showForm}
              >
                <span className="flex items-center gap-2">
                  <Plus
                    size={16}
                    aria-hidden="true"
                    className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'}
                  />
                  {showForm ? m.sav_cancel() : m.sav_new_btn()}
                </span>
              </Button>
            </div>

            {/* Confirmation d'envoi */}
            {successMsg && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
              >
                {successMsg}
              </div>
            )}

            {/* Formulaire nouvelle réclamation */}
            {showForm && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="mb-5 font-heading text-base font-semibold text-gray-900">
                  {m.sav_new_btn()}
                </h3>
                <form onSubmit={handleSubmitForm} noValidate className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sav-cat" className="text-sm font-medium text-dark">
                      {m.sav_form_category()}
                    </label>
                    <select
                      id="sav-cat"
                      value={categorie}
                      onChange={(e) => setCategorie(e.target.value as CategorieReclamation)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                    >
                      {CATEGORIES_SAV.map((cat) => (
                        <option key={cat} value={cat}>
                          {libelleCategorie(cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label={m.sav_form_subject()}
                    value={objet}
                    onChange={(e) => setObjet(e.target.value)}
                    error={objetError}
                    placeholder={m.sav_form_subject_placeholder()}
                    maxLength={120}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sav-desc" className="text-sm font-medium text-dark">
                      {m.sav_form_description()}
                    </label>
                    <textarea
                      id="sav-desc"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={m.sav_form_desc_placeholder()}
                      aria-invalid={descError ? true : undefined}
                      aria-describedby={descError ? 'sav-desc-error' : undefined}
                      className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-base text-dark placeholder-gray-700 outline-none transition focus:ring-2 ${
                        descError
                          ? 'border-danger focus:border-danger focus:ring-danger/20'
                          : 'border-gray-300 focus:border-primary focus:ring-primary/25'
                      }`}
                    />
                    {descError && (
                      <p id="sav-desc-error" role="alert" className="text-xs text-danger">
                        {descError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Button type="submit" className="flex-1 sm:w-auto sm:flex-none">
                      {m.sav_submit()}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 sm:w-auto sm:flex-none"
                      onClick={handleToggleForm}
                    >
                      {m.sav_cancel()}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des réclamations */}
            <section aria-labelledby="reclamations-titre">
              <h2 id="reclamations-titre" className="sr-only">
                {m.sav_list_title()}
              </h2>

              {reclamations.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
                  <MessageSquare size={36} className="text-gray-300" aria-hidden="true" />
                  <p className="font-heading text-base font-semibold text-gray-900">
                    {m.sav_empty_title()}
                  </p>
                  <p className="text-sm text-gray-700">{m.sav_empty_desc()}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3" role="list" aria-label={m.sav_list_title()}>
                  {reclamations.map((rec) => {
                    const expanded = expandedId === rec.id
                    return (
                      <article
                        key={rec.id}
                        role="listitem"
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30"
                          onClick={() => setExpandedId((prev) => (prev === rec.id ? null : rec.id))}
                          aria-expanded={expanded}
                          aria-controls={`rec-detail-${rec.id}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-gray-700">{rec.reference}</span>
                              <StatusBadge
                                libelle={libelleStatut(rec.statut)}
                                categorie={categoriePourStatut(rec.statut)}
                              />
                            </div>
                            <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                              {rec.objet}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-700">
                              {libelleCategorie(rec.categorie)} · {formatDate(rec.dateMiseAJour)}
                            </p>
                          </div>
                          {expanded ? (
                            <ChevronUp size={18} className="shrink-0 text-gray-700" aria-hidden="true" />
                          ) : (
                            <ChevronDown size={18} className="shrink-0 text-gray-700" aria-hidden="true" />
                          )}
                        </button>

                        {expanded && (
                          <div id={`rec-detail-${rec.id}`} className="border-t border-gray-200 p-4">
                            <div
                              className="flex flex-col gap-4"
                              role="list"
                              aria-label={m.sav_messages_thread_aria()}
                            >
                              {rec.messages.map((msg) => (
                                <div
                                  key={msg.id}
                                  role="listitem"
                                  className={`flex flex-col gap-1 ${msg.auteur === 'CLIENT' ? 'items-end' : 'items-start'}`}
                                >
                                  <span className="text-xs font-medium text-gray-700">
                                    {msg.auteur === 'CLIENT'
                                      ? m.sav_your_message()
                                      : m.sav_agent_reply()}
                                  </span>
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                      msg.auteur === 'CLIENT'
                                        ? 'rounded-tr-sm bg-primary text-white'
                                        : 'rounded-tl-sm bg-gray-100 text-dark'
                                    }`}
                                  >
                                    {msg.contenu}
                                  </div>
                                  <time dateTime={msg.date} className="text-xs text-gray-700">
                                    {formatDate(msg.date)}
                                  </time>
                                </div>
                              ))}
                            </div>

                            {(rec.statut === 'OUVERT' || rec.statut === 'EN_COURS') && (
                              <div className="mt-4 flex gap-2">
                                <label htmlFor={`reply-${rec.id}`} className="sr-only">
                                  {m.sav_add_message()}
                                </label>
                                <input
                                  id={`reply-${rec.id}`}
                                  type="text"
                                  placeholder={m.sav_reply_placeholder()}
                                  value={replyTexts[rec.id] ?? ''}
                                  onChange={(e) =>
                                    setReplyTexts((prev) => ({ ...prev, [rec.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendReply(rec.id)
                                  }}
                                  className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-dark placeholder-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendReply(rec.id)}
                                  aria-label={m.sav_send_reply()}
                                  disabled={!replyTexts[rec.id]?.trim()}
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Send size={16} aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
