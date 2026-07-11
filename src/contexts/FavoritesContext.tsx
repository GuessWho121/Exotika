"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useAdmin } from "./AdminContext"

interface FavoritesState {
  favoriteIds: string[]
}

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: string }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "TOGGLE_FAVORITE"; payload: string }
  | { type: "SET_FAVORITES"; payload: string[] }

const FavoritesContext = createContext<{
  state: FavoritesState
  dispatch: React.Dispatch<FavoritesAction>
} | null>(null)

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case "SET_FAVORITES":
      return {
        ...state,
        favoriteIds: action.payload,
      }

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
  const { state: adminState } = useAdmin()
  const user = adminState.user

  // Load user favorites on mount/login
  useEffect(() => {
    if (user) {
      const loadFavorites = async () => {
        try {
          const res = await fetch("/api/products/user/favorites")
          if (res.ok) {
            const json = await res.json()
            const ids = json.data.favorites.map((p: any) => p.id)
            dispatch({ type: "SET_FAVORITES", payload: ids })
          }
        } catch (err) {
          console.error("Failed to load favorites:", err)
        }
      }
      loadFavorites()
    } else {
      dispatch({ type: "SET_FAVORITES", payload: [] })
    }
  }, [user])

  // Custom dispatch wrapper to sync favorites changes with the server
  const customDispatch = async (action: FavoritesAction) => {
    // 1. Optimistically update local frontend state
    dispatch(action)

    // 2. If user is logged in, sync with server
    if (user && action.type === "TOGGLE_FAVORITE") {
      try {
        await fetch(`/api/products/${action.payload}/favorite`, {
          method: "POST",
        })
      } catch (err) {
        console.error("Failed to sync favorite with server:", err)
      }
    }
  }

  return (
    <FavoritesContext.Provider value={{ state, dispatch: customDispatch as any }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
