export const GAGE_TYPES = {
  soft: { label: 'Soft', emoji: '😄', color: '#39FF14', desc: 'Drôle et sans prise de tête — tout public' },
  med:  { label: 'Moyen', emoji: '�', color: '#00F5FF', desc: 'Un peu plus piquant — reste bon enfant' },
  hard: { label: 'Hard', emoji: '🔥', color: '#FF3CAC', desc: 'Osé et potentiellement gênant — entre adultes complices' },
  sexy: { label: 'Sexy', emoji: '💋', color: '#FF6AD5', desc: 'Flirt et tension légère — toujours consentie' },
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
    a: 'Refaire son compliment en mode "poète romantique du 19ème siècle" (20 secondes).',
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
    a: 'Faire un défilé de mode improvisé (3 pas + pose) en commentant son propre style.',
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
    a: 'Répéter sa phrase "En tant que..." en ajoutant 3 qualifications de plus en plus ridicules.',
    i: 'Les experts autoproclamés !', lvl: 'med',
  },
  {
    t: '🙄 Quelqu\'un dit "moi j\'aurais fait autrement"',
    a: 'Donner un conseil de vie complètement absurde au détective (avec un ton ultra-sérieux, 15 secondes).',
    i: 'Les donneurs de leçons !', lvl: 'med',
  },
  {
    t: '🗺️ Quelqu\'un dit "quand j\'étais à l\'étranger"',
    a: "Répondre à 3 questions de géo sur le pays mentionné (posées par le détective).",
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
    a: "Appeler un contact au hasard et le saluer avec un surnom inventé sur le moment (appel en haut-parleur).",
    i: 'Les anecdoteurs passionnés !', lvl: 'med',
  },
  {
    t: '👀 Quelqu\'un regarde de haut en bas',
    a: 'Décrire sa propre tenue comme si c\'était une œuvre d\'art dans un musée (15 secondes).',
    i: 'La fashion police !', lvl: 'med',
  },
  {
    t: '🤌 Quelqu\'un gesticule excessivement',
    a: 'Mimer exactement les gestes d\'une autre personne au choix en miroir pendant toute la conversation.',
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
    a: 'Raconter son pire moment "pas sage" de l\'année (30 secondes, détails interdits de censure).',
    i: 'Les soi-disant assagis !', lvl: 'hard',
  },
  {
    t: '💬 Quelqu\'un parle de son ex spontanément',
    a: "Répondre à 3 questions du groupe sur cet ex (peut passer sur 1).",
    i: 'Les nostalgiques !', lvl: 'hard',
  },
  {
    t: '🙅 Quelqu\'un dit "j\'ai jamais fait ça"',
    a: "Avouer une chose qu'il a déjà faite mais qu'il prétendait ne jamais avoir faite.",
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

  // ────────────────── SEXY (8) ──────────────────
  {
    t: '💋 Quelqu\'un dit "c\'est sexy"',
    a: 'Faire un compliment ultra-précis et élégant à une personne du groupe (sans toucher).',
    i: 'Consentement et classe avant tout.', lvl: 'sexy',
  },
  {
    t: '🌶️ Quelqu\'un dit "c\'est chaud"',
    a: 'Regarder quelqu\'un dans les yeux 5 secondes et lui dire une phrase de film romantique (choisie par le groupe).',
    i: 'Interdiction de rire (ou presque).', lvl: 'sexy',
  },
  {
    t: '😏 Quelqu\'un dit "j\'avoue"',
    a: 'Avouer un petit crush de célébrité (ou personnage fictif) et expliquer pourquoi en 20 secondes.',
    i: 'Fictif accepté si ça gêne !', lvl: 'sexy',
  },
  {
    t: '💄 Quelqu\'un se recoiffe devant un reflet',
    a: 'Faire une démarche de mannequin sur 3 pas et une pose finale dramatique.',
    i: 'Catwalk improvisé.', lvl: 'sexy',
  },
  {
    t: '🫦 Quelqu\'un dit "trop mignon"',
    a: 'Envoyer (à voix haute) un SMS de drague "très soft" à quelqu\'un : le groupe dicte, la victime peut refuser 1 mot.',
    i: 'Toujours respectueux.', lvl: 'sexy',
  },
  {
    t: '🕯️ Quelqu\'un dit "ambiance"',
    a: 'Faire une mini pub "parfum" pour une personne du groupe (10 secondes, ton très dramatique).',
    i: 'Voix grave recommandée.', lvl: 'sexy',
  },
  {
    t: '🫶 Quelqu\'un fait un compliment à quelqu\'un',
    a: 'Transformer son compliment en poème rimé (4 lignes minimum).',
    i: 'Poésie instantanée.', lvl: 'sexy',
  },
  {
    t: '🥂 Quelqu\'un trinque avec quelqu\'un',
    a: 'Porter un toast ultra-romantique et cheesy en l\'honneur du détective (15 secondes).',
    i: 'Plus c\'est cheesy, mieux c\'est.', lvl: 'sexy',
  },
]

export const TRIGGERS = GAGES.map((g, idx) => {
  const gage = { a: g.a, i: g.i }
  return {
    id: idx + 1,
    trigger: g.t,
    gages: {
      soft: gage,
      med: gage,
      hard: gage,
      sexy: gage,
    },
  }
})

export function getGagesForLevel(level) {
  const allowed = level === 'hard' ? ['soft','med','hard'] : level === 'med' ? ['soft','med'] : ['soft']
  return GAGES.map((g, i) => ({ ...g, index: i })).filter(g => allowed.includes(g.lvl))
}
