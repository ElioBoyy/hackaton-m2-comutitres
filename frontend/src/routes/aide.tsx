import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Baby,
  CalendarDays,
  ChevronDown,
  FileCheck,
  Globe,
  Heart,
  HelpCircle,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  ScanSearch,
  Ticket,
  Train,
  Users,
  Wallet,
} from 'lucide-react'
import * as React from 'react'
import { UserSidebar } from '~/components/UserSidebar'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/aide')({
  component: AidePage,
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SousQuestion {
  question: string
  reponse: React.ReactNode
}

interface SectionFaq {
  id: string
  titre: string
  icon: typeof Train
  couleurBg: string
  couleurIcone: string
  questions: SousQuestion[]
}

// ---------------------------------------------------------------------------
// Données FAQ
// ---------------------------------------------------------------------------

const FAQ_SECTIONS: SectionFaq[] = [
  {
    id: 'trouver',
    titre: 'Trouver mon abonnement',
    icon: Train,
    couleurBg: 'bg-[#f5f8fe]',
    couleurIcone: 'text-primary',
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
    titre: 'Justificatifs & éligibilité',
    icon: FileCheck,
    couleurBg: 'bg-[#f2faf5]',
    couleurIcone: 'text-success',
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
    titre: 'Paiement & renouvellement',
    icon: Wallet,
    couleurBg: 'bg-[#f8f7fe]',
    couleurIcone: 'text-purple-600',
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
    titre: 'Nouvel arrivant en Île-de-France',
    icon: Globe,
    couleurBg: 'bg-[#fcfaef]',
    couleurIcone: 'text-amber-600',
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
    titre: 'Accessibilité & besoins spécifiques',
    icon: Heart,
    couleurBg: 'bg-[#fdf6f6]',
    couleurIcone: 'text-orange-600',
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
            <strong>09 69 39 22 22</strong> (non surtaxé). Pour la Solidarité Transport,
            un formulaire de contact est disponible sur le site dédié.
          </p>
        ),
      },
    ],
  },
  {
    id: 'proche',
    titre: "Gérer l'abonnement d'un proche",
    icon: Users,
    couleurBg: 'bg-[#f5f8fe]',
    couleurIcone: 'text-primary',
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
]

const QUICK_HELP = [
  { label: 'Je cherche un abonnement', icon: Search },
  { label: "Je viens d'arriver en Île-de-France", icon: Globe },
  { label: "J'ai une question sur mes justificatifs", icon: FileCheck },
  { label: "Je gère l'abonnement de mon enfant", icon: Baby },
  { label: "J'ai besoin d'aide", icon: HelpCircle },
]

// ---------------------------------------------------------------------------
// Composants
// ---------------------------------------------------------------------------

function AccordionQuestion({ question, reponse }: SousQuestion) {
  const [ouvert, setOuvert] = React.useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-dark hover:text-primary transition-colors"
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
        <div className="pb-4 text-sm text-gray-700 leading-relaxed">{reponse}</div>
      )}
    </div>
  )
}

function SectionFaqCard({ section }: { section: SectionFaq }) {
  const [ouvert, setOuvert] = React.useState(false)
  const [toutesVues, setToutesVues] = React.useState(false)
  const Icon = section.icon
  const questionsAffichees = toutesVues ? section.questions : section.questions.slice(0, 3)
  const resteCount = section.questions.length - 3

  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 ${section.couleurBg}`}>
      {/* En-tête de section */}
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:brightness-95"
        aria-expanded={ouvert}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/60">
            <Icon size={20} className={section.couleurIcone} aria-hidden="true" />
          </div>
          <span className="font-heading text-base font-semibold text-dark">{section.titre}</span>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Questions */}
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
                ? 'Masquer les questions supplémentaires'
                : `Voir toutes les questions (${section.questions.length})`}
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function AidePage() {
  const navigate = useNavigate()
  const [utilisateur, setUtilisateur] = React.useState<MeResponse | null>(null)
  const [sidebarOuverte, setSidebarOuverte] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated()) {
      me().then(setUtilisateur).catch(() => {})
    }
  }, [])

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  const prenom = utilisateur?.prenom ?? ''
  const initiale = prenom.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar isOpen={sidebarOuverte} onClose={() => setSidebarOuverte(false)} />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOuverte(true)}
              aria-label="Ouvrir le menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <nav className="hidden text-sm text-gray-500 sm:flex items-center gap-1.5">
              <Link to="/" className="hover:text-primary">Accueil</Link>
              <span>/</span>
              <span className="font-medium text-dark">Aide et contacts</span>
              <span>/</span>
              <span className="font-medium text-primary">FAQ</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <LanguageSwitcher />
              {utilisateur && (
                <div className="flex items-center gap-2">
                  <div
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm font-semibold text-white"
                  >
                    {initiale}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {m.dashboard_hello()} {prenom}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label={m.me_sign_out()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-4xl flex flex-col gap-6">

            {/* Titre */}
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-dark">FAQ</h1>
              <p className="mt-1 text-gray-700">Trouvez rapidement des réponses à vos questions.</p>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Rechercher une question, un abonnement, un justificatif..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-dark shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Quick help */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="mb-4 font-heading font-semibold text-primary">
                Comment pouvons-nous vous aider aujourd'hui ?
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {QUICK_HELP.map(({ label, icon: Icon }) => (
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
              {FAQ_SECTIONS.map((section) => (
                <SectionFaqCard key={section.id} section={section} />
              ))}
            </div>

            {/* Footer CTA */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <p className="font-heading font-semibold text-dark">
                Vous ne trouvez pas la réponse à votre question ?
              </p>
              <p className="mt-1 mb-4 text-sm text-gray-700">Notre équipe est là pour vous aider.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-dark hover:bg-gray-50 transition"
                >
                  <Ticket size={16} aria-hidden="true" />
                  Consulter nos guides
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Nous contacter
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
