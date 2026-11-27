// StickFighters: the game's music, as data. Played by audio.js, which makes every sound itself (no recordings).
// A song:
//   bpm      beats per minute; beats = beats per bar (4, or 3 for a waltz); div = steps per beat (4, or 3 for a lilt)
//   prog     one chord per bar ('Dm', 'C', 'A7', 'Bbmaj7', 'Gsus4'); the song loops after the last
//   once     play it one time only (a jingle), then the song named by then (or silence)
//   sting    a short tune between two songs (audio.js musTrans picks which); the next song follows straight on
//   end      stop a jingle after this many steps (so the next song comes in as its last note rings)
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
// A story plays the song named after the biome you're in (data/themes.js), so every place has its own; its bosses
// play 'boss-<theme>' if there is one, or else 'boss'.
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
  // Castle Keep: a minor-key march with brass and a snare
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
  // Pirate Ship: a sea shanty with an accordion, rolling along in a lilt
  ship: {
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
  // Alpine Meadow: a waltz with a flute that leaps like a yodel
  meadow: {
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
  // The Moon: arpeggios, a slow pad and a bell tune, a little mysterious
  moon: {
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
  // Tiki Jungle: tiki exotica with a marimba and bongos
  jungle: {
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
  // Wooded Trail: a bright, folksy walk in the woods
  woods: {
    bpm: 112,
    prog: ['G', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'],
    parts: [
      { ins: 'bass', pat: 'R . . . 5 . . . R . . . 5 . R .' },
      { ins: 'pluck', o: 4, v: 0.6, pat: '. . c . . . c . . . c . . . c .' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . . . s . . . k . . . s . . .' },
      { ins: 'drums', lvl: 1, pat: 'k . h . s . h . k k h . s . h h' },
      {
        ins: 'flute',
        v: 0.75,
        mel: [
          'D5 - G5 - B5 - A5 - G5 - - - D5 - - -',
          'E5 - G5 - C6 - B5 - A5 - - - G5 - - -',
          'B4 - D5 - G5 - - - A5 - B5 - G5 - - -',
          'F#5 - - - E5 - D5 - A4 - - - - - - -',
          'G5 - - - E5 - G5 - B5 - - - A5 - G5 -',
          'E5 - - - C5 - E5 - G5 - - - - - . .',
          'F#5 - A5 - D6 - - - C6 - B5 - A5 - - -',
          'G5 - - - - - - - D5 - - - . . . .'
        ]
      },
      { ins: 'pluck', lvl: 1, o: 5, v: 0.3, pat: 'R . 5 . 8 . 5 . R . 5 . 8 . 5 .' }
    ]
  },
  // Sewer Tunnels: sneaky and drippy, tiptoeing through the dark
  sewer: {
    bpm: 100,
    prog: ['Am', 'Am', 'F', 'E', 'Am', 'Am', 'Dm', 'E'],
    parts: [
      { ins: 'bass', pat: 'R . . R . . 5 . R . . 8 . . 5 .' },
      { ins: 'marimba', o: 5, v: 0.4, pat: '. . . . R . . . . . . . . 5 . .' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . . h . . . h k . . h . . . h' },
      { ins: 'drums', lvl: 1, pat: 'k . h h s . h . k k h h s . h s' },
      {
        ins: 'pluck',
        o: 4,
        v: 1.1,
        mel: [
          'A4 . C5 . E5 . C5 . A4 . . . G#4 . A4 .',
          'B4 . C5 . D5 . E5 . C5 . . . A4 . . .',
          'F4 . A4 . C5 . A4 . F5 . E5 . D5 . C5 .',
          'B4 . . . G#4 . . . E4 . . . . . . .',
          'A4 . C5 . E5 . A5 . G#5 . A5 . E5 . . .',
          'C5 . D5 . E5 . C5 . A4 . . . E4 . . .',
          'D5 . F5 . A5 . F5 . D5 . . . C5 . B4 .',
          'G#4 . B4 . E5 . . . E4 - - - . . . .'
        ]
      },
      { ins: 'organ', lvl: 1, o: 3, v: 0.3, pat: 'c - - - - - - - . . . . . . . .' }
    ]
  },
  // Sunny Beach: a calypso with bongos and a bell like a steel drum
  beach: {
    bpm: 116,
    prog: ['C', 'F', 'G', 'C', 'C', 'F', 'G7', 'C'],
    parts: [
      { ins: 'bass', pat: 'R . . 5 . . R . R . . 5 . . 8 .' },
      { ins: 'marimba', o: 4, v: 0.45, pat: '. R 3 . 5 . 3 R . R 3 . 5 . 3 .' },
      { ins: 'drums', v: 0.8, pat: 'B . b . B . b b B . b . B . b .' },
      { ins: 'drums', lvl: 1, v: 0.8, pat: 'k . h . s . h k . k h . s . h .' },
      {
        ins: 'bell',
        v: 0.75,
        mel: [
          'E5 - G5 - E5 - C5 - D5 - E5 - G5 - - -',
          'A5 - - - F5 - A5 - C6 - - - A5 - - -',
          'G5 - B5 - D6 - B5 - G5 - F5 - D5 - - -',
          'E5 - - - C5 - - - G4 - - - . . . .',
          'C6 - B5 - A5 - G5 - E5 - G5 - C6 - - -',
          'A5 - G5 - F5 - - - A5 - - - C6 - - -',
          'B5 - - - D6 - - - F6 - - - D6 - - -',
          'C6 - - - - - - - . . . . . . . .'
        ]
      }
    ]
  },
  // Treasure Cave: echoing and mysterious, drips in the dark
  cave: {
    bpm: 86,
    prog: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'F', 'C', 'A'],
    parts: [
      { ins: 'pad', o: 3, v: 0.5, pat: 'c - - - - - - - - - - - - - - -' },
      { ins: 'bass', pat: 'R . . . . . . . 5 . . . . . . .' },
      { ins: 'marimba', o: 5, v: 0.35, pat: '. . . . . . . . . . R . . . . .' },
      { ins: 'drums', lvl: 1, v: 0.9, pat: 'k . . . . . t . k . . . . . t t' },
      {
        ins: 'bell',
        v: 0.7,
        mel: [
          'A5 - - - . . F5 - - - D5 - - - . .',
          'D6 - - - . . Bb5 - - - F5 - - - . .',
          'G5 - - - Bb5 - - - D6 - - - . . . .',
          'C#6 - - - - - - - A5 - - - . . . .',
          'F5 - - - A5 - - - D6 - - - F6 - - -',
          'E6 - - - C6 - - - A5 - - - F5 - - -',
          'G5 - - - E5 - - - C5 - - - E5 - - -',
          'E5 - - - C#5 - - - A4 - - - . . . .'
        ]
      }
    ]
  },
  // Mountainside: a determined climb, arpeggios marching uphill
  slope: {
    bpm: 122,
    prog: ['Em', 'C', 'D', 'B7', 'Em', 'C', 'Am', 'B'],
    parts: [
      { ins: 'bass', pat: 'R . R . 5 . R . R . R . 5 . 8 .' },
      { ins: 'arp', o: 4, v: 0.4, pat: 'R 3 5 8 R 3 5 8 R 3 5 8 R 3 5 8' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . . . s . . . k . . . s . . .' },
      { ins: 'drums', lvl: 1, pat: 'k . h k s . h . k . h k s . s s' },
      { ins: 'brass', lvl: 1, o: 4, v: 0.4, pat: 'c - . . . . . . c - . . c - . .' },
      {
        ins: 'lead',
        v: 0.7,
        mel: [
          'E5 - - - G5 - - - B5 - - - A5 - G5 -',
          'E5 - - - - - - - C5 - E5 - G5 - - -',
          'F#5 - - - A5 - - - D6 - - - C6 - B5 -',
          'A5 - - - F#5 - - - D#5 - - - - - - -',
          'G5 - - - B5 - - - E6 - - - D6 - B5 -',
          'C6 - - - G5 - - - E5 - - - G5 - - -',
          'A5 - - - C6 - - - E6 - - - C6 - A5 -',
          'B5 - - - - - - - D#5 - F#5 - B5 - - -'
        ]
      }
    ]
  },
  // Snowy Peak: icy and sparkling, high up in the cold
  peak: {
    bpm: 100,
    prog: ['F#m', 'D', 'A', 'E', 'F#m', 'D', 'E', 'E'],
    parts: [
      { ins: 'pad', o: 3, v: 0.45, pat: 'c - - - - - - - - - - - - - - -' },
      { ins: 'arp', o: 5, v: 0.3, pat: '8 . 5 . 3 . R . 8 . 5 . 3 . 5 .' },
      { ins: 'bass', pat: 'R . . . . . . . R . . . 5 . . .' },
      { ins: 'drums', lvl: 1, v: 0.9, pat: 'k . . h s . . h k . k h s . . h' },
      {
        ins: 'flute',
        v: 0.7,
        mel: [
          'C#6 - - - A5 - - - F#5 - - - A5 - - -',
          'D6 - - - F#6 - - - A5 - - - - - - -',
          'E6 - - - C#6 - - - A5 - - - C#6 - E6 -',
          'G#5 - - - B5 - - - E6 - - - - - . .',
          'A5 - - - F#5 - - - C#6 - - - A5 - - -',
          'F#6 - - - E6 - - - D6 - - - A5 - - -',
          'B5 - - - G#5 - - - E5 - - - G#5 - - -',
          'B5 - - - - - - - . . . . . . . .'
        ]
      }
    ]
  },
  // Launch Base: a funky countdown, busy and bouncy
  base: {
    bpm: 116,
    prog: ['Dm7', 'G7', 'Dm7', 'G7', 'Bbmaj7', 'C7', 'Dm7', 'A7'],
    parts: [
      { ins: 'bass', pat: 'R . R 8 . R . 5 R . R 8 . 7 5 .' },
      { ins: 'organ', o: 4, v: 0.4, pat: '. . c . . . c . . . c . . c . .' },
      { ins: 'drums', pat: 'k . h . s . h k . k h . s . h o' },
      { ins: 'arp', lvl: 1, o: 5, v: 0.3, pat: 'R 5 8 5 R 5 8 5 R 5 8 5 R 5 8 5' },
      {
        ins: 'lead',
        v: 0.6,
        mel: [
          'D5 - F5 - A5 - - - C6 - A5 - . . . .',
          'B5 - - - A5 - G5 - F5 - - - . . . .',
          'D5 - F5 - A5 - C6 - D6 - - - C6 - A5 -',
          'G5 - - - - - - - . . . . F5 - G5 -',
          'A5 - - - F5 - D5 - A5 - - - . . . .',
          'G5 - - - E5 - C5 - Bb5 - - - . . . .',
          'A5 - C6 - D6 - - - C6 - A5 - F5 - - -',
          'E5 - - - C#5 - - - A4 - - - . . . .'
        ]
      }
    ]
  },
  // The Rocket: fast and urgent, racing through space
  rocket: {
    bpm: 136,
    prog: ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B'],
    parts: [
      { ins: 'bass', pat: 'R . R . R . R . R . R . 8 . 5 .' },
      { ins: 'arp', o: 4, v: 0.35, pat: 'R 3 5 3 R 3 5 3 R 3 5 3 R 3 5 3' },
      { ins: 'drums', pat: 'k . h . s . h . k . h k s . h h' },
      { ins: 'brass', lvl: 1, o: 4, v: 0.4, pat: 'c - . . . . . . . . c - . . . .' },
      {
        ins: 'lead',
        v: 0.65,
        mel: [
          'B5 - - - G5 - - - E5 - G5 - B5 - E6 -',
          'D6 - - - B5 - - - G5 - - - - - . .',
          'C6 - - - G5 - - - E5 - G5 - C6 - E6 -',
          'D6 - - - A5 - - - F#5 - - - D6 - - -',
          'E6 - - - D6 - B5 - G5 - - - B5 - - -',
          'E6 - D6 - B5 - G5 - E5 - - - . . . .',
          'G5 - - - C6 - - - E6 - - - G6 - - -',
          'F#6 - - - D#6 - - - B5 - - - . . . .'
        ]
      }
    ]
  },
  // Ashy Slopes: dark and heavy, the mountain rumbling
  ashslope: {
    bpm: 104,
    prog: ['Cm', 'Cm', 'Fm', 'G', 'Cm', 'Ab', 'Fm', 'G'],
    parts: [
      { ins: 'organ', o: 3, v: 0.45, pat: 'c - - - - - - - c - - - - - - -' },
      { ins: 'bass', pat: 'R . . . . . R . R . . . 5 . . .' },
      { ins: 'drums', max: 0, v: 0.8, pat: 't . . . . . . . t . . . . . t .' },
      { ins: 'drums', lvl: 1, pat: 'k . . h s . . h k . k h s . t t' },
      {
        ins: 'lead',
        v: 0.6,
        mel: [
          'G4 - - - C5 - - - Eb5 - - - D5 - C5 -',
          'Bb4 - - - G4 - - - - - - - . . . .',
          'Ab4 - - - C5 - - - F5 - - - Eb5 - C5 -',
          'D5 - - - B4 - - - G4 - - - . . . .',
          'C5 - - - Eb5 - - - G5 - - - F5 - Eb5 -',
          'Eb5 - - - C5 - - - Ab4 - - - C5 - - -',
          'F5 - - - Ab5 - - - C6 - - - Ab5 - F5 -',
          'G5 - - - - - - - B4 - - - D5 - - -'
        ]
      }
    ]
  },
  // The Crater: hot and intense, brass and drums over bubbling lava
  crater: {
    bpm: 126,
    prog: ['Fm', 'Fm', 'Db', 'C', 'Fm', 'Fm', 'Bbm', 'C'],
    parts: [
      { ins: 'bass', pat: 'R . R . . R . R R . R . . 5 . 8' },
      { ins: 'brass', o: 4, v: 0.45, pat: 'c - . . c . . . c - . . . . c .' },
      { ins: 'drums', pat: 'k . h . s . h k k . h . s . t t' },
      { ins: 'marimba', lvl: 1, o: 5, v: 0.3, pat: 'R . 5 . 8 . 5 . R . 5 . 8 . 5 .' },
      {
        ins: 'lead',
        v: 0.6,
        mel: [
          'F5 - - - Ab5 - - - C6 - - - Bb5 - Ab5 -',
          'G5 - Ab5 - G5 - F5 - C5 - - - - - - -',
          'Db5 - - - F5 - - - Ab5 - - - Db6 - - -',
          'C6 - Bb5 - Ab5 - G5 - E5 - - - . . . .',
          'F6 - - - C6 - - - Ab5 - - - F5 - - -',
          'Ab5 - Bb5 - C6 - Db6 - C6 - - - Ab5 - - -',
          'Bb5 - - - Db6 - - - F6 - - - Db6 - Bb5 -',
          'C6 - - - G5 - - - E5 - - - C5 - - -'
        ]
      }
    ]
  },
  // The City's songs are quirky and jazzy (Rhett asked for something like a cheerful 90s adventure game's hometown):
  // seventh chords, a bouncing bass, marimba, bells and a little organ.
  // Suburban Street: a lazy shuffle down the sidewalk on a sunny Saturday, ending each time on a wistful minor chord
  burbs: {
    bpm: 108,
    div: 3,
    prog: ['Cmaj7', 'A7', 'Dm7', 'G7', 'Cmaj7', 'C7', 'Fmaj7', 'Fm'],
    parts: [
      { ins: 'bass', pat: 'R . . 3 . . 5 . . 8 . .|8 . . 5 . . 3 . . 5 . .' },
      { ins: 'organ', o: 4, v: 0.3, pat: '. . c . . c . . c . . c' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . h s . h k . h s . h' },
      { ins: 'drums', lvl: 1, pat: 'k . h s . h k k h s . o' },
      { ins: 'bell', o: 5, v: 0.25, pat: '9 . . . . . . . . 5 . .' },
      { ins: 'brass', lvl: 1, o: 4, v: 0.35, pat: 'c . . . . c . . . . . .' },
      {
        ins: 'marimba',
        v: 0.8,
        mel: [
          'E5 - G5 B5 - G5 E5 - D5 C5 - -',
          'C#5 - E5 G5 - E5 A5 - - . . .',
          'F5 - A5 C6 - A5 F5 - E5 D5 - -',
          'B4 - D5 F5 - E5 D5 - B4 G4 - -',
          'G5 - - E5 - G5 C6 - B5 G5 - E5',
          'Bb5 - - G5 - E5 C5 - - . . .',
          'A5 - C6 E6 - C6 A5 - G5 F5 - -',
          'Ab5 - - G5 - - F5 - Eb5 D5 - -'
        ]
      }
    ]
  },
  // Downtown: a bouncy, ragtime-flavoured groove with a bubbling synth and a cheeky chromatic tune
  city: {
    bpm: 138,
    prog: ['C', 'E7', 'Fmaj7', 'Fm', 'C', 'A7', 'D7', 'G7'],
    parts: [
      { ins: 'bass', pat: 'R . . R 5 . R . R . . R 5 . 3 .' },
      { ins: 'arp', o: 5, v: 0.22, pat: 'R 5 8 5 R 5 8 5 3 5 8 5 3 5 8 5' },
      { ins: 'drums', max: 0, v: 0.7, pat: 'k . h . s . h k . k h . s . h .' },
      { ins: 'drums', lvl: 1, pat: 'k . h k s . h k k . h k s k s s' },
      { ins: 'bell', o: 5, v: 0.25, pat: '. . . . 8 . . . . . . . 9 . . .' },
      { ins: 'brass', lvl: 1, o: 4, v: 0.4, pat: '. . . . c . . c . . . . c - . .' },
      {
        ins: 'lead',
        v: 0.6,
        mel: [
          'G5 . G5 . E5 - C5 . D#5 E5 - - G5 - . .',
          'G#5 . G#5 . E5 - B4 . D5 - - - E5 - . .',
          'A5 . A5 . F5 - C5 . E5 - - - F5 - A5 -',
          'Ab5 - - - G5 - F5 - Eb5 - D5 - C5 - - -',
          'E5 - G5 - C6 - G5 - E5 . D#5 . E5 - - -',
          'C#6 - - - A5 - E5 - G5 - - - A5 - . .',
          'F#5 . A5 . C6 . A5 . F#5 . D5 . C5 . A4 .',
          'B4 - D5 - F5 - G5 - B5 - - - . . . .'
        ]
      }
    ]
  },
  // The Skyscraper: a curious music-box tune that keeps climbing, over a ticking arpeggio
  tower: {
    bpm: 120,
    prog: ['Am', 'Fmaj7', 'Dm7', 'E7', 'Am', 'Cmaj7', 'Dm7', 'E7'],
    parts: [
      { ins: 'bass', pat: 'R . . . R . 5 . R . . . 5 . 8 .' },
      { ins: 'arp', o: 4, v: 0.28, pat: 'R 3 5 8 9 8 5 3 R 3 5 8 9 8 5 3' },
      { ins: 'pad', o: 3, v: 0.22, max: 0, pat: 'c - - - - - - - c - - - - - - -' },
      { ins: 'drums', max: 0, v: 0.6, pat: 'k . . . . . h . k . . . s . h .' },
      { ins: 'drums', lvl: 1, pat: 'k . h . s . h k k . h . s . t t' },
      { ins: 'brass', lvl: 1, o: 4, v: 0.35, pat: 'c - . . . . . . c . c . . . . .' },
      {
        ins: 'bell',
        v: 0.75,
        mel: [
          'A4 - C5 - E5 - A5 - G#5 - A5 - E5 - - -',
          'F5 - A5 - C6 - E6 - - - C6 - A5 - - -',
          'D5 - F5 - A5 - C6 - B5 - A5 - F5 - - -',
          'E5 - G#5 - B5 - D6 - - - . . . . . .',
          'A5 - B5 - C6 - E6 - D6 - C6 - B5 - A5 -',
          'G5 - - - B5 - - - E6 - - - D6 - C6 -',
          'F6 - E6 - D6 - C6 - A5 - - - F5 - - -',
          'G#5 - - - B5 - - - E6 - - - - - . .'
        ]
      }
    ]
  },
  // Pink Kong on the roof: a funky, fast boss fight with organ stabs (the City's own boss song)
  'boss-city': {
    bpm: 150,
    prog: ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'Am7', 'B7'],
    parts: [
      { ins: 'bass', v: 1.1, pat: 'R . R 8 R . 7 . R . R 8 R . 5 .' },
      { ins: 'organ', o: 4, v: 0.3, pat: '. c . c . c . c . c . c . c . c' },
      { ins: 'drums', pat: 'k . h k s . h k k . h k s . s s' },
      { ins: 'brass', o: 4, v: 0.45, pat: 'c - . c - . . . c . . c - - . .' },
      {
        ins: 'lead',
        v: 0.6,
        mel: [
          'E5 . E5 . G5 . E5 . B5 - - - A5 G5 E5 .',
          'D5 . E5 . G5 . A5 . B5 - - - . . . .',
          'C6 - - - B5 - G5 - E5 - G5 - C6 - . .',
          'D6 - - - C6 - A5 - F#5 - A5 - D6 - . .',
          'E6 . D6 . B5 . G5 . A5 - B5 - E5 - - -',
          'G5 . F#5 . E5 . D5 . E5 - - - . . . .',
          'A5 - C6 - E6 - G6 - E6 - C6 - A5 - - -',
          'D#6 - - - F#6 - - - B5 - - - . . . .'
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
  // The Character screen (and Skills): laid-back and stylish, for taking your time over a look
  dressup: {
    bpm: 96,
    prog: ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Em7', 'A7', 'Dm7', 'G7'],
    parts: [
      { ins: 'bass', pat: 'R . . . . . 5 . R . . . 8 . 5 .' },
      { ins: 'pluck', o: 4, v: 0.45, pat: '. . c . . c . . . . c . . . c .' },
      { ins: 'drums', v: 0.45, pat: 'k . h . s . h h k . h . s . h .' },
      { ins: 'pad', o: 3, v: 0.3, pat: 'c - - - - - - - - - - - - - - -' },
      {
        ins: 'flute',
        v: 0.75,
        mel: [
          'E5 - - - G5 - B5 - - - A5 - G5 - - -',
          'C5 - - - E5 - G5 - - - - - . . . .',
          'F5 - - - A5 - C6 - - - B5 - A5 - - -',
          'G5 - - - - - - - F5 - E5 - D5 - . .',
          'G5 - - - B5 - D6 - - - C6 - B5 - - -',
          'C#6 - - - A5 - - - E5 - - - G5 - - -',
          'F5 - A5 - C6 - A5 - F5 - D5 - E5 - F5 -',
          'D5 - - - - - - - . . . . G4 - B4 -'
        ]
      }
    ]
  },
  // The house builder (and walking around your house): bouncy and catchy, marimba and bells over a jazzy
  // turnaround, to hum along to while you build
  house: {
    bpm: 112,
    prog: ['Fmaj7', 'Dm7', 'Gm7', 'C7', 'Am7', 'D7', 'Gm7', 'C7'],
    parts: [
      { ins: 'bass', pat: 'R . . . 5 . . . 3 . . . 5 . 7 .' },
      { ins: 'pluck', o: 4, v: 0.4, pat: '. . c . . c . . . . c . . c . .' },
      { ins: 'drums', v: 0.5, pat: 'k . h b . h k h . b h . k h b h' },
      {
        ins: 'marimba',
        v: 0.9,
        mel: [
          'C6 . A5 . . F5 . G5 A5 - - - . . . .',
          'C6 . A5 . . D5 . E5 F5 - - - . . . .',
          'Bb5 . G5 . . D5 . E5 F5 - G5 - A5 - Bb5 -',
          'C6 - - - Bb5 - A5 - G5 - - - . . . .',
          'E6 . C6 . . A5 . B5 C6 - - - . . . .',
          'D6 . A5 . . F#5 . G5 A5 - - - C6 - . .',
          'Bb5 - A5 - G5 - F5 - E5 - D5 - . . . .',
          'E5 - G5 - Bb5 - D6 - C6 - - - . . . .'
        ]
      },
      { ins: 'bell', o: 5, v: 0.35, pat: '. . . . . . . . . . . . . . 8 .|. . . . . . . . . . . . 5 . 8 .' }
    ]
  },
  // ===== STINGS: short tunes between two songs =====
  // Into a game (the story tile bursting open): a little pick-up, then a bright chord
  'go': {
    bpm: 150,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['G', 'C'],
    parts: [
      { ins: 'lead', v: 0.9, mel: ['G4 . . G4 C5 . . E5 . . G5 . . . . .', 'C6 - - - - - - - . . . . . . . .'] },
      { ins: 'pluck', o: 4, v: 0.6, pat: 'c . . c c . . c . . c . . . . .|. . . . . . . . . . . . . . . .' },
      { ins: 'brass', o: 4, v: 0.55, pat: '. . . . . . . . . . . . . . . .|c - - - - - - - . . . . . . . .' },
      { ins: 'bass', pat: 'R . . R . . . R . . R . . . . .|R - - - - - - - . . . . . . . .' },
      { ins: 'drums', v: 0.8, pat: '. . . . . . . . . . . . t . t t|k . . . . . . . . . . . . . . .' }
    ]
  },
  // ===== TRANSITION JINGLES: each scene that takes you to the next place has its own little tune =====
  // The catapult: wind up... and fling!
  'tr-catapult': {
    bpm: 140,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['C', 'C'],
    parts: [
      { ins: 'lead', v: 0.85, mel: ['G4 . G4 . C5 - E5 - G5 - - - C6 - - -', 'B5 . C6 - - - . . . . . . . . . .'] },
      { ins: 'bass', pat: 'R . . . R . . . R . . . R . . .|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', v: 0.8, pat: 'k . . . k . . . k . k . k k k k|k . . . . . . . . . . . . . . .' }
    ]
  },
  // The cannon: BOOM, and over the waves
  'tr-cannon': {
    bpm: 132,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['F', 'C'],
    parts: [
      { ins: 'brass', v: 0.75, mel: ['. . . . F4 . A4 . C5 . F5 - - - E5 .', 'D5 . E5 . C5 - - - . . . . . . . .'] },
      { ins: 'bass', pat: 'R - - - . . . . R . . . R . . .|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', pat: 'k . . . t . . . . . . . . . . .|k . . . . . . . . . . . . . . .' }
    ]
  },
  // The pipe: sliding down and down, then plop
  'tr-pipe': {
    bpm: 150,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['C', 'C'],
    parts: [
      { ins: 'arp', v: 1.8, mel: ['C6 . B5 . Bb5 . A5 . Ab5 . G5 . F#5 . F5 .', 'C5 - - - . . . . . . . . . . . .'] },
      { ins: 'bass', pat: '. . . . . . . . . . . . . . . .|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', pat: '. . . . . . . . . . . . . . . .|B . . . . . . . . . . . . . . .' }
    ]
  },
  // The rope: a swing across the chasm, in three
  'tr-rope': {
    bpm: 120,
    beats: 3,
    once: 1,
    sting: 1,
    end: 20,
    prog: ['C', 'G'],
    parts: [
      { ins: 'flute', mel: ['E5 - - G5 - - C6 - - - - -', 'B5 - D6 - G5 - - - - - . .'] },
      { ins: 'bass', pat: 'R . . 5 . . R . . 5 . .|R - - - . . . . . . . .' },
      { ins: 'drums', v: 0.6, pat: 'k . . h . . k . . h . .|k . . . . . . . . . . .' }
    ]
  },
  // Through a smashed gate: bom, bom, bom, ta-da
  'tr-gate': {
    bpm: 132,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['C', 'C'],
    parts: [
      { ins: 'brass', v: 0.8, mel: ['C5 . C5 . C5 . . . Eb5 - - - F5 - - -', 'G5 - - - - - - - . . . . . . . .'] },
      { ins: 'bass', pat: 'R . R . R . . . . . . . . . . .|R - - - - - - - . . . . . . . .' },
      { ins: 'drums', v: 0.8, pat: 'k . k . k . . . t . . . t . . .|k . . . . . . . . . . . . . . .' }
    ]
  },
  // The balloon: floating up, up and away
  'tr-balloon': {
    bpm: 104,
    once: 1,
    sting: 1,
    end: 24,
    prog: ['C', 'F'],
    parts: [
      { ins: 'bell', v: 1.1, mel: ['C5 - E5 - G5 - - - A5 - G5 - E5 - - -', 'F5 - A5 - C6 - - - . . . . . . . .'] },
      { ins: 'pad', o: 3, v: 0.3, pat: 'c - - - - - - - - - - - - - - -|c - - - - - - - . . . . . . . .' }
    ]
  },
  // The gondola: an oom-pah ride up the cable
  'tr-gondola': {
    bpm: 120,
    once: 1,
    sting: 1,
    end: 28,
    prog: ['C', 'C'],
    parts: [
      { ins: 'accordion', v: 1, mel: ['G4 . C5 . E5 - - - G4 . C5 . E5 - - -', 'F5 . E5 . D5 . C5 - - - . . . . . .'] },
      { ins: 'bass', pat: 'R . 5 . R . 5 . R . 5 . R . 5 .|R - - - . . . . . . . . . . . .' }
    ]
  },
  // The cliff: one hand over the other, to the top
  'tr-climb': {
    bpm: 126,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['C', 'C'],
    parts: [
      { ins: 'marimba', mel: ['C5 . D5 . . . E5 . F5 . . . G5 . A5 .', 'B5 . C6 - - - . . . . . . . . . .'] },
      { ins: 'bass', pat: 'R . . . R . . . R . . . R . . .|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', v: 0.7, pat: 'k . . . k . . . k . . . k . . .|k . . . . . . . . . . . . . . .' }
    ]
  },
  // The launch: beep, beep, beep... blast off!
  'tr-launch': {
    bpm: 120,
    once: 1,
    sting: 1,
    end: 28,
    prog: ['C', 'C'],
    parts: [
      { ins: 'lead', v: 0.85, mel: ['C6 . . . C6 . . . C6 . . . G6 - - -', 'C5 . E5 . G5 . C6 - - - . . . . . .'] },
      { ins: 'bass', pat: '. . . . . . . . . . . . . . . .|R . R . R . R - - - . . . . . .' },
      { ins: 'drums', v: 0.8, pat: '. . . . . . . . . . . . . . . .|k . k . k . k . . . . . . . . .' }
    ]
  },
  // The landing: touching down softly on the moon
  'tr-landing': {
    bpm: 96,
    once: 1,
    sting: 1,
    end: 22,
    prog: ['Am', 'C'],
    parts: [
      { ins: 'bell', v: 1.1, mel: ['E5 - - - C5 - - - A4 - - - B4 - C5 -', 'E5 - - - - - - - . . . . . . . .'] },
      { ins: 'pad', o: 3, v: 0.3, pat: 'c - - - - - - - - - - - - - - -|c - - - - - - - . . . . . . . .' }
    ]
  },
  // The geyser: whoosh, up on the steam
  'tr-geyser': {
    bpm: 144,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['C', 'C'],
    parts: [
      { ins: 'marimba', mel: ['C5 C5 . . E5 . . G5 . . C6 . . . . .', 'B5 . C6 . E6 - - - . . . . . . . .'] },
      { ins: 'bass', pat: 'R . . . . . . R . . R . . . . .|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', pat: 'B . b . B . b b B . b . B b b b|B . . . . . . . . . . . . . . .' }
    ]
  },
  // The car park: keys jingle, engines roar, and everyone drives off (honk honk!)
  'tr-cars': {
    bpm: 150,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['G', 'G'],
    parts: [
      { ins: 'brass', mel: ['G4 . B4 . D5 . G5 . . . D5 . G5 - - -', 'A5 . B5 - - - . . . . . . . . . .'] },
      { ins: 'bass', pat: 'R . R . R . R . R . R . R - - -|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', pat: 'k . s . k . s . k k s . k s s s|B . . . . . . . . . . . . . . .' }
    ]
  },
  // The Skyscraper's door: brakes squeal, doors slam, and look up... way up
  'tr-park': {
    bpm: 128,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['Dm', 'Dm'],
    parts: [
      { ins: 'bell', mel: ['D5 . . F5 . . A5 . . D6 . . F6 - - -', 'E6 . F6 - - - . . . . . . . . . .'] },
      { ins: 'bass', pat: 'R . . . R . . . R . . . R - - -|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', pat: 'k . . . s . . . k . k . s . t t|k . . . . . . . . . . . . . . .' }
    ]
  },
  // The rim: a deep breath, and jump into the crater
  'tr-rim': {
    bpm: 116,
    once: 1,
    sting: 1,
    end: 26,
    prog: ['Am', 'Am'],
    parts: [
      { ins: 'brass', v: 0.8, mel: ['A4 . . C5 . . E5 . . A5 - - - - - -', 'G#5 . A5 - - - . . . . . . . . . .'] },
      { ins: 'bass', pat: 'R . . R . . R . . R - - - - - -|R - - - . . . . . . . . . . . .' },
      { ins: 'drums', pat: 't . . t . . t . . k . . . . . .|k . . . . . . . . . . . . . . .' }
    ]
  },
  // A boss arrives: low toms rolling in, a dark brass chord
  bossin: {
    bpm: 96,
    once: 1,
    sting: 1,
    prog: ['Cm', 'G'],
    parts: [
      { ins: 'drums', pat: 'k . . . . . . . t . . . t . t t|k . . . t t t t t t t t k . . .' },
      { ins: 'brass', o: 3, v: 0.7, pat: 'c - - - - - - - . . . . . . . .|c - - - - - - - - - - - . . . .' },
      { ins: 'bass', v: 1.2, pat: 'R - - - - - - - R - - - R - - -|R - - - - - - - - - - - . . . .' },
      { ins: 'lead', v: 0.6, mel: ['C5 - - - - - - - B4 - - - C5 - - -', 'D5 - - - - - - - G4 - - - - - . .'] }
    ]
  },
  // The boss is beaten: ta-da!
  bosswin: {
    bpm: 140,
    once: 1,
    sting: 1,
    prog: ['G', 'C'],
    parts: [
      { ins: 'drums', pat: 'k . s . k . s . k k s s k s s s|k . . . . . . . . . . . . . . .' },
      { ins: 'brass', o: 4, v: 0.55, pat: 'c . c . c . . . . . c - - - . .|c - - - - - - - . . . . . . . .' },
      { ins: 'bass', pat: 'R . . . R . . . R . . . 5 . . .|R - - - - - - - . . . . . . . .' },
      { ins: 'lead', mel: ['D5 . D5 . D5 . G5 - - - B5 - - - . .', 'C6 - - - - - - - - - - - . . . .'] },
      { ins: 'bell', o: 5, v: 0.4, pat: '. . . . . . . . . . . . . . . .|R . 3 . 5 . 8 . . . . . . . . .' }
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
