'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type CartContextValue = {
  count: number
  lastAdded: string | null
  addItem: (name: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  const addItem = useCallback((name: string) => {
    setCount((c) => c + 1)
    setLastAdded(name)
  }, [])

  const value = useMemo(() => ({ count, lastAdded, addItem }), [count, lastAdded, addItem])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
