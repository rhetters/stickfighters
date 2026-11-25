EB=E(120,0.35,0.3)
def catapult():
    # creak wind-up (accelerating woodblock + low pizz steps), THWACK, launch glissando up, triumphant stab
    setup2(120,8)
    for j,bt in enumerate([0,.4,.7,.9,1.05]): add('wblk',bt,.1,60,0.5+0.1*j); add('pizz',bt,.2,['C3','D3','E3','F3','G3'][j],0.6)
    add('timp',1.25,1,'C2',1.0); add('kick',1.25,.3,60,1.0); add('crash',1.25,1,60,0.4)
    gliss('flute',1.3,0.9,'C5','C7',0.6); gliss('harp',1.3,0.9,'C4','C6',0.5); gliss('strst',1.3,0.9,'C4','C6',0.4)
    chord('brass',2.3,1.2,['C5','E5','G5','C6'],1.0); chord('str',2.3,1.6,['C4','G4','E5'],0.6); add('tuba',2.3,1.2,'C2',0.9)
    add('cel',2.6,1,'G6',0.4); add('cel',2.85,1,'C7',0.4); add('crash',2.3,1.5,60,0.5)
    finish_one('Catapult',7000,EB)
def rope_swing():
    # swoop down then up (U-shaped harp/strings), playful "whee" flute, landing chord
    setup2(120,8)
    gliss('harp',0,0.9,'G6','C4',0.55); gliss('strst',0,0.9,'G5','C3',0.35)
    gliss('harp',0.9,0.9,'C4','G6',0.55); gliss('strst',0.9,0.9,'C3','G5',0.35)
    seq('flute',0.2,[('G5',.3),('E5',.3),('C5',.6),('E5',.3),('G5',.3),('C6',.6)],0.7)
    add('tamb',0.9,.2,60,0.6); add('wblk',1.8,.1,60,0.6)
    chord('brass',2.0,1.0,['E5','G5','C6'],0.9); chord('pizz',2.0,.5,['C3','G3','C4'],0.8); add('tuba',2.0,.8,'C2',0.8); add('glock',2.0,1,'C7',0.5)
    finish_one('Rope Swing',7000,EB)
def gondola():
    # exit: gentle 3/4 tune drifting off, getting softer; approach: tune returns, growing, settles on a chord
    setup2(132,9)
    for k,n in enumerate(['G5','E5','C5','D5','B4','G4']): add('flute',k*.5,.5,n,0.8-0.1*k); add('harp',k*.5,.5,m(n)-12,0.5-0.06*k)
    add('pizz',0,.5,'C3',0.5); add('pizz',1.5,.5,'G2',0.35)
    for k,n in enumerate(['G4','B4','D5','F5','E5','G5']): add('flute',4+k*.5,.5,n,0.3+0.1*k); add('harp',4+k*.5,.5,m(n)-12,0.2+0.06*k)
    add('pizz',4,.5,'G2',0.35); add('pizz',5.5,.5,'G2',0.5)
    chord('horn',7,1.3,['C4','E4','G4'],0.8); chord('str',7,1.5,['C4','G4','E5'],0.5); add('cel',7,1,'C6',0.4); add('tuba',7,1,'C2',0.6)
    finish_one('Gondola',7000,EB)
def balloon():
    # float up (rising harp arps, airy flute waltz), drift, then gentle descending landing and soft chord
    setup2(116,7)
    for k,n in enumerate(['C4','E4','G4','C5','E5','G5','C6']): add('harp',k*.25,1,n,0.45)
    seq('flute',0.5,[('E5',.5),('G5',.5),('C6',1)],0.7); chord('strhi',0.5,2,['C5','E5','G5'],0.3)
    for k,n in enumerate(['G5','E5','D5','B4','G4']): add('harp',3+k*.3,1,n,0.4); add('pizz',3+k*.3,.3,m(n)-12,0.4)
    seq('flute',3,[('D5',.6),('B4',.6),('G4',.8)],0.55)
    chord('horn',5,1.2,['C4','E4','G4'],0.7); chord('str',5,1.5,['C4','G4','E5'],0.45); add('glock',5,1,'E6',0.35); add('tuba',5,1,'C2',0.5)
    finish_one('Hot Air Balloon',7000,EB)
def sewer_pipe():
    # plunge down (descending marimba/tuba chromatic slide), gurgle, then POP up and land on a chord
    setup2(130,7)
    for k in range(10): add('mar',k*.12,.2,79-k*3,0.5); add('tuba',k*.12,.15,52-k*2,0.4)
    for k in range(5): add('wblk',1.4+k*.12,.1,60,0.2); add('mar',1.4+k*.12,.15,40+k*4,0.3)
    add('kick',2.1,.3,60,0.8); gliss('pizz',2.1,0.4,'C4','C6',0.6); add('glock',2.5,1,'G6',0.5)
    chord('brass',2.6,0.9,['E5','G5','C6'],0.85); add('tuba',2.6,.8,'C2',0.8); add('tamb',2.6,.2,60,0.6)
    finish_one('Sewer Pipe',6500,E(100,0.3,0.25))
def ladder():
    # hand-over-hand climb: alternating pizz/marimba step-ups, tiny snare taps, flourish at the top
    setup2(140,8)
    sc=['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5']
    for k,n in enumerate(sc): add('pizz' if k%2==0 else 'mar',k*.5,.4,n if k%2==0 else m(n)+12,0.7); add('wblk',k*.5,.1,60,0.25)
    add('snare',6,.2,60,0.4); gliss('harp',6,0.5,'C5','C6',0.5)
    chord('horn',6.5,1.3,['C4','E4','G4','C5'],0.85); chord('str',6.5,1.5,['C4','G4','E5'],0.5); add('glock',6.5,1,'C7',0.4); add('tuba',6.5,1,'C2',0.7)
    finish_one('Ladder Climb',7000,EB)
def gate():
    # BOOM ... BOOM ... CRASH: battering-ram hits, then victorious fanfare
    setup2(120,8)
    for bt,v in ((0,0.8),(0.75,0.9)):
        add('timp',bt,1,'C2',v); add('kick',bt,.3,60,v); chord('stab',bt,.3,['C3','G3','C4'],v); add('tom',bt,.3,45,v)
    snare_roll(1.25,.5,0.3,0.9)
    add('timp',1.75,1,'C2',1.0); add('kick',1.75,.3,60,1.0); add('crash',1.75,2,60,1.0); add('tom',1.75,.3,40,1)
    seq('brass',2.25,[('G4',.25),('C5',.25),('E5',.25)],0.9); chord('brass',3,1.2,['C5','E5','G5','C6'],1.0)
    chord('str',3,1.4,['C4','G4','E5'],0.6); add('tuba',3,1,'C2',0.9); add('timp',3,1,'C2',0.7)
    finish_one('Gate Destruction',6800,E(140,0.35,0.3,1))
def rocket_launch():
    # countdown ticks, rising pad + snare roll crescendo, ignition boom and soaring brass fanfare
    setup2(120,8)
    for k,n in enumerate(['G5','G5','G5']): add('glock',k*.5,.3,n,0.5); add('wblk',k*.5,.1,60,0.5)
    gliss('strst',1.5,1.0,'C3','C5',0.5,(0,1,2,3,4,5,6,7,8,9,10,11)); chord('pad',1.5,1,['C4','G4'],0.6); snare_roll(1.5,1,0.15,0.9)
    timp_roll(1.5,1,'G1',0.3,0.9)
    add('kick',2.5,.3,60,1.0); add('timp',2.5,1,'C2',1.0); add('crash',2.5,2,60,0.9)
    seq('brass',2.5,[('C5',.33),('G5',.33),('C6',1)],1.0); chord('str',2.5,1.5,['C4','G4','E5','C6'],0.6)
    chord('horn',2.83,1,['E4','G4','C5'],0.7); add('tuba',2.5,1.3,'C2',0.9); gliss('cel',2.8,0.8,'C6','C7',0.35)
    finish_one('Rocket Launch',7000,E(160,0.4,0.35,1))
def rocket_landing():
    # descending approach (falling synth + strings), slowing retro-pulses, soft thud, floaty arrival chord
    setup2(100,7)
    gliss('sq',0,1.2,'C6','C4',0.5); gliss('strst',0,1.2,'G5','G3',0.35)
    for k,bt in enumerate([1.2,1.6,2.1,2.7]): add('pizz',bt,.3,'C3',0.6-0.1*k); add('glock',bt,.3,'G5',0.3-0.05*k)
    add('kick',3.2,.3,60,0.6); add('timp',3.2,1,'C2',0.6)
    chord('choir',3.3,1.5,['E4','G4','B4','D5'],0.6); chord('pad',3.3,1.5,['C4','G4'],0.5); add('ther',3.3,1.5,'E5',0.6); add('cel',3.5,1,'B6',0.4); add('cbass',3.3,1.5,'C2',0.5)
    finish_one('Rocket Landing',6500,E(240,0.5,0.4,1),maxs=4.0)
for fn in (catapult,rope_swing,gondola,balloon,sewer_pipe,ladder,gate,rocket_launch,rocket_landing): fn()
