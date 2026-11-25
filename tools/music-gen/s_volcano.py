def jungle_base():
    # SELF-PROMPT: lush tropical base camp, volcano rumbling far off. F major, 108. Steel drum + marimba tune,
    # log-drum tresillo, shakers, flute, upward harp "geyser" sprays, distant low timpani rumbles.
    setup2(108,128)
    prog=['F','Bb','F','C','Dm','Bb','C','C','F','Bb','F','C','Dm','Bb','C','F']
    M=["C5 .5, F5 .5, r .5, A5 .5, G5 1, F5 1","D5 .5, F5 .5, r .5, Bb5 .5, A5 1, F5 1","C5 .5, F5 .5, A5 .5, C6 .5, A5 1, F5 1","G5 2, E5 1, C5 1",
       "D5 .5, F5 .5, r .5, A5 .5, G5 1, F5 1","F5 1, D5 1, Bb4 1, D5 1","C5 .5, E5 .5, G5 .5, Bb5 .5, A5 1, G5 1","E5 2, r 2",
       "A5 1.5, G5 .5, F5 1, C5 1","D5 1, F5 1, Bb5 1.5, A5 .5","A5 .5, G5 .5, F5 .5, G5 .5, A5 1, C6 1","Bb5 1.5, A5 .5, G5 2",
       "F5 1, A5 1, D6 1, C6 1","Bb5 1, A5 1, F5 1, D5 1","E5 1, G5 1, Bb5 1, G5 1","F5 2, r 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            add('tuba',b,.6,bs+12,0.7); add('pizz',b+1.5,.4,f+12,0.5); add('tuba',b+2,.6,f,0.6); add('pizz',b+3.5,.4,bs+12,0.5)
            for k in (.5,1.5,2.5,3.5): chord('mar',b+k,.3,[x+12 for x in up],0.3)
            grid('logd',b,'x..x ..x. x..x ..x.',.25,57,0.7); grid('logd',b,'.... x... .... x.o.',.25,52,0.6)
            grid('shak',b,'xoxo xoxo xoxo xoxo',.25,60,0.8)
            if i%4==1: gliss('harp',b+2,1,'F4','F6',0.35)
            if i%8==0: timp_roll(b,2,'F1',0.1,0.3)
            if p==1: chord('str',b,4,up,0.3)
        if p==0: MB('steel',off,4,M,0.9); MB('mar',off,4,M,0.4)
        else: MB('flute',off,4,M,0.85); MB('steel',off,4,M,0.6,-12); MB('horn',off,4,M,0.35,-12); add('crash',off,2,60,0.3)
    finish_loop('Volcano','Jungle Base',7000,E(130,0.4,0.34))
def ashy_ascent():
    # SELF-PROMPT: sprinting up a steep, smoking slope. C minor, 138, urgent. String 16th-ish ostinato, toms, brass theme,
    # falling-rock chromatic marimba/xylo runs tumbling down every 2 bars, timpani thuds as boulders land.
    setup2(138,128)
    prog=['Cm','Cm','Ab','Bb','Cm','Cm','Ab','G','Fm','Cm','Ab','Bb','Fm','Db','G','G']
    M=["G4 1, C5 1, Eb5 1.5, D5 .5","C5 1, G4 1, Eb5 1, G5 1","Ab5 1.5, G5 .5, F5 1, Eb5 1","D5 2, Bb4 2","G4 1, C5 1, Eb5 1.5, F5 .5","G5 1, Eb5 1, C6 2","C6 1, Bb5 .5, Ab5 .5, Eb5 2","D5 1, B4 1, G4 2",
       "F5 1.5, Ab5 .5, C6 2","Bb5 1, G5 1, Eb5 2","Eb5 1, Ab5 1, C6 1, Bb5 1","Bb5 2, F5 2","Ab5 1, G5 1, F5 1, C5 1","Db5 1, F5 1, Ab5 1.5, G5 .5","G5 1, F5 1, D5 1, B4 1","G4 .5, B4 .5, D5 .5, F5 .5, G5 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            for k in range(8): add('strst',b+k*.5,.35,[bs+24,bs+31,bs+36,bs+31][k%4],0.7 if k%2==0 else 0.5)
            add('tuba',b,.5,bs,0.9); add('tuba',b+1.5,.5,bs,0.6); add('tuba',b+2,.5,f,0.8); add('cbass',b,4,bs,0.5)
            grid('tom',b,'x.x. ..x. x.x. .xx.',.25,50,0.6); grid('kick',b,'x... x... x... x...',.25,60,0.4); grid('snare',b,'.... x... .... x...',.25,60,0.3)
            if i%2==1:
                st=b+2; top=up[-1]+36
                for j in range(8): add('mar',st+j*.125,.2,top-j,0.45)
                add('timp',b+3,1,'C2',0.8)
            if p==1: chord('str',b,4,up,0.35); chord('choir',b,4,[x+12 for x in up],0.3)
        MB('brass',off,4,M,0.95)
        if p==0: MB('horn',off,4,M,0.4,-12)
        else: MB('strhi',off,4,M,0.4); MB('horn',off,4,M,0.5,-12); add('crash',off,2,60,0.6)
        snare_roll(off+62,2,0.2,0.7); timp_roll(off+60,4,'G1',0.3,0.9)
    finish_loop('Volcano','Ashy Ascent',6500,E(170,0.45,0.4,1),0.11)
def the_creator():
    # SELF-PROMPT: descending into the volcano's heart, lava all around. A phrygian, 124, ominous ritual power.
    # Pipe organ + choir, tribal toms/log drums, low strings, brass theme in pass 2, bubbling low marimba lava blips.
    setup2(124,128)
    prog=['Am','Am','Bb','Bb','Am','Am','G','Bb','Dm','Dm','Bb','Bb','Gm','Bb','A','A']
    M=["A4 2, E5 2","D5 1, C5 1, B4 1, A4 1","Bb4 1.5, D5 .5, F5 2","E5 1, D5 1, Bb4 2","A4 1, C5 1, E5 1, A5 1","G#5 1, A5 1, E5 2","D5 1.5, B4 .5, G4 2","F5 2, D5 1, Bb4 1",
       "A5 2, F5 1, D5 1","E5 1, F5 1, A5 2","Bb5 1.5, A5 .5, F5 1, D5 1","E5 2, F5 2","G5 1, Bb5 1, D6 1.5, C6 .5","Bb5 1, A5 1, F5 1, D5 1","C#5 1, E5 1, A5 2","G5 1, E5 1, C#5 2"]
    br=np.random.default_rng(9)
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            chord('organ',b,4,up,0.4); chord('choir',b,4,[x+12 for x in up],0.35 if p==0 else 0.5); add('cbass',b,4,bs,0.6)
            add('tuba',b,1,bs,0.8); add('tuba',b+2.5,.5,bs,0.5); add('tuba',b+3,.5,f,0.6)
            grid('tom',b,'x..x ..x. x... x.x.',.25,47,0.7); grid('logd',b,'..x. x..x ..x. ..xx',.25,50,0.45)
            add('timp',b,1,'A1' if bs%12 in (9,7,4) else 'D2',0.7)
            for _ in range(br.integers(1,4)): add('mar',b+br.integers(0,16)*.25,.25,int(bs+24+br.integers(0,7)),0.35)
            if p==1: grid('snare',b,'.... x... .... x..o',.25,60,0.3); arp('strst',b,4,[up[0]+12,up[1]+12,up[2]+12,up[1]+12],.5,0.5)
        if p==0: MB('organ',off,4,M,0.5,0); MB('horn',off,4,M,0.7,-12)
        else: MB('brass',off,4,M,0.95); MB('organ',off,4,M,0.35,-12); add('crash',off,2,60,0.6)
        timp_roll(off+60,4,'A1',0.3,0.9)
    finish_loop('Volcano','The Crater',5800,E(220,0.52,0.48,2),0.11)
def tiki_boss():
    # SELF-PROMPT: the Tiki god awakens. G minor, 150, tribal fury. Log drums + toms in 16ths, chanting choir hits,
    # brass theme, organ, string ostinato; pass 2 adds high strings and full choir.
    setup2(150,128)
    prog=['Gm','Gm','Eb','D','Gm','Gm','Cm','D','Eb','F','Gm','Gm','Cm','D','Gm','D']
    M=["G5 1, D5 .5, G5 .5, Bb5 1, A5 1","G5 .5, F5 .5, D5 .5, F5 .5, G5 2","Eb5 1, G5 1, Bb5 1.5, A5 .5","A5 2, F#5 2","G5 1, D5 .5, G5 .5, Bb5 1, C6 1","D6 1, C6 .5, Bb5 .5, A5 1, G5 1","C6 1, G5 1, Eb5 1, C5 1","D5 1, F#5 1, A5 2",
       "Bb5 1.5, G5 .5, Eb5 2","C6 1.5, A5 .5, F5 2","D6 1, Bb5 1, G5 1, D5 1","F5 .5, G5 .5, Bb5 .5, G5 .5, D5 2","Eb5 1, G5 1, C6 1, Bb5 1","A5 1, F#5 1, D5 1, A4 1","G4 .5, Bb4 .5, D5 .5, G5 .5, Bb5 1, A5 1","A5 2, r 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            for k in range(8): add('strst',b+k*.5,.35,[bs+24,bs+24,f+24,bs+24][k%4],0.65)
            add('tuba',b,.5,bs,0.95); add('tuba',b+.75,.25,bs,0.6); add('tuba',b+2,.5,f,0.8); add('tuba',b+2.75,.25,bs,0.6)
            grid('logd',b,'x.xx .x.x x.xx .xx.',.25,55,0.7); grid('tom',b,'x... ..x. x... ..xx',.25,48,0.8)
            grid('kick',b,'x... x... x... x...',.25,60,0.45); grid('snare',b,'.... x... .... x...',.25,60,0.3)
            chord('organ',b,4,up,0.3)
            for k in (1,3): chord('chant',b+k,.35,up,0.7)
            if i%4==3: chord('chant',b+3.5,.3,up,0.9)
            if p==1: chord('choir',b,4,[x+12 for x in up],0.4); add('strhi',b,4,up[-1]+24,0.4)
        MB('brass',off,4,M,1.0); MB('horn',off,4,M,0.45,-12)
        add('crash',off,2,60,0.8); snare_roll(off+62,2,0.2,0.8); timp_roll(off+60,4,'D2',0.3,1.0)
    finish_loop('Volcano','Tiki Boss',6200,E(180,0.48,0.42,1),0.115)
def escape():
    # SELF-PROMPT: lava rising, get out NOW. 168 BPM. One 8-bar phrase climbs keys each time (Cm, Dm, Ebm, Fm)
    # so it keeps feeling like it is rising; 16th strings, pounding kick/toms, ticking woodblock, brass + string lead.
    setup2(168,128)
    prog=['Cm','Ab','Bb','G','Cm','Ab','Db','G']
    M=["C5 .5, D5 .5, Eb5 .5, G5 .5, C6 1, G5 1","Ab5 .5, G5 .5, F5 .5, Eb5 .5, C5 2","D5 .5, F5 .5, Bb5 .5, F5 .5, D5 1, Bb4 1","B4 .5, D5 .5, F5 .5, G5 .5, B5 2",
       "C6 1, G5 1, Eb5 1, G5 1","Ab5 1, C6 1, Eb6 2","Db6 1, Ab5 1, F5 1, Db5 1","B4 1, D5 1, F5 .5, G5 .5, Ab5 .5, B5 .5"]
    for s,t in enumerate((0,2,3,5)):
        off=s*32
        for i,(b,up,bs,f) in enumerate(H(off,4,prog,t)):
            for k in range(16): add('strst',b+k*.25,.2,[bs+24,bs+31,bs+36,bs+31][k%4],0.6 if k%2==0 else 0.4)
            for k in range(4): add('tuba',b+k,.4,bs if k%2==0 else f,0.85); 
            add('cbass',b,4,bs,0.5); chord('str',b,4,up,0.3+0.03*s)
            grid('kick',b,'x...x...x...x...',.25,60,0.55); grid('snare',b,'....x.......x..x',.25,60,0.35)
            grid('tom',b,'..x...x...x..xx.',.25,52,0.5); grid('wblk',b,'x.o.x.o.x.o.x.o.',.25,60,0.3)
            if i%2==1: chord('stab',b+3,.3,up,0.8); chord('stab',b+3.5,.3,up,0.9)
            if s>=2: chord('choir',b,4,[x+12 for x in up],0.35)
        MB('brass',off,4,M,1.0,t); MB('strhi',off,4,M,0.35+0.05*s,t)
        if s>=1: MB('horn',off,4,M,0.45,t-12)
        add('crash',off,2,60,0.7); snare_roll(off+30,2,0.2,0.9); timp_roll(off+28,4,'G1',0.3,1.0)
    finish_loop('Volcano','Escape',6800,E(150,0.45,0.38,1),0.115)
for fn in (jungle_base,ashy_ascent,the_creator,tiki_boss,escape): fn()
