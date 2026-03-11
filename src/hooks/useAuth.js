import { useState, useEffect } from 'react'
import { onAuth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    const unsub = onAuth((u) => setUser(u))
    return unsub
  }, [])

  return user
}
