def launch_pad():
    # SELF-PROMPT: optimistic industrial countdown. C mixolydian, 120. Pulsing staccato strings, marimba/glock
    # 16th "blinking lights", clockwork woodblock, sampled-synth pad, horn then brass fanfare theme.
    setup2(120,128)
    prog=['C','Bb','F','C','C','Bb','F','G','Am','F','C','G','Am','F','G','G']
    M=["C5 1.5, G4 .5, C5 1, E5 1","D5 1.5, Bb4 .5, F5 2","C5 1, F5 1, A5 1, G5 1","E5 3, r 1","C5 1.5, G4 .5, C5 1, E5 1","F5 1.5, D5 .5, Bb5 2","A5 1, G5 1, F5 1, C5 1","D5 3, r 1",
       "E5 1, A5 1, G5 1, E5 1","F5 1.5, E5 .5, C5 2","G5 1, E5 1, C5 1, E5 1","D5 2, B4 2","C5 1, E5 1, A5 1.5, G5 .5","A5 1, C6 1, A5 1, F5 1","G5 1.5, F5 .5, D5 1, B4 1","D5 2, G5 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            chord('pad',b,4,up,0.5); add('cbass',b,4,bs,0.5)
            for k in range(8): add('strst',b+k*.5,.3,bs+12 if k%2==0 else bs+24,0.6)
            arp('mar',b,4,[up[0]+24,up[1]+24,up[2]+24,up[1]+24],.25,0.3)
            add('glock',b+3,1,up[-1]+24,0.35)
            grid('wblk',b,'x.o.x.o.',.5,60,0.35); grid('kick',b,'x...x...',.5,60,0.35); grid('snare',b,'..x...x.',.5,60,0.2)
            if p==1: chord('str',b,4,up,0.3); grid('tamb',b,'.x.x.x.x',.5,60,0.5)
        if p==0: MB('horn',off,4,M,0.9,-12); MB('sq',off,4,M,0.3)
        else: MB('brass',off,4,M,0.95); MB('sq',off,4,M,0.35,12); add('crash',off,2,60,0.5)
        snare_roll(off+62,2,0.1,0.6)
    finish_loop('Space','Launch Pad',7000,E(150,0.42,0.36))
def rocket_ship():
    # SELF-PROMPT: sprinting down a starship corridor. A minor, 132. Driving 8th-note synth-pizz bass, sampled synth lead
    # with arpeggio flourishes, pad, blinking glock pings, tight snare/tamb. Pass 2 strings + brass double the lead.
    setup2(132,128)
    prog=['Am','F','G','Em','Am','F','G','E','F','G','Am','Am','F','G','E','E']
    M=["A4 .5, C5 .5, E5 .5, A5 .5, G5 1, E5 1","F5 .5, E5 .5, C5 .5, A4 .5, C5 2","B4 .5, D5 .5, G5 .5, B5 .5, A5 1, G5 1","E5 3, r 1",
       "A4 .5, C5 .5, E5 .5, A5 .5, B5 1, C6 1","A5 1, F5 .5, A5 .5, C6 2","B5 1, G5 1, D5 1, B4 1","G#4 2, B4 2",
       "A4 1, C5 1, F5 1.5, E5 .5","D5 1, G5 1, B5 1.5, A5 .5","A5 .5, G5 .5, E5 .5, C5 .5, E5 2","r 1, A4 .5, C5 .5, E5 1, A5 1",
       "C6 1.5, A5 .5, F5 2","D6 1.5, B5 .5, G5 2","G#5 1, B5 1, E6 2","D6 1, B5 1, G#5 1, E5 1"]
    gr=np.random.default_rng(21)
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            for k in range(8): add('pizz',b+k*.5,.4,bs+12 if k%4!=3 else bs+24,0.75); add('tuba',b+k*.5,.3,bs,0.45)
            chord('pad',b,4,up,0.45)
            grid('kick',b,'x...x...',.5,60,0.4); grid('snare',b,'..x...x.',.5,60,0.3); grid('tamb',b,'xoxoxoxo',.5,60,0.45)
            for _ in range(2): add('glock',b+gr.integers(0,8)*.5,.5,int(up[gr.integers(0,len(up))]+36),0.25)
            if p==1: chord('str',b,4,up,0.3)
        MB('sq',off,4,M,0.9)
        if p==1: MB('brass',off,4,M,0.5,-12); MB('strhi',off,4,M,0.35); add('crash',off,2,60,0.5)
        snare_roll(off+62,2,0.1,0.6)
    finish_loop('Space','Rocket Ship',6800,E(160,0.42,0.38))
def moon():
    # SELF-PROMPT: low gravity under a black sky. E lydian, 72, weightless. Theremin-like vibrato lead, choir + synth pad,
    # slow celesta/harp sparkles, bouncy octave-leaping pizz bass (low gravity hops), soft marimba in pass 2. Huge echo.
    setup2(72,128)
    prog=['E','F#/E','E','F#/E','C#m','A','B','B','E','F#/E','C#m','G#m','A','F#m','B','B']
    M=["B4 2, E5 2","A#4 2, C#5 1, F#5 1","G#5 3, F#5 1","E5 2, C#5 2","E5 1, G#5 1, C#6 2","B5 1.5, A5 .5, E5 2","F#5 2, D#5 1, B4 1","B4 4",
       "E5 1, F#5 1, G#5 1, B5 1","A#5 3, G#5 1","G#5 2, E5 2","D#5 2, B4 2","C#5 1, E5 1, A5 2","G#5 1, F#5 1, C#5 2","D#5 1, F#5 1, A5 1, G#5 1","F#5 4"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            chord('choir',b,4,up,0.4); chord('pad',b,4,[x+12 for x in up],0.35)
            add('pizz',b,.5,bs+12,0.6); add('pizz',b+1.5,.5,bs+24,0.4); add('pizz',b+2,.5,f+12,0.5); add('pizz',b+3.5,.5,bs+24,0.35)
            arp('cel',b+.5,4,[up[0]+24,up[1]+24,up[2]+24,up[1]+36],1,0.3)
            if p==1: arp('mar',b,4,[up[0]+12,up[2]+12,up[1]+24,up[2]+12],.5,0.22)
            if i%4==3: gliss('harp',b+2,2,'E4','E6',0.25,(4,6,8,11,1,3))
        if p==0: MB('ther',off,4,M,0.85,-12+12)
        else: MB('ther',off,4,M,0.7); MB('flute',off,4,M,0.35,12); MB('str',off,4,M,0.3,-12)
    finish_loop('Space','Moon',6500,E(300,0.6,0.55,1),0.10)
def alien_boss():
    # SELF-PROMPT: something not of this world attacks. C minor + chromatic/augmented/tritone harmony, 148.
    # Sampled-synth lead with theremin double, pulse synth bass, brass stabs, hard snare/kick, eerie choir.
    setup2(148,128)
    prog=['Cm','Cm','Abaug','G7','Cm','Db','Bdim7','G7','Fm','Db','Cm','Ab','Fm','Gb','G7','G7']
    M=["C5 .5, Eb5 .5, G5 .5, F#5 .5, G5 1, C5 1","Db5 .5, C5 .5, B4 .5, C5 .5, G4 2","Ab4 1, C5 1, E5 1.5, Eb5 .5","D5 1, B4 1, F5 1, G5 1",
       "C6 .5, B5 .5, Bb5 .5, A5 .5, Ab5 1, G5 1","F5 1, Ab5 1, Db6 1.5, C6 .5","B5 .5, Ab5 .5, F5 .5, D5 .5, B4 2","G4 .5, Ab4 .5, B4 .5, D5 .5, F5 1, G5 1",
       "Ab5 1.5, G5 .5, F5 1, C5 1","Db5 1, F5 1, Ab5 1, C6 1","G5 .5, Bb5 .5, C6 .5, Bb5 .5, G5 1, Eb5 1","C5 1, Eb5 1, Ab5 2",
       "F5 .5, Ab5 .5, C6 .5, B5 .5, C6 2","Bb5 1, Db6 1, Gb5 2","F5 .5, D5 .5, B4 .5, G4 .5, Ab4 .5, B4 .5, D5 .5, F5 .5","G5 2, r 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            for k in range(8): add('sq',b+k*.5,.35,[bs,bs+12,bs,bs+6 if k==3 else bs+12][k%4],0.6)
            add('cbass',b,4,bs,0.5); chord('pad',b,4,up,0.4)
            grid('kick',b,'x..x ..x. x..x ..x.',.25,60,0.5); grid('snare',b,'.... x..o .... x.ox',.25,60,0.35)
            add('timp',b,1,'C2' if bs%12 in (0,5,8) else 'G1',0.7)
            if i%2==1: chord('stab',b+2.5,.3,up,0.8); chord('stab',b+3,.3,[x+1 for x in up],0.7)
            if p==1: chord('choir',b,4,[x+12 for x in up],0.4); add('glock',b+1,.5,up[-1]+30,0.3)
        MB('sq',off,4,M,0.9); MB('ther',off,4,M,0.4,-12)
        if p==1: MB('brass',off,4,M,0.55)
        add('crash',off,2,60,0.8); snare_roll(off+62,2,0.2,0.8); timp_roll(off+60,4,'G1',0.3,1.0)
    finish_loop('Space','Alien Boss',6500,E(200,0.5,0.45,1),0.115)
for fn in (launch_pad,rocket_ship,moon,alien_boss): fn()
