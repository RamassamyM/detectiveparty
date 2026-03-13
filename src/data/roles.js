export const ROLES = [
  { e: '🕵️', n: 'Sherlock',    r: 'Génie de la déduction logique' },
  { e: '🔍', n: 'Maigret',     r: 'Commissaire du bistrot parisien' },
  { e: '🌂', n: 'Columbo',     r: 'Maître du "juste une chose..."' },
  { e: '🤌', n: 'Montalbano',  r: 'Détective culinaire de Sicile' },
  { e: '🎶', n: 'Morse',       r: "Inspecteur mélomane d'Oxford" },
  { e: '🎩', n: 'Poirot',      r: 'As des petites cellules grises' },
  { e: '💄', n: 'Miss Marple', r: 'Vieille dame redoutablement fine' },
  { e: '🕶️', n: 'Marlowe',     r: 'Privé des nuits de Los Angeles' },
  { e: '📜', n: 'Dupin',       r: 'Ancêtre du polar moderne' },
  { e: '🚗', n: 'Starsky',     r: "As du volant et de l'instinct" },
  { e: '👊', n: 'Hutch',       r: 'Partenaire de choc californien' },
  { e: '🍩', n: 'Sipowicz',    r: 'Flic de la vieille école de NY' },
  { e: '🧠', n: 'Monk',        r: 'Détective TOC ultra-précis' },
  { e: '💻', n: 'Lisbon',      r: 'Agent spécial du FBI' },
  { e: '☕', n: 'Gamache',     r: "Inspecteur des Cantons de l'Est" },
  { e: '🎸', n: 'Rebus',       r: "Flic rebelle d'Édimbourg" },
  { e: '🌊', n: 'Wallander',   r: 'Détective mélancolique de Suède' },
  { e: '🦁', n: 'Bosch',       r: 'Agent implacable du LAPD' },
  { e: '🌙', n: 'Vera',        r: 'Inspectrice du Northumberland' },
  { e: '🐺', n: 'Barnaby',     r: 'Détective des villages meurtriers' },
]

export const LEVELS = [
  { min: 0,  lbl: 'STAGIAIRE',        e: '🐣' },
  { min: 1,  lbl: 'LIMIER',           e: '🦊' },
  { min: 2,  lbl: 'INSPECTEUR',       e: '🔍' },
  { min: 3,  lbl: 'COMMISSAIRE',      e: '🎩' },
  { min: 5,  lbl: 'AGENT SECRET',     e: '🕵️' },
  { min: 7,  lbl: 'MAÎTRE DÉTECTIVE', e: '🧠' },
  { min: 10, lbl: 'LÉGENDE VIVANTE',  e: '⭐' },
]

export function getLevel(score) {
  const s = score || 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (s >= LEVELS[i].min) return { ...LEVELS[i], index: i }
  }
  return { ...LEVELS[0], index: 0 }
}

export function getLevelProgress(score) {
  const s = score || 0
  const current = getLevel(s)
  const next = LEVELS[current.index + 1]
  
  // Progression totale depuis STAGIAIRE (0) jusqu'à LÉGENDE VIVANTE (10)
  const totalMaxScore = 10 // LÉGENDE VIVANTE commence à 10 points
  const totalProgress = Math.min((s / totalMaxScore) * 100, 100)
  
  // Prochain niveau pour le label
  let nextLabel = 'MAX !'
  if (next) {
    nextLabel = `→ ${next.e} ${next.lbl} à ${next.min} pts`
  }
  
    
  return { pct: totalProgress, nextLabel }
}

export const GAME_IMAGES = [
  { e: '🕵️', l: 'Détective' }, { e: '🎭', l: 'Théâtre' },   { e: '🔍', l: 'Enquête' },
  { e: '🎩', l: 'Mystère' },   { e: '🦁', l: 'Safari' },     { e: '🌙', l: 'Nuit' },
  { e: '🎪', l: 'Cirque' },    { e: '🏴‍☠️', l: 'Pirates' },  { e: '🧪', l: 'Science' },
]
