// StickFighters: Skill tree data: XP rules, branches, nodes, ultimates (plain data; VISION.md rule R3)
// XP for the next level = XP_RULES.base × level^XP_RULES.exp (rounded to 10). Points: one per level from 2, plus a
// bonus at every fifth level. Pace (a Wooded Trail clear is about 450 XP): level 5 in about 2-3 clears, 10 in about
// 18, 15 in about 55, 30 in about 340 (roughly 40 hours). More levels and harder enemies will pay more XP.
const XP_RULES = { base: 60, exp: 1.6, cap: 30, bonusEvery: 5 };
// XP for each enemy beaten (by type, data/enemies.js keys); every player in the fight gets it
const XP_KILL = { g: 8, r: 10, b: 20, u: 18, f: 15, c: 80 };
// XP for finishing things: a level, each Arcade wave reached, each Versus KO and a Versus win
const XP_BONUS = { level: 100, wave: 10, vsKO: 15, vsWin: 40 };
// Points needed in a branch's lower rows before each row opens
const ROW_NEEDS = [0, 3, 6, 10];
// Levels at which an ultimate's three steps can be bought (one point each, in order, in one branch only)
const ULT_LEVELS = [5, 15, 30];
// Branches: id, name, colour, and the three steps of its ultimate (move ids in data/moves.js). Fortune has none.
const SKB = [
  { id: 'fists', name: 'Fists', c: '#ff7a00', ult: ['uflurry', 'uhundred', 'ucomet'] },
  { id: 'legs', name: 'Legs', c: '#3ec5ff', ult: ['uspin', 'utwist', 'tornado'] },
  { id: 'surge', name: 'Surge', c: '#e8b400', ult: ['udash', 'urush', 'uthunder'] },
  { id: 'body', name: 'Body', c: '#47b34a', ult: ['ucharge', 'ustomp', 'ushaker'] },
  { id: 'fortune', name: 'Fortune', c: '#b45cff', ult: null }
];
// Nodes: id, branch, row (0-3; row 4 = the branch's ultimate, ult = its step 0-2), name, max ranks, what one rank does, moves it unlocks (un), boosts per rank (mod).
// Boost keys: pd/kd punch/kick damage, kr kick reach, pm/km ultimate meter from punches/kicks, smax Surge bar,
// sreg Surge refill, scost Surge move cost, wind shorter Winded, arm damage taken, rise get-up speed, thr throw
// damage, sw Second Wind, xp XP, stars stars (all fractions except smax, which is points of Surge).
const SKN = [
  // Fists
  {
    id: 'f-hay',
    b: 'fists',
    row: 0,
    name: 'Haymaker',
    max: 1,
    txt: 'P, P, P on the ground: Haymaker',
    un: ['haymaker']
  },
  {
    id: 'f-dmg',
    b: 'fists',
    row: 0,
    name: 'Hard Knuckles',
    max: 3,
    txt: '+3% punch damage',
    mod: { pd: 0.03 }
  },
  {
    id: 'f-low',
    b: 'fists',
    row: 0,
    name: 'Low Hooks',
    max: 1,
    txt: 'Down + P, P: Double Low Hook',
    un: ['lowhook']
  },
  {
    id: 'f-knee',
    b: 'fists',
    row: 1,
    name: 'Knee and Elbow',
    max: 1,
    txt: 'P, K: Knee Strike and K, K, P: Elbow Smash',
    un: ['knee', 'elbow']
  },
  {
    id: 'f-air',
    b: 'fists',
    row: 1,
    name: 'Air Fists',
    max: 1,
    txt: 'In the air P, P, P: Air Flurry and Down + P: Spike Fist',
    un: ['aflurry', 'spike']
  },
  {
    id: 'f-meter',
    b: 'fists',
    row: 1,
    name: 'Fighting Spirit',
    max: 2,
    txt: 'Punches fill the ultimate meter 8% faster',
    mod: { pm: 0.08 }
  },
  {
    id: 'f-gp',
    b: 'fists',
    row: 2,
    name: 'Ground Pound',
    max: 1,
    txt: 'Down + P, P, P: Ground Pound',
    un: ['gpound']
  },
  {
    id: 'f-dmg2',
    b: 'fists',
    row: 2,
    name: 'Iron Fists',
    max: 3,
    txt: '+3% punch damage',
    mod: { pd: 0.03 }
  },
  {
    id: 'f-u1',
    b: 'fists',
    row: 4,
    ult: 0,
    name: 'Flurry',
    max: 1,
    txt: 'Ultimate: fast punches, the last one launches'
  },
  {
    id: 'f-u2',
    b: 'fists',
    row: 4,
    ult: 1,
    name: 'Hundred Fists',
    max: 1,
    txt: 'Ultimate: punches while walking forward, the last one launches'
  },
  {
    id: 'f-u3',
    b: 'fists',
    row: 4,
    ult: 2,
    name: 'Comet Fist',
    max: 1,
    txt: 'Ultimate: leap and crash down fist-first with a huge shockwave'
  },
  {
    id: 'f-cap',
    b: 'fists',
    row: 3,
    name: 'Fist Master',
    max: 1,
    txt: '+5% punch damage and punches fill the ultimate meter 10% faster',
    mod: { pd: 0.05, pm: 0.1 }
  },
  // Legs
  { id: 'l-palm', b: 'legs', row: 0, name: 'Palm Thrust', max: 1, txt: 'K, P: Palm Thrust', un: ['palmthr'] },
  {
    id: 'l-twin',
    b: 'legs',
    row: 0,
    name: 'Twin Kicks',
    max: 1,
    txt: 'Up + K, K: Twin Sky Kick and Down + K, K: Reverse Sweep',
    un: ['twinsky', 'rsweep']
  },
  { id: 'l-dmg', b: 'legs', row: 0, name: 'Strong Legs', max: 3, txt: '+3% kick damage', mod: { kd: 0.03 } },
  {
    id: 'l-sc',
    b: 'legs',
    row: 0,
    name: 'Scissor Kick',
    max: 1,
    txt: 'In the air K, K: Scissor Kick',
    un: ['scissor']
  },
  {
    id: 'l-spin',
    b: 'legs',
    row: 1,
    name: 'Spin Back-Kick',
    max: 1,
    txt: 'P, P, K: Spin Back-Kick',
    un: ['spinback']
  },
  {
    id: 'l-somer',
    b: 'legs',
    row: 1,
    name: 'Flips',
    max: 1,
    txt: 'Up + K, K, K: Somersault Kick and in the air Up + K: Rising Scissor',
    un: ['somer', 'rscissor']
  },
  {
    id: 'l-reach',
    b: 'legs',
    row: 1,
    name: 'Long Legs',
    max: 2,
    txt: 'Kicks reach 3% farther',
    mod: { kr: 0.03 }
  },
  { id: 'l-axe', b: 'legs', row: 2, name: 'Axe Kick', max: 1, txt: 'Down + K, K, K: Axe Kick', un: ['axe'] },
  { id: 'l-dmg2', b: 'legs', row: 2, name: 'Steel Shins', max: 3, txt: '+3% kick damage', mod: { kd: 0.03 } },
  {
    id: 'l-u1',
    b: 'legs',
    row: 4,
    ult: 0,
    name: 'Spin Kick',
    max: 1,
    txt: 'Ultimate: a low spinning kick that hits both sides'
  },
  {
    id: 'l-u2',
    b: 'legs',
    row: 4,
    ult: 1,
    name: 'Twisting Kick',
    max: 1,
    txt: 'Ultimate: a rising spin moving forward, the last spin launches'
  },
  {
    id: 'l-u3',
    b: 'legs',
    row: 4,
    ult: 2,
    name: 'Tornado Kick',
    max: 1,
    txt: 'Ultimate: a high spinning kick across the screen'
  },
  {
    id: 'l-cap',
    b: 'legs',
    row: 3,
    name: 'Kick Master',
    max: 1,
    txt: '+5% kick damage and kicks fill the ultimate meter 10% faster',
    mod: { kd: 0.05, km: 0.1 }
  },
  // Surge
  { id: 's-max', b: 'surge', row: 0, name: 'Deep Breath', max: 3, txt: '+6 Surge', mod: { smax: 6 } },
  {
    id: 's-low',
    b: 'surge',
    row: 0,
    name: 'Low Surge',
    max: 1,
    txt: 'Surge + Down + P: Quake Fist and Surge + Down + K: Phase Sweep',
    un: ['quake', 'psweep']
  },
  {
    id: 's-str',
    b: 'surge',
    row: 0,
    name: 'Surge Strings',
    max: 1,
    txt: 'Surge + P, P: Barrage and Surge + K, K: Whirlwind',
    un: ['barrage', 'whirl']
  },
  {
    id: 's-reg',
    b: 'surge',
    row: 1,
    name: 'Second Breath',
    max: 3,
    txt: 'Surge refills 6% faster',
    mod: { sreg: 0.06 }
  },
  {
    id: 's-rise',
    b: 'surge',
    row: 1,
    name: 'Rising Surge',
    max: 1,
    txt: 'Surge + Up + P: Phoenix Fist and Surge + Up + K: Sky Cutter',
    un: ['phoenix', 'skycut']
  },
  {
    id: 's-air',
    b: 'surge',
    row: 1,
    name: 'Air Surge',
    max: 1,
    txt: 'In the air Surge + P: Air Rave and Surge + K: Comet Kick',
    un: ['rave', 'comet']
  },
  {
    id: 's-cost',
    b: 'surge',
    row: 2,
    name: 'Efficient',
    max: 2,
    txt: 'Surge moves cost 5% less',
    mod: { scost: 0.05 }
  },
  {
    id: 's-big',
    b: 'surge',
    row: 2,
    name: 'Big Finishers',
    max: 1,
    txt: 'Surge + P, P, P: Shockwave Palm and Surge + K, K, K: Meteor Kick',
    un: ['palm', 'meteor']
  },
  {
    id: 's-u1',
    b: 'surge',
    row: 4,
    ult: 0,
    name: 'Surge Dash',
    max: 1,
    txt: 'Ultimate: a lightning dash through everyone'
  },
  {
    id: 's-u2',
    b: 'surge',
    row: 4,
    ult: 1,
    name: 'Lightning Rush',
    max: 1,
    txt: 'Ultimate: three lightning dashes back and forth'
  },
  {
    id: 's-u3',
    b: 'surge',
    row: 4,
    ult: 2,
    name: 'Thunder Step',
    max: 1,
    txt: 'Ultimate: five dashes, then a thunderclap that launches everyone near'
  },
  {
    id: 's-cap',
    b: 'surge',
    row: 3,
    name: 'Surge Master',
    max: 1,
    txt: 'Winded wears off 30% sooner and +6 Surge',
    mod: { wind: 0.3, smax: 6 }
  },
  // Body
  {
    id: 'b-tough',
    b: 'body',
    row: 0,
    name: 'Tough Skin',
    max: 3,
    txt: 'Take 3% less damage',
    mod: { arm: 0.03 }
  },
  {
    id: 'b-throw',
    b: 'body',
    row: 0,
    name: 'More Throws',
    max: 1,
    txt: 'Holding an enemy, Up + K: Up Throw and Down + K: Slam',
    un: ['tup', 'tslam']
  },
  {
    id: 'b-rise',
    b: 'body',
    row: 1,
    name: 'Quick Rise',
    max: 2,
    txt: 'Get back up 12% faster after a knockdown',
    mod: { rise: 0.12 }
  },
  {
    id: 'b-thr',
    b: 'body',
    row: 1,
    name: 'Strong Throws',
    max: 2,
    txt: 'Throws deal 8% more damage',
    mod: { thr: 0.08 }
  },
  {
    id: 'b-tough2',
    b: 'body',
    row: 2,
    name: 'Thick Skin',
    max: 3,
    txt: 'Take 3% less damage',
    mod: { arm: 0.03 }
  },
  {
    id: 'b-u1',
    b: 'body',
    row: 4,
    ult: 0,
    name: 'Shoulder Charge',
    max: 1,
    txt: 'Ultimate: an unstoppable charge that bowls everyone over'
  },
  {
    id: 'b-u2',
    b: 'body',
    row: 4,
    ult: 1,
    name: 'Quake Stomp',
    max: 1,
    txt: 'Ultimate: jump and stomp, knocking down everyone near'
  },
  {
    id: 'b-u3',
    b: 'body',
    row: 4,
    ult: 2,
    name: 'Earthshaker',
    max: 1,
    txt: 'Ultimate: three stomps, each shockwave bigger, the last launches'
  },
  {
    id: 'b-cap',
    b: 'body',
    row: 3,
    name: 'Second Wind',
    max: 1,
    txt: 'Once a fight, get back up with 30 health instead of being knocked out',
    mod: { sw: 1 }
  },
  // Fortune
  { id: 'o-xp', b: 'fortune', row: 0, name: 'Quick Learner', max: 3, txt: '+5% XP', mod: { xp: 0.05 } },
  {
    id: 'o-star',
    b: 'fortune',
    row: 0,
    name: 'Star Finder',
    max: 3,
    txt: '+5% ninja stars',
    mod: { stars: 0.05 }
  },
  { id: 'o-xp2', b: 'fortune', row: 1, name: 'Bookworm', max: 2, txt: '+5% XP', mod: { xp: 0.05 } },
  {
    id: 'o-star2',
    b: 'fortune',
    row: 2,
    name: 'Treasure Nose',
    max: 2,
    txt: '+5% ninja stars',
    mod: { stars: 0.05 }
  },
  {
    id: 'o-cap',
    b: 'fortune',
    row: 3,
    name: 'Lucky Streak',
    max: 1,
    txt: '+10% XP and +10% ninja stars',
    mod: { xp: 0.1, stars: 0.1 }
  }
];
const SKNODE = Object.fromEntries(SKN.map(n => [n.id, n]));
