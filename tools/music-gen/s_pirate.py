def beach():
    # SELF-PROMPT: sunny shore, playful sea-shanty lilt in 6/8 (beat = dotted quarter, 104). G major.
    # Steel drum + flute tune, marimba eighth-note ripples like waves, pizz/tuba bass, shaker; flute "gull" calls;
    # pass 2 accordion + fiddle, pass 3 everyone. Bright short echo.
    setup2(104,96); T=1/3
    prog=['G','G','C','G','Em','Am','D','D','G','G','C','G','Em','D','G','G']
    M=["D5 2/3, B4 1/3, G4 2/3, B4 1/3","D5 1, G5 1","E5 2/3, D5 1/3, C5 2/3, E5 1/3","D5 1, B4 2/3, r 1/3",
       "B4 2/3, C5 1/3, D5 2/3, E5 1/3","C5 2/3, A4 1/3, E5 1","D5 2/3, C5 1/3, B4 2/3, A4 1/3","F#4 1, A4 1",
       "D5 2/3, B4 1/3, G4 2/3, B4 1/3","D5 1, G5 2/3, A5 1/3","G5 2/3, E5 1/3, C5 2/3, E5 1/3","D5 1, B4 1",
       "E5 2/3, F#5 1/3, G5 2/3, E5 1/3","F#5 2/3, E5 1/3, D5 2/3, A4 1/3","B4 2/3, A4 1/3, G4 2/3, F#4 1/3","G4 1, r 1"]
    for p in range(3):
        off=p*32
        for i,(b,up,bs,f) in enumerate(H(off,2,prog)):
            add('tuba',b,.6,bs,0.8); add('pizz',b+1,.5,f+12,0.6); add('pizz',b,.5,bs+12,0.5)
            arp('mar',b,2,[up[0]+12,up[1]+12,up[2]+12,up[1]+12,up[0]+24,up[2]+12],T,0.45 if p!=1 else 0.3)
            grid('shak',b,'xoo xoo',T,60,0.8); add('tamb',b+1,.2,60,0.5)
            if p>0: chord('str',b,2,up,0.25 if p==1 else 0.35)
            if p==1:
                for k in (T*2,1+T*2): chord('acc',b+k,T,up,0.35)
        if p==0: MB('steel',off,2,M,0.9); MB('flute',off,2,M,0.35,12)
        elif p==1: MB('acc',off,2,M,0.85); MB('fiddle',off,2,M,0.5)
        else:
            MB('flute',off,2,M,0.8,12); MB('steel',off,2,M,0.7); MB('horn',off,2,M,0.45,-12); add('crash',off,2,60,0.35)
        for gb in (off+6+1,off+22+1):   # seagull calls
            add('flute',gb,T,'A6',0.35); add('flute',gb+T,T*2,'E6',0.3); add('flute',gb+T*3,T,'A6',0.25); add('flute',gb+T*4,T*2,'D6',0.2)
    finish_loop('Pirate','Beach',7200,E(110,0.38,0.32))
def pirate_ship():
    # SELF-PROMPT: rollicking hornpipe on a wooden deck, D dorian, 132. Fiddle + accordion offbeats, tuba oom-pah,
    # woodblock creaks, light snare; bar 16 ends with two "cannon" timpani booms. Pass 2: accordion tune, brass below, flute descant.
    setup2(132,128)
    prog=['Dm','Dm','C','C','Dm','Dm','Am','Dm','F','C','Dm','Am','Bb','C','A','Dm']
    M=["D5 .75, A4 .25, F4 .5, A4 .5, D5 .5, E5 .5, F5 1","E5 .5, D5 .5, C5 .5, A4 .5, D5 1, r 1","C5 .75, G4 .25, E4 .5, G4 .5, C5 .5, D5 .5, E5 1","D5 .5, C5 .5, Bb4 .5, G4 .5, C5 1, r 1",
       "D5 .75, A4 .25, F4 .5, A4 .5, D5 .5, E5 .5, F5 .5, G5 .5","A5 1, G5 .5, F5 .5, E5 .5, D5 .5, C5 1","E5 .5, F5 .5, E5 .5, D5 .5, C5 .5, B4 .5, A4 1","D5 2, r 2",
       "C5 .5, F5 .5, A5 .5, F5 .5, C5 .5, F5 .5, A5 1","G5 .5, E5 .5, C5 .5, E5 .5, G5 1.5, r .5","F5 .5, D5 .5, A4 .5, D5 .5, F5 .5, A5 .5, G5 .5, F5 .5","E5 1.5, C5 .5, A4 2",
       "Bb4 .5, D5 .5, F5 .5, D5 .5, Bb5 1, A5 .5, G5 .5","G5 .5, E5 .5, C5 .5, G4 .5, C5 1, E5 1","C#5 .5, E5 .5, A5 .5, G5 .5, F5 .5, E5 .5, D5 .5, C#5 .5","D5 1, A4 .5, D5 .5, r 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            add('tuba',b,.8,bs,0.9); add('tuba',b+2,.8,f,0.75); add('cbass',b,4,bs,0.4)
            for k in (.5,1.5,2.5,3.5): chord('acc',b+k,.35,up,0.4 if p==0 else 0.3)
            grid('wblk',b,'x.x.',1,60,0.45); grid('snare',b,'.x.x',1,60,0.22)
            if p==1: add('flute',b,4,up[-1]+12,0.4)
            if i==15: add('timp',b+2,1,'D2',1.0); add('timp',b+3,1,'A1',1.0); add('crash',b+3,1,60,0.3)
        if p==0: MB('fiddle',off,4,M,0.9); MB('clar',off,4,M,0.3,-12)
        else: MB('acc',off,4,M,0.8); MB('brass',off,4,M,0.45,-12); MB('fiddle',off,4,M,0.4); add('crash',off,2,60,0.5)
    finish_loop('Pirate','Pirate Ship',7000,E(150,0.4,0.35))
def treasure_cave():
    # SELF-PROMPT: dripping cavern hiding gold. A phrygian, 80 BPM. Low clarinet then oboe theme, harp/pizz ostinato,
    # celesta + glock "glints" of treasure, faint choir, heartbeat timpani. Deep dark echo.
    setup2(80,128)
    prog=['Am','Bb','Am','Bb','Gm','Am','F','E','Am','Bb','Am','Bb','Dm','F','E7','E7']
    M=["E4 2, F4 1, E4 1","D4 1.5, F4 .5, Bb4 2","A4 1, G4 .5, F4 .5, E4 2","F4 1, D4 1, Bb3 2","G4 1.5, Bb4 .5, D5 2","C5 1, B4 .5, A4 .5, E4 2","F4 1, A4 1, C5 1, A4 1","G#4 3, r 1",
       "E5 2, F5 1, E5 1","D5 1.5, F5 .5, Bb5 2","A5 1, G5 .5, F5 .5, E5 1, C5 1","D5 2, Bb4 2","A4 1, D5 1, F5 1.5, E5 .5","C5 2, A4 1, F4 1","G#4 1, B4 1, D5 1, F5 1","E5 4"]
    gr=np.random.default_rng(11)
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            add('cbass',b,4,bs,0.6); add('timp',b,1,'A1' if bs%12 in (9,4) else 'D2',0.35); add('timp',b+.5,1,'A1' if bs%12 in (9,4) else 'D2',0.2)
            arp('pizz',b,4,[bs+12,f+12,bs+24,f+12],1,0.45)
            for k in range(4): add('harp',b+k+.5,.5,up[k%len(up)]+12,0.35)
            chord('strhi',b,4,[up[0]+12,up[-1]+12],0.22 if p==0 else 0.32)
            if p==1: chord('choir',b,4,up,0.35)
            for _ in range(gr.integers(1,3)): add('glock' if gr.random()<.5 else 'cel',b+gr.integers(0,8)*.5,1,int(up[gr.integers(0,len(up))]+24+12*gr.integers(0,2)),0.3+0.3*gr.random())
        MB('clar',off,4,M[:8],0.9 if p==0 else 0.6,-12 if p==0 else 0); MB('oboe',off+32,4,M[8:],0.85)
        if p==1: MB('clar',off,4,M[:8],0.45,-12); MB('str',off+32,4,M[8:],0.35,-12)
    finish_loop('Pirate','Treasure Cave',5000,E(260,0.6,0.55,2),0.10)
def pirate_boss():
    # SELF-PROMPT: Hook-style swashbuckling duel. D minor, 152. String 8th ostinato, tuba/cbass driving,
    # brass swagger theme, snare 16ths, kick, timpani; pass 2 adds choir + high string counterline.
    setup2(152,128)
    prog=['Dm','Dm','Bb','A','Dm','Dm','Gm','A','Dm','Dm','Bb','C','Gm','A','Dm','A']
    M=["D5 1.5, A4 .5, D5 1, F5 1","E5 .5, D5 .5, C#5 .5, D5 .5, A4 2","Bb4 1.5, D5 .5, F5 1, Bb5 1","A5 1.5, G5 .5, F5 .5, E5 .5, C#5 1",
       "D5 1.5, A4 .5, D5 1, F5 1","A5 1, G#5 .5, A5 .5, F5 2","G5 1, Bb5 1, D6 1, C6 .5, Bb5 .5","A5 2, E5 1, C#5 1",
       "F5 .5, E5 .5, D5 .5, E5 .5, F5 1, A5 1","G5 .5, F5 .5, E5 .5, F5 .5, D5 2","D5 1, F5 1, Bb5 1.5, A5 .5","G5 1, E5 1, C5 1, E5 1",
       "D5 1.5, G5 .5, Bb5 1, A5 1","G5 1, F5 1, E5 1, C#5 1","D5 1, F5 1, A5 1, D6 1","C#6 2, A5 1, r 1"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            for k in range(8): add('strst',b+k*.5,.4,[bs+24,bs+24,f+24,bs+24,bs+36,bs+24,f+24,bs+25 if k==7 and i%4==3 else f+24][k],0.75 if k%2==0 else 0.5)
            add('tuba',b,.5,bs,0.95); add('tuba',b+1.5,.5,bs,0.7); add('tuba',b+2,.5,f,0.85); add('tuba',b+3.5,.5,bs,0.7); add('cbass',b,4,bs,0.5)
            grid('snare',b,'..x. o.xo ..x. o.xx',.25,60,0.35); grid('kick',b,'x..x ..x. x..x ..x.',.25,60,0.5)
            add('timp',b,1,'D2' if bs%12 in (2,10,7) else 'A1',0.8)
            chord('str',b,4,up,0.35)
            if i%2==1: chord('stab',b+2.5,.3,[x-12 for x in up],0.8); chord('stab',b+3.5,.3,[x-12 for x in up],0.9)
            if p==1: chord('choir',b,4,[x+12 for x in up],0.45); add('strhi',b,4,up[-1]+24,0.45)
        MB('brass',off,4,M,1.0); MB('horn',off,4,M,0.4,-12)
        add('crash',off,2,60,0.8); snare_roll(off+62,2,0.2,0.8); timp_roll(off+60,4,'A1',0.3,1.0)
    finish_loop('Pirate','Pirate Boss',6500,E(176,0.48,0.42,1),0.115)
for fn in (beach,pirate_ship,treasure_cave,pirate_boss): fn()
