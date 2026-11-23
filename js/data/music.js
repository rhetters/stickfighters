// StickFighters: the game's music, as data. Played by audio.js, which makes every sound itself (no recordings).
// A song:
//   bpm      beats per minute; beats = beats per bar (4, or 3 for a waltz); div = steps per beat (4, or 3 for a lilt)
//   prog     one chord per bar ('Dm', 'C', 'A7', 'Bbmaj7', 'Gsus4'); the song loops after the last
//   once     play it one time only (a jingle), then the song named by then (or silence)
//   parts    the instruments, each playing a pattern:
//     ins    bass, pluck, lead, flute, brass, organ, accordion, marimba, bell, arp, pad, drums
//     lvl    the least intensity it plays at: 0 = always (walking, menus), 1 = in a fight, 2 = a boss (default 0)
//     max    the most intensity it plays at (a part only for calm moments)
//     v      volume (default 1); o = octave for chord notes (default 3)
//     pat    bars of steps (a bar = beats x div steps, bars split by |, repeated to fill the song):
//            chord notes R 3 5 7 8 (octave) 9, c = the whole chord; drums k kick, s snare, h hat, o open hat,
//            c clap, B low bongo, b high bongo, t tom; . = rest, - = hold the note before
//     mel    a tune in note names (C5, F#4, Bb3), one bar per string, . rest, - hold
// Intensity: menus and walking are 0, a fight 1, a boss 2. A song plays only its parts for the intensity it's at.
const MUSIC = {
  // the title and menus: bright and friendly
  menu: {
    bpm: 118,
    prog: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
    parts: [
      { ins: 'bass', pat: 'R . . R . . 5 . R . . R . . 5 .' },
      { ins: 'pluck', o: 4, v: 0.7, pat: '. . c . . . c . . . c . . . c .' },
      { ins: 'drums', v: 0.8, pat: 'k . h . s . h . k . h k s . h .' },
      {
        ins: 'lead',
        v: 0.8,
        mel: [
          'E5 - G5 - C6 - - - B5 - G5 - D5 - - -',
          'D5 - G5 - B5 - - - A5 - G5 - D5 - - -',
          'C5 - E5 - A5 - - - G5 - E5 - C5 - - -',
          'A4 - C5 - F5 - - - E5 - D5 - C5 - - -',
          'E5 - G5 - C6 - - - D6 - C6 - G5 - - -',
          'D5 - G5 - B5 - - - C6 - B5 - G5 - - -',
          'A5 - - - G5 - - - F5 - E5 - D5 - C5 -',
          'D5 - - - - - . . G4 - A4 - B4 - D5 -'
        ]
      }
    ]
  },
  // Castle Siege: a minor-key march with brass and a snare
  castle: {
    bpm: 104,
    prog: ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'F', 'C', 'A'],
    parts: [
      { ins: 'bass', pat: 'R . . . 5 . . . R . . . 5 . R .' },
      { ins: 'brass', o: 4, v: 0.55, pat: 'c - . . . . c . c - . . . . . .' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . . . s . . . k . . . s . . s' },
      { ins: 'drums', lvl: 1, pat: 'k . s s k . s . k . s s k s s s' },
      {
        ins: 'lead',
        v: 0.75,
        mel: [
          'D5 - - - A4 - - - D5 - E5 - F5 - - -',
          'E5 - D5 - C5 - - - A4 - - - - - - -',
          'Bb4 - - - D5 - - - F5 - - - E5 - D5 -',
          'C5 - - - E5 - - - G5 - - - - - . .',
          'F5 - - - E5 - D5 - A5 - - - F5 - D5 -',
          'C5 - - - F5 - A5 - C6 - - - A5 - - -',
          'G5 - - - E5 - C5 - E5 - - - G5 - - -',
          'E5 - - - C#5 - - - A4 - - - - - - -'
        ]
      },
      { ins: 'organ', lvl: 1, o: 4, v: 0.35, pat: 'R 5 8 5 R 5 8 5 R 5 8 5 R 5 8 5' }
    ]
  },
  // Pirate Cove: a sea shanty with an accordion, rolling along in a lilt
  pirate: {
    bpm: 112,
    beats: 2,
    div: 6,
    prog: ['Am', 'Am', 'G', 'G', 'Am', 'C', 'E', 'Am'],
    parts: [
      { ins: 'bass', pat: 'R . . 5 . . R . . 5 . .' },
      { ins: 'accordion', o: 4, v: 0.5, pat: '. . c . . c . . c . . c' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . . h . . s . . h . .' },
      { ins: 'drums', lvl: 1, pat: 'k . h h . h s . h k . h' },
      {
        ins: 'flute',
        v: 0.8,
        mel: [
          'A4 - - A4 - B4 C5 - - D5 - -',
          'E5 - - - - - C5 - - A4 - -',
          'G4 - - G4 - A4 B4 - - C5 - -',
          'D5 - - - - - B4 - - G4 - -',
          'A4 - - C5 - - E5 - - A5 - -',
          'G5 - - E5 - - C5 - - E5 - -',
          'D5 - - B4 - - G#4 - - B4 - -',
          'A4 - - - - - - - - . . .'
        ]
      },
      { ins: 'pluck', lvl: 1, o: 4, v: 0.45, pat: 'R 3 5 8 5 3 R 3 5 8 5 3' }
    ]
  },
  // Mountain: an alpine waltz with a flute that leaps like a yodel
  mountain: {
    bpm: 132,
    beats: 3,
    prog: ['G', 'G', 'D', 'D', 'D7', 'D7', 'G', 'G'],
    parts: [
      { ins: 'bass', pat: 'R . . . . . . . 5 . . .' },
      { ins: 'pluck', o: 4, v: 0.55, pat: '. . . . c . . . c . . .' },
      { ins: 'drums', lvl: 1, v: 0.8, pat: 'k . . . h . . . h . . h' },
      {
        ins: 'flute',
        v: 0.8,
        mel: [
          'D5 - - - G5 - - - B5 - - -',
          'D6 - - - B5 - G5 - D5 - - -',
          'C5 - - - F#5 - - - A5 - - -',
          'D6 - - - A5 - F#5 - D5 - - -',
          'C6 - - - B5 - - - A5 - - -',
          'F#5 - - - A5 - - - C6 - - -',
          'B5 - - - D6 - - - B5 - G5 -',
          'G5 - - - - - - - . . . .'
        ]
      },
      { ins: 'accordion', lvl: 1, o: 4, v: 0.3, pat: 'R - - - 3 - - - 5 - - -' }
    ]
  },
  // Space: arpeggios, a slow pad and a bell tune, a little mysterious
  space: {
    bpm: 96,
    prog: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B'],
    parts: [
      { ins: 'pad', o: 3, v: 0.5, pat: 'c - - - - - - - - - - - - - - -' },
      { ins: 'bass', pat: 'R . . . . . R . . . R . . . . .' },
      { ins: 'arp', o: 4, v: 0.45, pat: 'R 3 5 8 5 3 R 3 5 8 9 8 5 3 5 8' },
      { ins: 'drums', lvl: 1, v: 0.8, pat: 'k . h . s . h h k . h . s . h .' },
      {
        ins: 'bell',
        v: 0.7,
        mel: [
          'B5 - - - . . G5 - - - E5 - - - . .',
          'E5 - - - G5 - - - C6 - - - . . . .',
          'D6 - - - . . B5 - - - G5 - - - . .',
          'F#5 - - - A5 - - - D6 - - - . . . .',
          'G5 - - - . . B5 - - - E6 - - - . .',
          'E6 - - - D6 - - - C6 - - - G5 - - -',
          'A5 - - - C6 - - - E6 - - - A5 - - -',
          'F#5 - - - - - - - D#5 - - - . . . .'
        ]
      }
    ]
  },
  // Volcano: tiki exotica with a marimba and bongos
  volcano: {
    bpm: 108,
    prog: ['Dm', 'Dm', 'Gm', 'A7', 'Dm', 'Bb', 'A7', 'Dm'],
    parts: [
      { ins: 'bass', pat: 'R . . 5 . . R . R . . 5 . . 8 .' },
      { ins: 'marimba', o: 4, v: 0.6, pat: 'R . 5 . 8 . 5 . 3 . 5 . 8 . 5 .' },
      { ins: 'drums', v: 0.8, pat: 'B . b b B . b . B . b b B b b .' },
      { ins: 'drums', lvl: 1, v: 0.7, pat: 'k . . . s . . k . k . . s . . .' },
      {
        ins: 'flute',
        v: 0.7,
        mel: [
          'A5 - - - F5 - D5 - - - E5 - F5 - - -',
          'E5 - D5 - C#5 - D5 - - - - - . . . .',
          'D5 - - - G5 - Bb5 - - - A5 - G5 - - -',
          'A5 - - - G5 - E5 - - - C#5 - - - . .',
          'D6 - - - A5 - F5 - - - A5 - D6 - - -',
          'F6 - - - D6 - Bb5 - - - D6 - F6 - - -',
          'E6 - - - C#6 - A5 - - - G5 - E5 - - -',
          'D5 - - - - - - - . . . . . . . .'
        ]
      }
    ]
  },
  // Every theme's boss: fast and driving, in a minor key
  boss: {
    bpm: 144,
    prog: ['Cm', 'Cm', 'Ab', 'Bb', 'Cm', 'Cm', 'G', 'G'],
    parts: [
      { ins: 'bass', v: 1.1, pat: 'R . R . R . R . R . R . 8 . 7 .' },
      { ins: 'brass', o: 4, v: 0.5, pat: 'c - . c - . c - . . c . c - - .' },
      { ins: 'drums', pat: 'k . h . s . h k k . h . s . s s' },
      {
        ins: 'lead',
        v: 0.75,
        mel: [
          'C5 - - - Eb5 - - - G5 - - - F5 - Eb5 -',
          'D5 - Eb5 - D5 - C5 - G4 - - - - - - -',
          'Ab4 - - - C5 - - - Eb5 - - - Ab5 - - -',
          'G5 - F5 - Eb5 - D5 - Bb4 - - - - - - -',
          'C6 - - - G5 - - - Eb5 - - - C5 - - -',
          'Eb5 - F5 - G5 - Ab5 - G5 - - - Eb5 - - -',
          'D5 - - - F5 - - - B5 - - - D6 - - -',
          'B5 - - - G5 - - - D5 - - - B4 - - -'
        ]
      },
      { ins: 'arp', lvl: 2, o: 5, v: 0.3, pat: 'R 5 8 5 R 5 8 5 R 5 8 5 R 5 8 5' }
    ]
  },
  // Arcade and Versus: punchy, in a minor key
  arcade: {
    bpm: 128,
    prog: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'],
    parts: [
      { ins: 'bass', pat: 'R . R . . R . R R . R . . R 5 .' },
      { ins: 'pluck', o: 4, v: 0.55, pat: '. . c . . c . . . . c . . c . .' },
      { ins: 'drums', pat: 'k . h . s . h k . k h . s . h .' },
      {
        ins: 'lead',
        v: 0.7,
        mel: [
          'A5 - - - E5 - A5 - C6 - - - B5 - A5 -',
          'A5 - - - F5 - - - C5 - - - F5 - - -',
          'G5 - - - E5 - C5 - E5 - G5 - C6 - - -',
          'B5 - - - G5 - - - D5 - - - G5 - - -',
          'A5 - - - E5 - A5 - C6 - - - D6 - E6 -',
          'F6 - - - C6 - - - A5 - - - F5 - - -',
          'G5 - - - B5 - D6 - G6 - - - F6 - D6 -',
          'E6 - - - - - - - G#5 - - - B5 - - -'
        ]
      }
    ]
  },
  // The Training Room and the house: easy-going
  training: {
    bpm: 92,
    prog: ['Fmaj7', 'Dm7', 'Bbmaj7', 'C7'],
    parts: [
      { ins: 'bass', pat: 'R . . . . . 5 . R . . . 8 . 5 .' },
      { ins: 'pluck', o: 4, v: 0.5, pat: '. . c . . . c - . . c . . . c .' },
      { ins: 'drums', v: 0.5, pat: 'k . . h s . . h k . k h s . . h' },
      {
        ins: 'bell',
        v: 0.45,
        mel: [
          'A5 - - - C6 - - - E6 - - - . . . .',
          'F5 - - - A5 - - - C6 - - - . . . .',
          'D6 - - - A5 - - - F5 - - - . . . .',
          'E5 - - - G5 - - - Bb5 - - - . . . .'
        ]
      }
    ]
  },
  // The victory screen: a fanfare, then the menu tune
  victory: {
    bpm: 132,
    once: 1,
    then: 'menu',
    prog: ['C', 'F', 'G', 'C'],
    parts: [
      { ins: 'brass', o: 4, v: 0.55, pat: 'c . c . c - - - . . . . . . . .' },
      { ins: 'drums', pat: 'k . s . k . s . k k s s k s s s' },
      {
        ins: 'lead',
        mel: [
          'C5 . C5 . C5 - - - G4 - - - C5 - E5 -',
          'F5 - - - A5 - - - C6 - - - A5 - F5 -',
          'G5 - - - B5 - - - D6 - - - B5 - G5 -',
          'C6 - - - - - - - - - - - . . . .'
        ]
      },
      { ins: 'bass', pat: 'R . . . 5 . . . R . . . 5 . . .' }
    ]
  },
  // Game over: a short sad tune, then quiet
  over: {
    bpm: 84,
    once: 1,
    prog: ['Am', 'F', 'Dm', 'E'],
    parts: [
      { ins: 'pad', o: 3, v: 0.5, pat: 'c - - - - - - - - - - - - - - -' },
      {
        ins: 'flute',
        v: 0.8,
        mel: [
          'E5 - - - C5 - - - A4 - - - . . . .',
          'F4 - - - A4 - - - C5 - - - . . . .',
          'D5 - - - C5 - - - A4 - - - F4 - - -',
          'E4 - - - - - - - - - - - . . . .'
        ]
      }
    ]
  }
};
