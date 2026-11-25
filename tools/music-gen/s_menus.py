def menu():
    # SELF-PROMPT: title screen. Heroic, inviting "adventure awaits" theme, C major w/ modal color, 112 BPM.
    # Pass 1 horn + strings, harp; pass 2 full brass fanfare, choir, timpani. Not too busy (people sit here).
    setup2(112,128)
    prog=['C','G/B','Am','F','C','Bb','F','G','Am','Em','F','C','Dm','Bb','Gsus4','G']
    M=["G4 1.5, C5 .5, E5 1, G5 1","F5 1.5, E5 .5, D5 2","C5 1, E5 1, A5 1.5, G5 .5","F5 3, C5 1",
       "E5 1.5, G5 .5, C6 1, G5 1","Bb5 1.5, A5 .5, F5 1, D5 1","C5 1, F5 1, A5 1, F5 1","G5 3, r 1",
       "A5 1.5, G5 .5, E5 1, C5 1","B4 1, E5 1, G5 2","A5 1, F5 1, C6 1.5, A5 .5","G5 2, E5 1, C5 1",
       "D5 1, F5 1, A5 1, D6 1","D6 1.5, C6 .5, Bb5 1, F5 1","G5 1, C6 1, B5 .5, A5 .5, G5 1","G5 2, D5 1, F5 1"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            chord('str',b,4,up,0.3 if p==0 else 0.4); add('cbass',b,4,bs,0.55)
            add('tuba',b,1,bs,0.6); add('tuba',b+2,1,f,0.45)
            arp('harp',b,4,[up[0]+12,up[1]+12,up[2]+12,up[1]+12],.5,0.3 if p==0 else 0.22)
            add('timp',b,1,'C2' if bs%12 in (0,9,5,4,2) else 'G1',0.3+0.25*p)
            if p==1:
                chord('choir',b,4,[x+12 for x in up],0.4); grid('snare',b,'.x.x',1,60,0.2)
                if i%4==3: chord('stab',b+3,.3,up,0.6); chord('stab',b+3.5,.3,up,0.7)
        if p==0: MB('horn',off,4,M,0.9,-12); MB('flute',off,4,M,0.3)
        else: MB('brass',off,4,M,0.95); MB('strhi',off,4,M,0.4); MB('horn',off,4,M,0.45,-12); add('crash',off,2,60,0.55)
        timp_roll(off+60,4,'G1',0.2,0.7)
    finish_loop('Menus','Menu',7000,E(176,0.48,0.42,1),0.105)
def dressup():
    # SELF-PROMPT: character creation / dressing room. Playful, a little cheeky, "try this on!" Bb major, 100 BPM,
    # bouncy pizz + tuba two-step, clarinet tune with oboe answers, glock sparkles on each new phrase, light tamb.
    setup2(100,64)
    prog=['Bb','Gm','Cm','F7','Bb','Gm','Eb','F','Dm','Gm','Cm','F','Eb','F','Bb','F7']
    M=["D5 .5, r .5, F5 .5, D5 .5, Bb4 1, C5 1","D5 .5, Bb4 .5, G4 1, r 2","Eb5 .5, r .5, G5 .5, Eb5 .5, C5 1, D5 1","Eb5 .5, C5 .5, A4 1, r 2",
       "D5 .5, r .5, F5 .5, D5 .5, Bb5 1, A5 1","G5 .5, F5 .5, D5 1, r 2","G5 .5, F5 .5, Eb5 .5, D5 .5, C5 1, Eb5 1","F5 3, r 1",
       "F5 .5, r .5, A5 .5, F5 .5, D5 1, F5 1","G5 .5, F5 .5, D5 1, Bb4 2","C5 .5, Eb5 .5, G5 .5, Eb5 .5, C5 1, A4 1","F4 1, A4 1, C5 2",
       "Bb4 .5, C5 .5, Eb5 .5, G5 .5, Bb5 1, G5 1","A5 .5, G5 .5, F5 .5, Eb5 .5, C5 2","D5 1, F5 1, Bb5 1, F5 1","Eb5 1, C5 1, A4 1, r 1"]
    for i,(b,up,bs,f) in enumerate(H(0,4,prog)):
        add('tuba',b,.6,bs+12,0.75); add('tuba',b+2,.6,f,0.6)
        for k in (1,3): chord('pizz',b+k,.4,up,0.4)
        grid('tamb',b,'.x.x',1,60,0.5); add('wblk',b+3.5,.1,60,0.25)
        chord('str',b,4,up,0.2)
        if i%2==0: add('glock',b,1,up[-1]+24,0.35)
        if i%4==3: gliss('harp',b+3,1,'F5','F6',0.3,(10,0,2,3,5,7,9))
    MB('clar',0,4,M[:8],0.9); MB('oboe',32,4,M[8:],0.85); MB('flute',32,4,M[8:],0.25,12)
    finish_loop('Menus','Character Creation',7200,E(130,0.4,0.33),0.10)
def house():
    # SELF-PROMPT: house editor — cozy, warm, unhurried, like decorating on a sunny afternoon. F major, 84 BPM,
    # lilting swing-ish 8ths. Marimba/harp comp, flute tune, warm strings + horn pad, soft shaker. Low energy so you
    # can sit and build for a long time without fatigue.
    setup2(84,64)
    prog=['Fmaj7','Dm7','Gm7','C7','Fmaj7','Am','Bb','C','Dm','Am','Bbmaj7','F','Gm7','C7','F','C7']
    M=["A4 1, C5 1, F5 1.5, E5 .5","D5 2, A4 2","Bb4 1, D5 1, G5 1.5, F5 .5","E5 3, r 1",
       "A5 1.5, G5 .5, F5 1, C5 1","E5 1, C5 1, A4 2","D5 1, F5 1, Bb5 1, A5 1","G5 3, r 1",
       "F5 1, D5 1, A4 1, D5 1","E5 1.5, C5 .5, A4 2","D5 1, F5 1, A5 1.5, G5 .5","F5 2, C5 2",
       "Bb4 1, D5 1, G5 1, F5 1","E5 1, G5 1, Bb5 1, G5 1","A5 3, F5 1","E5 2, G5 2"]
    for i,(b,up,bs,f) in enumerate(H(0,4,prog)):
        add('cbass',b,2,bs+12,0.5); add('pizz',b+2,.5,f+12,0.45); add('pizz',b+3.5,.5,bs+12,0.3)
        for k,(o,d) in enumerate([(0,.67),(.67,.33),(1,.67),(1.67,.33),(2,.67),(2.67,.33),(3,.67),(3.67,.33)]):
            add('mar',b+o,d,up[[0,1,2,1][k%4]]+12,0.35 if k%2==0 else 0.22)
        chord('str',b,4,up,0.22); chord('horn',b,4,up[:2],0.15)
        grid('shak',b,'x.oxx.ox',.5,60,0.5)
        if i%4==3: arp('harp',b+2,2,[up[0]+12,up[1]+12,up[2]+12,up[0]+24],.25,0.3)
    MB('flute',0,4,M,0.8); MB('clar',32,4,M[8:],0.35,-12)
    finish_loop('Menus','House Editor',6500,E(150,0.42,0.36),0.10)
for fn in (menu,dressup,house): fn()
