/**
 * Convertit une date "YYYY-MM-DD" + heure "HH:MM" en timestamp Unix (ms)
 * en respectant le fuseau horaire LOCAL du navigateur.
 *
 * On évite new Date("YYYY-MM-DDTHH:MM") qui est ambigu selon les navigateurs
 * (certains le traitent en UTC, d'autres en heure locale).
 */
export function localToTs(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm]  = timeStr.split(':').map(Number)
  // new Date(year, monthIndex, day, hours, minutes) → toujours LOCAL
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

/**
 * Formate un timestamp en "DD mois YYYY à HH:MM" en heure locale.
 */
export function tsToLabel(ts) {
  if (!ts) return '—'
  const mois = ['jan','fév','mars','avr','mai','juin','juil','août','sep','oct','nov','déc']
  const d  = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()} à ${hh}:${mm}`
}

/**
 * Rétro-compat : les anciennes parties ont des champs string date/time,
 * les nouvelles ont des timestamps directs.
 */
export function getGameTs(party) {
  if (party.gameTs)                       return party.gameTs
  if (party.gameDate && party.gameTime)   return localToTs(party.gameDate, party.gameTime)
  if (party.date     && party.time)       return localToTs(party.date,     party.time)
  return null
}

export function getRegTs(party) {
  if (party.regTs)                        return party.regTs
  if (party.regDate  && party.regTime)    return localToTs(party.regDate,  party.regTime)
  return getGameTs(party) // fallback : inscriptions = début du jeu
}

export function getRegEndTs(party) {
  if (party.regEndTs)                       return party.regEndTs
  if (party.regEndDate && party.regEndTime) return localToTs(party.regEndDate, party.regEndTime)
  return null
}
