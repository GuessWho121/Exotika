"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

interface FavoritesState {
  favoriteIds: string[]
}

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: string }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "TOGGLE_FAVORITE"; payload: string }

const FavoritesContext = createContext<{
  state: FavoritesState
  dispatch: React.Dispatch<FavoritesAction>
} | null>(null)

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "ADD_FAVORITE":
      if (state.favoriteIds.includes(action.payload)) {
        return state
      }
      return {
        ...state,
        favoriteIds: [...state.favoriteIds, action.payload],
      }

    case "REMOVE_FAVORITE":
      return {
        ...state,
        favoriteIds: state.favoriteIds.filter(id => id !== action.payload),
      }

    case "TOGGLE_FAVORITE":
      if (state.favoriteIds.includes(action.payload)) {
        return {
          ...state,
          favoriteIds: state.favoriteIds.filter(id => id !== action.payload),
        }
      } else {
        return {
          ...state,
          favoriteIds: [...state.favoriteIds, action.payload],
        }
      }

    default:
      return state
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favoriteIds: [],
  })

  return <FavoritesContext.Provider value={{ state, dispatch }}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
