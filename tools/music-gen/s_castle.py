# ===== CASTLE SIEGE (re-render of approved tracks + new King Boss) =====
def woodland():
    setup2(104,128)
    C={'Em':(['E3','G3','B3'],'E2','B1'),'D':(['D3','F#3','A3'],'D2','A1'),'C':(['C3','E3','G3'],'C2','G1'),'B7':(['D#3','F#3','A3'],'B1','F#1'),'G':(['D3','G3','B3'],'G1','D2'),'Am':(['C3','E3','A3'],'A1','E2')}
    prog=['Em','D','C','D','Em','D','C','B7','G','D','Em','C','Am','Em','C','B7']
    mel=[[('B4',1),('E5',1),('F#5',.5),('G5',.5),('A5',1)],[('F#5',2),('E5',.5),('D5',.5),('E5',1)],[('G5',1.5),('F#5',.5),('E5',1),('C5',1)],[('D5',3),('A4',1)],
     [('B4',1),('E5',1),('G5',1),('B5',1)],[('A5',1.5),('G5',.5),('F#5',2)],[('E5',1),('G5',1),('C6',1.5),('B5',.5)],[('B5',2),('A5',.5),('G5',.5),('F#5',1)],
     [('G5',1.5),('D5',.5),('B4',1),('D5',1)],[('F#5',1.5),('E5',.5),('D5',2)],[('E5',1),('G5',1),('B5',1),('G5',1)],[('A5',2),('G5',1),('E5',1)],
     [('C6',1.5),('B5',.5),('A5',1),('E5',1)],[('G5',1.5),('F#5',.5),('E5',2)],[('E5',1),('F#5',1),('G5',1),('A5',1)],[('B5',2),('D#5',1),('F#5',1)]]
    for p in range(2):
        for i,cn in enumerate(prog):
            b=(p*16+i)*4; ns,root,fifth=C[cn]
            chord('str',b,4,ns,0.32 if p==0 else 0.42)
            for k,n in enumerate([root,fifth,m(root)+12,fifth]): add('pizz',b+k,0.5,n,0.9 if k==0 else 0.65)
            if p==0:
                seq('flute',b,mel[i],0.85); seq('clar',b,mel[i],0.3,octave_shift=-1)
                if i%2==1:
                    for k,n in enumerate(ns+[m(ns[0])+12]): add('harp',b+2+k*0.5,.5,m(n)+12,0.45)
            else:
                seq('horn',b,mel[i],0.9,octave_shift=-1); add('flute',b,2,m(ns[2])+24,0.55); add('flute',b+2,2,m(ns[1])+24,0.5)
                for k in range(8): add('harp',b+k*0.5,.5,m((ns+[m(ns[0])+12])[k%4])+12,0.4)
            add('tamb',b+1,.2,60,0.6); add('tamb',b+3,.2,60,0.6)
            if i%4==3: add('wblk',b+3.5,.1,60,0.6)
            add('timp',b,1,'E2' if cn in ('Em','C','Am') else 'B1',0.35 if p==0 else 0.5)
            if p==1 and i%4==0: chord('horn',b,4,ns,0.25)
    add('cel',34,2,'E6',0.3); add('cel',98,2,'B5',0.3); snare_roll(126,2,0.08,0.35)
    finish_loop('Castle Siege','The Woodland Trail',7000,E(120,0.42,0.35))
def sewers():
    setup2(88,128)
    C={'Cm':(['C3','Eb3','G3'],'C2','G1'),'Ab':(['C3','Eb3','Ab3'],'Ab1','Eb2'),'G7':(['B2','D3','F3'],'G1','D2'),'Fm':(['C3','F3','Ab3'],'F1','C2'),'Db':(['Db3','F3','Ab3'],'Db2','Ab1')}
    progA=['Cm','Cm','Ab','G7','Cm','Cm','Ab','G7']; progB=['Fm','Cm','Db','G7','Fm','Cm','Db','G7']
    A=[[('C4',.5),(None,.5),('Eb4',.5),(None,.5),('D4',.5),('Eb4',.5),('F4',1)],[('G4',1.5),('F#4',.5),('G4',1),(None,1)],[('Ab4',.5),(None,.5),('G4',.5),('F4',.5),('Eb4',1),('C4',1)],[('D4',1.5),('Eb4',.5),('B3',2)],
       [('C4',.5),(None,.5),('Eb4',.5),(None,.5),('G4',.5),('Ab4',.5),('G4',1)],[('C5',1.5),('B4',.5),('Bb4',1),('A4',1)],[('Ab4',1),('F4',1),('D4',1),('F4',1)],[('G4',3),(None,1)]]
    B=[[('F4',1),('Ab4',1),('C5',2)],[('Eb5',1.5),('D5',.5),('C5',2)],[('Db5',1),('F5',1),('Ab4',1),('Db5',1)],[('B4',3),(None,1)],[('Ab4',1),('C5',1),('F5',1.5),('Eb5',.5)],[('D5',1),('C5',1),('G4',2)],[('F4',1),('Ab4',1),('Db5',1),('C5',1)],[('B4',1),('D5',1),('G4',2)]]
    dr=np.random.default_rng(3); drip=['C6','Eb6','G6','Bb5','F6','C7','G5']
    for sec in range(4):
        prog=progA if sec%2==0 else progB; mel=A if sec%2==0 else B
        for i,cn in enumerate(prog):
            b=(sec*8+i)*4; ns,root,fifth=C[cn]
            for k in range(4):
                n=[root,fifth,root,m(fifth)+1 if k==3 and i%2 else fifth][k]; add('tuba',b+k,.35,n,0.8 if k==0 else 0.6); add('pizz',b+k,.3,m(n)+12,0.5)
            if sec%2==0:
                seq('clar',b,mel[i],0.9,octave_shift=-1 if sec==0 else 0)
                if sec==2: seq('flute',b,mel[i],0.3,octave_shift=1)
            else:
                seq('oboe',b,mel[i],0.8)
                if sec==3: seq('str',b,mel[i],0.35,octave_shift=-1)
            chord('strhi',b,4,[m(ns[0])+24,m(ns[0])+25] if i%4==3 else [m(ns[1])+24],0.18)
            if i%2==1: chord('stab',b+2.5,.3,ns,0.45); chord('stab',b+3,.3,ns,0.5)
            add('wblk',b+1.5,.1,60,0.35); add('wblk',b+3.5,.1,60,0.25)
            if i%4==0: add('timp',b,1,'C2',0.4)
            for _ in range(dr.integers(0,3)): add('mar' if dr.random()<.6 else 'cel',b+dr.integers(0,8)*0.5,1,drip[dr.integers(0,len(drip))],0.25+0.25*dr.random())
    timp_roll(124,4,'G1',0.1,0.5)
    finish_loop('Castle Siege','The Sewers',4300,E(280,0.62,0.58,2),0.10)
def castle():
    setup2(116,128)
    C={'Gm':(['G3','Bb3','D4'],'G1','D2'),'Eb':(['G3','Bb3','Eb4'],'Eb2','Bb1'),'F':(['F3','A3','C4'],'F1','C2'),'D':(['F#3','A3','D4'],'D2','A1'),'Cm':(['G3','C4','Eb4'],'C2','G1'),'D7':(['F#3','C4','D4'],'D2','A1'),'Bb':(['F3','Bb3','D4'],'Bb1','F2')}
    prog=['Gm','Eb','F','D','Gm','Eb','Cm','D7','Bb','F','Gm','Eb','Cm','Gm','Eb','D7']
    mel=[[('G4',1.5),('D4',.5),('G4',1),('Bb4',1)],[('G4',1.5),('Bb4',.5),('Eb5',2)],[('D5',1),('C5',.75),('Bb4',.25),('C5',1),('A4',1)],[('F#4',3),('D4',1)],
       [('G4',1.5),('D4',.5),('G4',1),('Bb4',1)],[('Eb5',1.5),('D5',.5),('C5',1),('Bb4',1)],[('C5',1),('Eb5',1),('G5',1.5),('F5',.5)],[('F#5',3),('D5',1)],
       [('F5',1.5),('D5',.5),('Bb4',1),('D5',1)],[('C5',1.5),('A4',.5),('F4',2)],[('D5',1),('G5',1),('F5',.75),('Eb5',.25),('D5',1)],[('Eb5',2),('Bb4',1),('G4',1)],
       [('C5',1.5),('D5',.5),('Eb5',1),('G5',1)],[('G5',1.5),('F5',.5),('D5',2)],[('Eb5',1),('D5',1),('C5',1),('Bb4',1)],[('A4',2),('C5',1),('F#4',1)]]
    for p in range(2):
        full=p==1
        for i,cn in enumerate(prog):
            b=(p*16+i)*4; ns,root,fifth=C[cn]; r3=m(root)+24
            for k,n in enumerate([r3,r3,r3+7,r3,r3+12,r3,r3+7,r3+3 if cn not in ('D','D7','F','Bb','Eb') else r3+4]): add('strst',b+k*.5,.4,n,0.75 if k%2==0 else 0.55)
            add('tuba',b,.8,root,0.9); add('tuba',b+2,.8,fifth,0.75); add('cbass',b,4,m(root)-12,0.6)
            add('timp',b,1,'G1' if root[0] in 'GCE' else 'D2',0.7); add('timp',b+2,1,'D2',0.45)
            add('snare',b+1,.2,60,0.28); add('snare',b+3,.2,60,0.28); add('snare',b+3.5,.2,60,0.15)
            if not full: seq('horn',b,mel[i],0.95,octave_shift=-1); chord('str',b,4,ns,0.3)
            else:
                seq('brass',b,mel[i],0.95); seq('strhi',b,mel[i],0.4); seq('horn',b,mel[i],0.5,octave_shift=-1)
                chord('choir',b,4,[m(x)+12 for x in ns],0.55); chord('str',b,4,ns,0.45)
                if i%2==1: chord('stab',b+3,.3,ns,0.7); chord('stab',b+3.5,.3,ns,0.8)
        add('crash',p*64,2,60,0.45 if not full else 0.75)
    timp_roll(62,2,'D2',0.3,0.8); snare_roll(62,2,0.15,0.55); timp_roll(124,4,'D2',0.3,0.9); snare_roll(124,4,0.15,0.6)
    finish_loop('Castle Siege','The Castle',6200,E(200,0.5,0.45,1))
def king_boss():
    # SELF-PROMPT: the King — regal fanfare gone tyrannical. C minor, 144 BPM. Organ + brass royal dotted fanfares,
    # 16th snare march, timpani, choir; strings saw 8ths. Grand, dangerous, ceremonial.
    setup2(144,128)
    prog=['Cm','Cm','Ab','G','Cm','Fm','Db','G','Ab','Bb','Cm','Cm','Fm','Db','G','G']
    M=["C5 .75, C5 .25, G5 1, Eb5 .75, D5 .25, C5 1","G4 .75, C5 .25, Eb5 .5, G5 .5, C6 2","Ab5 .75, G5 .25, F5 .5, Eb5 .5, C5 2","D5 .75, Eb5 .25, F5 .5, D5 .5, B4 2",
       "C5 .75, C5 .25, G5 1, Eb5 .75, F5 .25, G5 1","Ab5 1, C6 1, F5 2","Db6 .75, C6 .25, Ab5 .5, F5 .5, Db5 2","B4 .5, D5 .5, F5 .5, Ab5 .5, G5 2",
       "Eb5 1, Ab5 1, C6 1.5, Bb5 .5","D6 .75, C6 .25, Bb5 .5, F5 .5, D5 2","Eb5 .5, G5 .5, C6 .5, G5 .5, Eb6 2","D6 .5, C6 .5, B5 .5, C6 .5, G5 2",
       "Ab5 1, F5 1, C5 1, F5 1","Ab5 1, F5 1, Db5 1, F5 1","G5 .75, F5 .25, Eb5 .5, D5 .5, B4 1, D5 1","G5 2, r 2"]
    for p in range(2):
        off=p*64
        for i,(b,up,bs,f) in enumerate(H(off,4,prog)):
            chord('organ',b,4,up,0.45 if p==0 else 0.35); add('cbass',b,4,bs,0.7)
            for k in range(8): add('strst',b+k*.5,.4,(bs+24 if k%4!=2 else f+24),0.7 if k%2==0 else 0.5)
            add('tuba',b,.6,bs,0.95); add('tuba',b+1.5,.4,bs,0.6); add('tuba',b+2,.6,f,0.8)
            grid('snare',b,'x.xo x.xo xoxo x.xx',.25,60,0.35); grid('kick',b,'x...x...x...x...',.25,60,0.5)
            add('timp',b,1,'C2' if bs%12 in (0,8,5) else 'G1',0.8)
            if i%2==1: chord('stab',b+3,.3,up,0.8); chord('stab',b+3.5,.3,up,0.9)
            if p==1: chord('choir',b,4,[x+12 for x in up],0.5)
        MB('brass',off,4,M,1.0); MB('organ',off,4,M,0.4 if p==0 else 0.3,-12)
        if p==1: MB('strhi',off,4,M,0.45)
        add('crash',off,2,60,0.8); timp_roll(off+60,4,'G1',0.3,1.0); snare_roll(off+62,2,0.2,0.8)
    finish_loop('Castle Siege','King Boss',6400,E(176,0.48,0.42,1),0.115)
for fn in (woodland,sewers,castle,king_boss): fn()
