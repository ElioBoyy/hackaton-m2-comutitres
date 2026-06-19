import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { m } from '~/paraglide/messages'
import type { Bornes, Coordonnees, PointDeVente, TypePointDeVente } from '~/lib/points-de-vente'

// Import vanilla de Leaflet (charge dynamiquement cote client uniquement, pour
// ne pas casser le rendu SSR de TanStack Start — Leaflet touche `window`).
// React gere toute l'UI (panneau, boutons RDV) ; Leaflet ne gere que la carte
// et les marqueurs, et remonte les clics via `onSelect`.

interface Props {
  points: PointDeVente[]
  selectedId: string | null
  onSelect: (point: PointDeVente) => void
  userPosition: Coordonnees | null
  /** appele a l'init puis a chaque deplacement/zoom avec les bornes visibles */
  onBoundsChange?: (bornes: Bornes) => void
}

const COULEURS: Record<TypePointDeVente, string> = {
  'Guichet Navigo': '#0050aa',
  'Commerce de proximité': '#007d44',
}
const COULEUR_SELECTION = '#e72f69'

// Centre par defaut : Paris (utilise tant qu'on n'a pas la position utilisateur).
const CENTRE_IDF: [number, number] = [48.8566, 2.3522]

export function CartePointsDeVente({ points, selectedId, onSelect, userPosition, onBoundsChange }: Props) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  // Refs vers les objets Leaflet (typage souple : Leaflet est charge dynamiquement).
  const mapRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const marqueursRef = useRef<Map<string, any>>(new Map())
  const marqueurUserRef = useRef<any>(null)
  const selectionPrecedenteRef = useRef<string | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  // onSelect peut changer a chaque rendu : on le garde dans une ref pour eviter
  // de recreer tous les marqueurs.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onBoundsChangeRef = useRef(onBoundsChange)
  onBoundsChangeRef.current = onBoundsChange

  // Init de la carte + des marqueurs (une seule fois, cote client).
  useEffect(() => {
    let annule = false
    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet.markercluster')
      if (annule || !conteneurRef.current || mapRef.current) return
      LRef.current = L

      const map = L.map(conteneurRef.current, {
        center: CENTRE_IDF,
        zoom: 11,
        scrollWheelZoom: true,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      // Remonte les bornes visibles a chaque deplacement/zoom/resize pour que la
      // liste ne montre que les points dans le cadre. Un ResizeObserver force
      // invalidateSize quand le conteneur prend sa taille (la carte peut etre
      // montee avec une taille nulle avant que le layout flex ne se stabilise) ;
      // invalidateSize declenche l'evenement `resize` ci-dessous.
      const emettreBornes = () => {
        const b = map.getBounds()
        onBoundsChangeRef.current?.({
          nord: b.getNorth(),
          sud: b.getSouth(),
          est: b.getEast(),
          ouest: b.getWest(),
        })
      }
      map.on('moveend zoomend resize', emettreBornes)
      emettreBornes()

      const ro = new ResizeObserver(() => map.invalidateSize())
      ro.observe(conteneurRef.current)
      resizeObserverRef.current = ro

      const cluster = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
      })

      for (const point of points) {
        const marqueur = L.marker([point.lat, point.lng], {
          icon: iconePour(L, COULEURS[point.type], false),
        })
        marqueur.on('click', () => onSelectRef.current(point))
        marqueursRef.current.set(point.id, marqueur)
        cluster.addLayer(marqueur)
      }
      map.addLayer(cluster)
    }
    init()
    return () => {
      annule = true
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      marqueursRef.current.clear()
    }
  }, [points])

  // Marqueur de la position utilisateur + recentrage quand elle arrive.
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    if (!L || !map || !userPosition) return
    if (marqueurUserRef.current) {
      marqueurUserRef.current.setLatLng([userPosition.lat, userPosition.lng])
    } else {
      marqueurUserRef.current = L.marker([userPosition.lat, userPosition.lng], {
        icon: iconeUtilisateur(L),
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map)
    }
    map.flyTo([userPosition.lat, userPosition.lng], 13, { duration: 0.8 })
  }, [userPosition])

  // Met en avant le point selectionne (icone accentuee) + recentrage doux.
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    if (!L || !map) return

    const precedent = selectionPrecedenteRef.current
    if (precedent && precedent !== selectedId) {
      const point = points.find((p) => p.id === precedent)
      const m = marqueursRef.current.get(precedent)
      if (point && m) m.setIcon(iconePour(L, COULEURS[point.type], false))
    }

    if (selectedId) {
      const point = points.find((p) => p.id === selectedId)
      const m = marqueursRef.current.get(selectedId)
      if (point && m) {
        m.setIcon(iconePour(L, COULEUR_SELECTION, true))
        map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), { duration: 0.6 })
      }
    }
    selectionPrecedenteRef.current = selectedId
  }, [selectedId, points])

  return <div ref={conteneurRef} className="h-full w-full" aria-label={m.map_aria()} />
}

function iconePour(L: any, couleur: string, selectionne: boolean) {
  const taille = selectionne ? 34 : 24
  return L.divIcon({
    className: 'pdv-marqueur',
    html: `<span style="
      display:block;width:${taille}px;height:${taille}px;border-radius:50% 50% 50% 0;
      background:${couleur};transform:rotate(-45deg);
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);
    "></span>`,
    iconSize: [taille, taille],
    iconAnchor: [taille / 2, taille],
  })
}

function iconeUtilisateur(L: any) {
  return L.divIcon({
    className: 'pdv-marqueur-user',
    html: `<span style="
      display:block;width:18px;height:18px;border-radius:50%;
      background:#1972d2;border:3px solid #fff;box-shadow:0 0 0 4px rgba(25,114,210,.3);
    "></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}
