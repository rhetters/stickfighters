def alpine():
    # SELF-PROMPT: pastoral Alpine waltz (3/4, 108), F major. Tuba/pizz oom-pah-pah, flute tune with harp,
    # glockenspiel "cow-bells", pass 2 horn sings the tune, flute descant, warm strings. Airy echo.
    setup2(108,96)
    prog=['F','F','C','C','Bb','F','C','F','F','F','Bb','Bb','Gm','C7','F','F']
    M=["C5 1, A4 1, C5 1","F5 2, E5 .5, F5 .5","G5 1, E5 1, C5 1","D5 2, C5 1","D5 1, F5 1, D5 1","C5 1, A4 1, F4 1","G4 1, A4 .5, Bb4 .5, C5 1","A4 3",
       "C5 1, F5 1, A5 1","G5 1.5, F5 .5, E5 1","F5 1, D5 1, Bb4 1","D5 2, F5 1","Bb5 1, A5 1, G5 1","E5 1, G5 1, C5 1","F5 2, A4 1","F5 3"]
    for p in range(2):
        off=p*48
        for i,(b,up,bs,f) in enumerate(H(off,3,prog)):
            add('tuba',b,.8,bs if i%2==0 else f,0.85); chord('pizz',b+1,.4,up,0.35); chord('pizz',b+2,.4,up,0.3)
            chord('str',b,3,up,0.25 if p==0 else 0.35)
            if p==0: arp('harp',b,3,[up[0]+12,up[1]+12,up[2]+12],.5,0.35)
            else: add('flute',b,3,up[-1]+12,0.4)
            if i%2==0: add('glock',b,1,up[-1]+24,0.4); add('glock',b+1.5,1,up[0]+24,0.25)
            add('tamb',b+1,.2,60,0.3); add('tamb',b+2,.2,60,0.3)
        if p==0: MB('flute',off,3,M,0.85); MB('clar',off,3,M,0.3,-12)
        else: MB('horn',off,3,M,0.9,-12); MB('oboe',off,3,M,0.35); add('crash',off,2,60,0.25)
    finish_loop('Mountain','Alpine Meadows',7200,E(140,0.42,0.36))
def mountain_side():
    # SELF-PROMPT: the climb. D minor, 116, heroic & determined. Rising string 8th arpeggios, horn theme,
    # timpani/snare grow; pass 2 jumps UP a whole step to E minor (getting steeper) with full brass + choir.
    setup2(116,128)
    prog=['Dm','C','Bb','C','Dm','C','Bb','A','Gm','Dm','Bb','F','Gm','Bb','A','A']
    M=["D4 2, A4 2","G4 1.5, E4 .5, C5 2","Bb4 1.5, A4 .5, F4 2","G4 2, C5 1, E5 1","D5 2, A4 1, F4 1","E5 1.5, D5 .5, C5 1, G4 1","F4 1, Bb4 1, D5 1, F5 1","E5 2, C#5 2",
       "D5 1.5, Bb4 .5, G4 2","A4 1, D5 1, F5 2","F5 1.5, E5 .5, D5 1, Bb4 1","C5 1, F5 1, A5 2","G5 1.5, F5 .5, D5 1, Bb4 1","D5 1, F5 1, Bb5 1, A5 1","A5 2, G5 1, E5 1","C#5 2, E5 1, A4 1"]
    for p in range(2):
        off=p*64; t=2*p
        for i,(b,up,bs,f) in enumerate(H(off,4,prog,t)):
            arp('strst',b,4,[up[0]+12,up[1]+12,up[2]+12,up[0]+24],.5,0.6+0.1*p)
            add('cbass',b,4,bs,0.6); add('tuba',b,1,bs,0.8); add('tuba',b+2,1,f,0.6)
            add('timp',b,1,bs+12 if bs<36 else bs,0.5+0.2*p); add('timp',b+2.5,.5,f,0.3+0.2*p)
            grid('snare',b,'.x.x' if p==0 else '.x.x',1,60,0.2+0.1*p)
            if p==1: grid('snare',b,'...o ...o ...o ..oo',.25,60,0.25); chord('choir',b,4,[x+12 for x in up],0.4)
            chord('str',b,4,up,0.3)
        if p==0: MB('horn',off,4,M,0.95,0); MB('clar',off,4,M,0.3,0)
        else: MB('brass',off,4,M,0.95,2+12 if False else 2); MB('horn',off,4,M,0.5,2-12); MB('strhi',off,4,M,0.4,2+12); add('crash',off,2,60,0.6)
        timp_roll(off+60,4,'A1' if p==0 else 'B1',0.3,0.9)
    finish_loop('Mountain','Mountain Side',6500,E(170,0.45,0.4,1))
def snowy_peaks():
    # SELF-PROMPT: howling wind, falling snow. B minor, 92. Looped-noise "wind" swells (SNES noise-channel style),
    # celesta/glock snowflake arpeggios, choir pad, oboe then strings melody, sparse timpani. Cold bright echo.
    setup2(92,128)
    prog=['Bm','G','Em','F#','Bm','G','Em','F#','G','A','Bm','G','Em','F#','Bm','F#']
    M=["F#5 2, D5 1, B4 1","D5 1.5, E5 .5, B4 2","E5 1, G5 1, F#5 1, E5 1","C#5 3, r 1","F#5 2, B5 1, A5 1","G5 1.5, F#5 .5, D5 2","E5 1, D5 1, C#5 1, B4 1","A#4 3, r 1",
       "B4 1, D5 1, G5 2","A5 1.5, G5 .5, E5 2","F#5 1, D5 1, B4 1, D5 1","G5 2, F#5 1, E5 1","E5 1.5, F#5 .5, G5 1, B5 1","A#5 2, F#5 2","B5 2, F#5 1, D5 1","C#5 4"]
    wr=np.random.default_rng(5)
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            chord('choir',b,4,up,0.45); add('cbass',b,4,bs,0.55)
            arp('cel',b,4,[up[0]+24,up[2]+24,up[1]+24,up[0]+36],.5,0.35)
            if p==1: arp('glock',b+.25,4,[up[2]+24,up[0]+24],1,0.25); arp('pizz',b,4,[bs+12,f+12],1,0.4)
            if i%2==0: add('timp',b,1,'B1' if bs%12 in (11,7,4) else 'F#1',0.35)
            if i%4==0: add('wind',b+wr.random(),5,int(60+wr.integers(-3,8)),0.9)
            if i%4==2: add('wind',b+1,3,int(67+wr.integers(-2,6)),0.6)
        if p==0: MB('oboe',off,4,M,0.85); MB('flute',off,4,M,0.3,-12)
        else: MB('str',off,4,M,0.6); MB('horn',off,4,M,0.5,-12); MB('flute',off,4,M,0.35,12)
    finish_loop('Mountain','Snowy Peaks',6800,E(220,0.55,0.5,1),0.10)
def yeti_boss():
    # SELF-PROMPT: a giant beast stomps. E minor, 140, heavy. Pounding low toms + timpani, tuba/cbass riff,
    # brass theme, chanting choir hits, wind gusts; pass 2 adds high strings.
    setup2(140,128)
    prog=['Em','Em','C','B','Em','Em','C','B','Am','Em','C','B','Am','C','B','B']
    M=["E5 1.5, B4 .5, E5 1, G5 1","F#5 .5, E5 .5, D#5 .5, E5 .5, B4 2","C5 1, E5 1, G5 1.5, F#5 .5","F#5 2, D#5 2","E5 1.5, B4 .5, E5 1, G5 1","B5 1, A5 .5, G5 .5, F#5 1, E5 1","E5 1, G5 1, C6 1, B5 1","B5 2, F#5 2",
       "A5 1.5, E5 .5, C5 1, A4 1","B4 1, E5 1, G5 1, B5 1","C6 1.5, B5 .5, G5 1, E5 1","D#5 1, F#5 1, B5 2","C6 1, B5 1, A5 1, E5 1","G5 1, F#5 1, E5 1, C5 1","D#5 1, E5 1, F#5 1, A5 1","B5 2, r 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            for k,n in enumerate([bs,bs,bs+12,bs,bs+3 if bs%12==4 else bs,bs,f,bs+1 if i%4==3 else bs]): add('tuba',b+k*.5,.4,n,0.9 if k%2==0 else 0.65)
            add('cbass',b,4,bs,0.6); chord('str',b,4,up,0.3)
            grid('tom',b,'x.x. x... x.xx x...',.25,52,0.8); grid('tom',b,'.... ..x. .... ..x.',.25,45,0.7)
            grid('kick',b,'x... x... x... x...',.25,60,0.5); grid('snare',b,'.... x... .... x...',.25,60,0.35)
            add('timp',b,1,'E2' if bs%12 in (4,9,0) else 'B1',0.8)
            if i%2==1: chord('chant',b+3,.4,up,0.8); chord('chant',b+3.5,.4,up,0.9)
            if p==1: chord('choir',b,4,[x+12 for x in up],0.4); add('strhi',b,4,up[-1]+24,0.4)
            if i%8==0: add('wind',b,4,64,0.5)
        MB('brass',off,4,M,1.0); MB('horn',off,4,M,0.5,-12)
        add('crash',off,2,60,0.8); timp_roll(off+60,4,'B1',0.3,1.0); snare_roll(off+62,2,0.2,0.7)
    finish_loop('Mountain','Yeti Boss',6000,E(180,0.48,0.42,1),0.115)
for fn in (alpine,mountain_side,snowy_peaks,yeti_boss): fn()
