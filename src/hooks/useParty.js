import { useState, useEffect, useRef } from 'react'
import { dbListen, dbSet } from '../firebase'

export function useParty(partyId) {
  const [party, setParty] = useState(undefined)
  const partyRef = useRef(null)

  useEffect(() => {
    if (!partyId) return
    const unsub = dbListen(`/parties/${partyId}`, (val) => {
      partyRef.current = val
      setParty(val)
    })
    return unsub
  }, [partyId])

  // Auto-end: check endTs every 10s, trigger ended=true when time comes
  useEffect(() => {
    const interval = setInterval(() => {
      const p = partyRef.current
      if (!p || p.ended || !p.endTs) return
      if (Date.now() >= p.endTs) {
        dbSet(`/parties/${partyId}/ended`, true)
        dbSet(`/parties/${partyId}/endedAt`, Date.now())
      }
    }, 10_000)
    return () => clearInterval(interval)
  }, [partyId])

  return party
}

export function useParties() {
  const [parties, setParties] = useState(undefined)

  useEffect(() => {
    const unsub = dbListen('/parties', (val) => setParties(val ? Object.values(val) : []))
    return unsub
  }, [])

  return parties
}
