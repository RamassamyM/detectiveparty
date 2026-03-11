export const GAGE_TYPES = {
  soft:     { label: 'Fun & Soft',  emoji: '😄', color: '#39FF14', desc: 'Drôle et sans prise de tête — tout public' },
  physique: { label: 'Physique',    emoji: '💪', color: '#00F5FF', desc: 'La victime se dépense — visible par tous !' },
  ose:      { label: 'Osé',         emoji: '🔥', color: '#FF3CAC', desc: 'Aveux et situations gênantes — entre adultes complices' },
}

export const GAGES = [
  // ────────────────── SOFT (15) ──────────────────
  {
    t: '🗣️ Quelqu\'un dit "en fait" 2× en 1 min',
    a: "Imiter l'accent d'un pays tiré au sort par le groupe pendant 2 minutes.",
    i: 'Surveille les débatteurs passionnés !', lvl: 'soft',
  },
  {
    t: '🤗 Quelqu\'un croise les bras',
    a: 'Chanter le refrain d\'une chanson imposée par le groupe.',
    i: 'Les timides croisent souvent les bras !', lvl: 'soft',
  },
  {
    t: '🥂 Quelqu\'un finit son verre',
    a: 'Raconter en 30 sec son meilleur souvenir de l\'année.',
    i: 'Surveille les assoiffés !', lvl: 'soft',
  },
  {
    t: '🎵 Quelqu\'un chantonne sans s\'en rendre compte',
    a: 'Finir la chanson depuis le début à voix haute.',
    i: 'Les fredoneurs inconscients !', lvl: 'soft',
  },
  {
    t: '😮 Quelqu\'un dit "oh là là !"',
    a: 'Faire une mimique de surprise extrême face au groupe pendant 10 sec.',
    i: 'Les expressifs de service !', lvl: 'soft',
  },
  {
    t: '🤔 Quelqu\'un dit "hmm" en réfléchissant',
    a: 'Faire semblant d\'être un robot pendant 1 minute.',
    i: 'Les penseurs silencieux !', lvl: 'soft',
  },
  {
    t: '💁 Quelqu\'un fait un compliment à quelqu\'un',
    a: 'Surenchérir avec un compliment encore plus excessif.',
    i: 'Les galants de la soirée !', lvl: 'soft',
  },
  {
    t: '🙈 Quelqu\'un bâille sans couvrir sa bouche',
    a: 'Raconter un rêve bizarre de la semaine.',
    i: 'Les fatigués du soir !', lvl: 'soft',
  },
  {
    t: '🤸 Quelqu\'un se lève de sa chaise',
    a: 'Rester debout et faire un discours de 30 sec sur un sujet imposé.',
    i: 'Les agités sont partout !', lvl: 'soft',
  },
  {
    t: '🦋 Quelqu\'un dit "c\'est pas grave"',
    a: 'Mimer en silence ce dont il était question.',
    i: 'Les conciliants du lot !', lvl: 'soft',
  },
  {
    t: '😄 Quelqu\'un rit aux éclats',
    a: 'Lui demander de raconter ce qui était si drôle.',
    i: 'Les rieurs francs !', lvl: 'soft',
  },
  {
    t: '🌟 Quelqu\'un dit "exactement !" en acquiesçant',
    a: 'Citer 3 choses sur lesquelles il est exactement du même avis que toi.',
    i: 'Les approuveurs compulsifs !', lvl: 'soft',
  },
  {
    t: '🎩 Quelqu\'un arrange ses cheveux ou sa tenue',
    a: 'Le complimenter avec une tirade de 20 sec ultra-enthousiaste.',
    i: 'Les coquets de la soirée !', lvl: 'soft',
  },
  {
    t: '🐢 Quelqu\'un parle trop lentement',
    a: 'Finir sa phrase à toute vitesse.',
    i: 'Les orateurs lents !', lvl: 'soft',
  },
  {
    t: '🌈 Quelqu\'un dit "c\'est trop bien"',
    a: 'Lister 5 choses "trop bien" en 30 secondes sans s\'arrêter.',
    i: 'Les enthousiastes de service !', lvl: 'soft',
  },

  // ────────────────── MEDIUM (15) ──────────────────
  {
    t: '🤷 Quelqu\'un dit "c\'est compliqué"',
    a: "Expliquer sa vie/boulot comme si l'autre avait 5 ans.",
    i: 'Les diplomates du lot !', lvl: 'med',
  },
  {
    t: '😂 Quelqu\'un rit sans avoir compris la blague',
    a: 'Avouer et raconter une vraie bonne blague (jugée par vote du groupe).',
    i: 'Les rires polis se repèrent facilement !', lvl: 'med',
  },
  {
    t: '💁 Quelqu\'un commence par "En tant que..."',
    a: 'Mimer en silence ce que l\'autre vient de dire.',
    i: 'Les experts autoproclamés !', lvl: 'med',
  },
  {
    t: '🙄 Quelqu\'un dit "moi j\'aurais fait autrement"',
    a: 'Donner un conseil de vie absurde mais ultra-convaincu.',
    i: 'Les donneurs de leçons !', lvl: 'med',
  },
  {
    t: '🗺️ Quelqu\'un dit "quand j\'étais à l\'étranger"',
    a: "3 questions de géo sur le pays. S'il se trompe, c'est son gage.",
    i: 'Les globe-trotteurs !', lvl: 'med',
  },
  {
    t: '📸 Quelqu\'un prend une photo pour ses stories',
    a: 'Apparaître dans le cadre avec la pose la plus bizarre possible.',
    i: 'Infiltre le cadre discrètement !', lvl: 'med',
  },
  {
    t: '😤 Quelqu\'un soupire bruyamment',
    a: 'Draguer quelqu\'un du groupe avec la pire réplique possible.',
    i: 'Les exaspérés !', lvl: 'med',
  },
  {
    t: '🤓 Quelqu\'un corrige la grammaire d\'un autre',
    a: 'Parler uniquement en verlan pendant 5 minutes.',
    i: 'Les puristes de la langue !', lvl: 'med',
  },
  {
    t: '🍕 Quelqu\'un parle de son régime en mangeant',
    a: 'Lui composer un menu de régime délirant à énoncer à voix haute.',
    i: 'Les coupables culinaires !', lvl: 'med',
  },
  {
    t: '🙈 Quelqu\'un dit "ça reste entre nous"',
    a: "Répéter ce qui vient d'être dit... à voix haute face au groupe.",
    i: "Les secrets de soirée n'existent pas !", lvl: 'med',
  },
  {
    t: '📱 Quelqu\'un consulte son téléphone discrètement',
    a: 'Lire à voix haute son dernier message envoyé (1 mot censuré autorisé).',
    i: 'Les notif-addicts !', lvl: 'med',
  },
  {
    t: '😮 Quelqu\'un dit "c\'est fou"',
    a: "Appeler quelqu'un de sa liste avec un surnom inventé par le groupe.",
    i: 'Les anecdoteurs passionnés !', lvl: 'med',
  },
  {
    t: '👀 Quelqu\'un regarde de haut en bas',
    a: 'Faire un compliment exagérément enthousiaste sur sa tenue.',
    i: 'La fashion police !', lvl: 'med',
  },
  {
    t: '🤌 Quelqu\'un gesticule excessivement',
    a: 'Mimer exactement ses gestes en miroir pendant toute la conversation.',
    i: 'Les expressifs gestuels !', lvl: 'med',
  },
  {
    t: '😏 Quelqu\'un dit "je ne dis pas que..."',
    a: 'Finir sa phrase pour lui, de la façon la plus dramatique possible.',
    i: 'Les sous-entendeurs !', lvl: 'med',
  },

  // ────────────────── HARD (15) ──────────────────
  {
    t: '🔥 Quelqu\'un dit "je suis pas jaloux(se)"',
    a: 'Avouer sa vraie jalousie la plus récente face au groupe.',
    i: 'Les jaloux du lot !', lvl: 'hard',
  },
  {
    t: '💋 Quelqu\'un dit "ça c\'est mon genre"',
    a: 'Décrire en détail son type idéal en 30 sec sous les applaudissements.',
    i: 'Les romantiques décomplexés !', lvl: 'hard',
  },
  {
    t: '🍸 Quelqu\'un dit "je bois plus autant qu\'avant"',
    a: 'Révéler sa soirée la plus épique (censurée ou pas, c\'est son choix).',
    i: 'Les anciens fêtards !', lvl: 'hard',
  },
  {
    t: '😈 Quelqu\'un dit "je suis sage maintenant"',
    a: 'Le groupe choisit un gage parmi les 3 plus durs du deck.',
    i: 'Les soi-disant assagis !', lvl: 'hard',
  },
  {
    t: '💬 Quelqu\'un parle de son ex spontanément',
    a: "Répondre à 3 questions du groupe sur cet ex (peut passer sur 1).",
    i: 'Les nostalgiques !', lvl: 'hard',
  },
  {
    t: '🙅 Quelqu\'un dit "j\'ai jamais fait ça"',
    a: "Le groupe décide si c'est vrai. S'il ment, il doit avouer.",
    i: 'Le jeu du jamais !', lvl: 'hard',
  },
  {
    t: '🕺 Quelqu\'un dit "je sais pas danser"',
    a: 'Danser en solo 30 sec sur un morceau choisi par le groupe.',
    i: 'Les faux modestes !', lvl: 'hard',
  },
  {
    t: '🤫 Quelqu\'un chuchote quelque chose à l\'oreille',
    a: 'Répéter ce secret à voix haute (peut inventer s\'il refuse).',
    i: 'Les comploteurs !', lvl: 'hard',
  },
  {
    t: '💼 Quelqu\'un parle de son boulot plus de 2 min',
    a: 'Mimer son boulot façon muet pendant que le groupe devine.',
    i: 'Les workaholics !', lvl: 'hard',
  },
  {
    t: '😬 Quelqu\'un dit "je vais pas m\'étaler"',
    a: "S'étaler exactement sur ce sujet pendant 1 minute chrono.",
    i: 'Les faux discrets !', lvl: 'hard',
  },
  {
    t: '🌶️ Quelqu\'un dit "je mange tout" au buffet',
    a: 'Manger un aliment au choix du groupe les yeux fermés.',
    i: 'Les bons vivants !', lvl: 'hard',
  },
  {
    t: '🏄 Quelqu\'un dit "moi je stresse jamais"',
    a: 'Le groupe lui invente le scénario le plus stressant, il doit garder le sourire.',
    i: 'Les zen autoproclamés !', lvl: 'hard',
  },
  {
    t: '🤣 Quelqu\'un rate une vanne',
    a: 'Expliquer la blague ratée en 3 versions différentes.',
    i: 'Les humoristes en herbe !', lvl: 'hard',
  },
  {
    t: '👑 Quelqu\'un dit "je suis humble"',
    a: 'Lister ses 5 plus grandes qualités en se vantant le plus possible.',
    i: 'Les faux modestes du soir !', lvl: 'hard',
  },
  {
    t: '🎭 Quelqu\'un imite quelqu\'un d\'autre',
    a: "Faire une imitation d'une célébrité choisie par le groupe pendant 1 min.",
    i: 'Les imitateurs du lot !', lvl: 'hard',
  },
]

export const TRIGGERS = GAGES.map((g, idx) => {
  const gage = { a: g.a, i: g.i }
  return {
    id: idx + 1,
    trigger: g.t,
    gages: {
      soft: gage,
      physique: gage,
      ose: gage,
    },
  }
})

export function getGagesForLevel(level) {
  const allowed = level === 'hard' ? ['soft','med','hard'] : level === 'med' ? ['soft','med'] : ['soft']
  return GAGES.map((g, i) => ({ ...g, index: i })).filter(g => allowed.includes(g.lvl))
}
