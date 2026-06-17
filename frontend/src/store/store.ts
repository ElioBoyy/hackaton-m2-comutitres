import { configureStore } from '@reduxjs/toolkit'
import wizardReducer from '~/store/wizardSlice'

// Store cree a la demande (un par requete SSR / par session client) plutot
// qu'un singleton module-level, pour eviter de partager l'etat entre
// requetes server-side. Voir StoreProvider.
export function makeStore() {
  return configureStore({
    reducer: {
      wizard: wizardReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
