// StickFighters: the difficulty choices for Story and Arcade (Versus and the house are always Normal).
//   hp     enemy health ×        dmg   damage to players ×       cd    time between enemy attacks ×
//   spd    enemy walking speed × tok   attackers at once per player (+/-, at least 1)
//   rv     frames standing by a knocked-out teammate to revive them    heal  health back after each fight
//   str    the most hits of one enemy combo string that can land on a player in a row (then the usual safe time)
//   strDmg and the most damage, as a share of the player's health, one string can do before it stops
// Normal is exactly the game as it was before there was a choice. Harder replays (+1) stack on top.
const DIFFS = [
  { id: 'easy', name: 'EASY', hp: 0.7, dmg: 0.6, cd: 1.4, spd: 0.85, tok: -1, rv: 60, heal: 45, str: 2, strDmg: 0.2 },
  { id: 'normal', name: 'NORMAL', hp: 1, dmg: 1, cd: 1, spd: 1, tok: 0, rv: 120, heal: 25, str: 3, strDmg: 0.3 },
  { id: 'hard', name: 'HARD', hp: 1.3, dmg: 1.3, cd: 0.8, spd: 1.1, tok: 1, rv: 160, heal: 15, str: 4, strDmg: 0.4 }
];
