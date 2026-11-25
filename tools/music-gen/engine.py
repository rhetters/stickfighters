import numpy as np
from scipy.signal import butter, lfilter
from scipy.io import wavfile
SR=32000; rng=np.random.default_rng(7)
SPB=60/84; L=SR; LOOP=SR; mixL=np.zeros(L); mixR=np.zeros(L); notes=[]
def brr(x,bits=5):
    x=x/(np.max(np.abs(x))+1e-9); out=np.zeros_like(x); lv=2**(bits-1)
    for i in range(0,len(x),16):
        b=x[i:i+16]; s=np.max(np.abs(b))+1e-9; out[i:i+16]=np.round(b/s*lv)/lv*s
    return out
def looped_additive(period,ncyc_attack,ncyc_loop,amps_attack,amps_sus,noise_amt,noise_len,bits=5):
    f0=SR/period; n_att=period*ncyc_attack; n_loop=period*ncyc_loop; N=n_att+n_loop
    t=np.arange(N)/SR; morph=np.clip(np.arange(N)/n_att,0,1); x=np.zeros(N)
    for k in range(1,len(amps_sus)+1):
        if f0*k>=SR/2: break
        a=amps_attack[k-1]*(1-morph)+amps_sus[k-1]*morph
        x+=a*np.sin(2*np.pi*f0*k*t+0.3*k)
    nz=rng.standard_normal(N)*noise_amt*np.exp(-np.arange(N)/(noise_len+1)); nz[n_att:]=0
    x+=lfilter(*butter(2,5000/(SR/2)),nz)
    return dict(data=brr(x,bits),ls=n_att,ll=n_loop,base=f0)
def oneshot(x,base,bits=5): return dict(data=brr(x,bits),ls=None,ll=None,base=base)
K=np.arange(1,64)
strings=looped_additive(64,24,2,1.3/K**0.7,1.0/K**1.1,0.5,500)
brass=looped_additive(64,20,1,1.0/K**0.6,1.0/K**0.85*(1+0.6*np.exp(-((K-4)/3)**2)),0.25,200)
tuba=looped_additive(128,16,1,1.0/K**0.9,1.0/K**1.3,0.2,300)
fa=np.zeros(63); fa[:4]=[1,0.25,0.12,0.05]; flute=looped_additive(64,30,1,fa*0.8,fa,0.35,900)
t=np.arange(int(SR*1.2))/SR
hx=sum((0.9**k)/k*np.sin(2*np.pi*400*k*t)*np.exp(-t*(2.5+2.0*k)) for k in range(1,12)); hx[:30]*=np.linspace(0,1,30); harp=oneshot(hx,400)
cx=np.sin(2*np.pi*800*t)*np.exp(-t*3)+0.4*np.sin(2*np.pi*3200*t)*np.exp(-t*9)+0.2*np.sin(2*np.pi*800*2.76*t)*np.exp(-t*6); celesta=oneshot(cx,800)
t=np.arange(int(SR*1.8))/SR
tx=sum(a*np.sin(2*np.pi*100*r*t)*np.exp(-t*d) for r,a,d in [(1,1,2.2),(1.5,.5,3),(1.99,.35,3.5),(2.44,.2,4.5),(2.9,.1,6)])*(1+0.15*np.exp(-t*30))
tx+=lfilter(*butter(2,1200/(SR/2)),rng.standard_normal(len(t)))*np.exp(-t*25)*0.6; timp=oneshot(tx,100)
t=np.arange(int(SR*0.35))/SR
sx=lfilter(*butter(2,[900/(SR/2),7000/(SR/2)],'band'),rng.standard_normal(len(t)))*np.exp(-t*16)*1.6+np.sin(2*np.pi*185*t)*np.exp(-t*30)*0.7; snare=oneshot(sx,261.63)
t=np.arange(int(SR*0.4))/SR
kick=oneshot(np.sin(2*np.pi*np.cumsum(55+110*np.exp(-t*35))/SR)*np.exp(-t*9),261.63)
t=np.arange(int(SR*2.5))/SR
crash=oneshot(lfilter(*butter(2,3500/(SR/2),'high'),rng.standard_normal(len(t)))*np.exp(-t*1.8),261.63,bits=4)
ob=1.0/K**1.0*(1+1.8*np.exp(-((K-4)/2.0)**2)); ob[0]=0.5; oboe=looped_additive(64,22,1,ob*0.9,ob,0.3,400)
cl=np.where(K%2==1,1.0/K**0.9,0.08/K); clar=looped_additive(64,22,1,cl*0.9,cl,0.25,500)
hn=1.0/K**1.6; hn[1]*=1.3; horn=looped_additive(64,20,1,hn*1.1,hn,0.15,300)
chv=np.array([np.exp(-((k*500-700)/220)**2)+0.6*np.exp(-((k*500-1150)/250)**2)+0.25*np.exp(-((k*500-2700)/400)**2) for k in K])+0.02/K
choir=looped_additive(64,30,2,chv*0.7,chv,0.5,1500)
t=np.arange(int(SR*0.8))/SR
pz=sum((0.85**k)/k*np.sin(2*np.pi*220*k*t)*np.exp(-t*(7+3*k)) for k in range(1,14)); pz[:20]*=np.linspace(0,1,20); pizz=oneshot(pz,220)
t=np.arange(int(SR*0.9))/SR
marimba=oneshot(np.sin(2*np.pi*500*t)*np.exp(-t*7)+0.35*np.sin(2*np.pi*1965*t)*np.exp(-t*22)+0.1*np.sin(2*np.pi*4600*t)*np.exp(-t*40),500)
t=np.arange(int(SR*0.15))/SR
woodblock=oneshot((np.sin(2*np.pi*1100*t)+0.5*np.sin(2*np.pi*1730*t))*np.exp(-t*60),261.63)
t=np.arange(int(SR*0.3))/SR
tamb=oneshot(lfilter(*butter(2,[6000/(SR/2),11000/(SR/2)],'band'),rng.standard_normal(len(t)))*np.exp(-t*18)*(1+0.5*np.sin(2*np.pi*38*t)),261.63,bits=4)
def I(s,adsr,vib=(0,1,1),voices=(0,),gain=0.3): return dict(s=s,adsr=adsr,vib=vib,voices=voices,gain=gain)
INST={'str':I(strings,(0.12,0.3,0.8,0.35),(14,5.5,0.35),(-7,7),0.30),'strhi':I(strings,(0.25,0.4,0.85,0.5),(12,5.8,0.4),(-8,8),0.22),
 'cbass':I(strings,(0.08,0.3,0.85,0.3),gain=0.45),'brass':I(brass,(0.03,0.25,0.75,0.2),(10,5.2,0.45),gain=0.42),
 'stab':I(brass,(0.01,0.12,0.35,0.12),gain=0.30),'tuba':I(tuba,(0.04,0.25,0.8,0.2),gain=0.55),
 'flute':I(flute,(0.08,0.3,0.85,0.3),(18,5.0,0.3),gain=0.38),'harp':I(harp,(0.002,0.1,1,0.3),gain=0.22),
 'cel':I(celesta,(0.002,0.1,1,0.4),gain=0.18),'timp':I(timp,(0.002,0.1,1,0.6),gain=0.75),'snare':I(snare,(0.001,0.1,1,0.1),gain=0.30),
 'kick':I(kick,(0.001,0.1,1,0.1),gain=0.55),'crash':I(crash,(0.001,0.1,1,0.8),gain=0.22),
 'oboe':I(oboe,(0.06,0.3,0.85,0.25),(16,5.2,0.3),gain=0.34),'clar':I(clar,(0.06,0.3,0.85,0.3),gain=0.36),
 'horn':I(horn,(0.07,0.3,0.85,0.3),(8,5.0,0.4),(-5,5),0.40),'choir':I(choir,(0.35,0.5,0.9,0.6),(10,4.8,0.5),(-9,9),0.22),
 'pizz':I(pizz,(0.002,0.1,1,0.12),gain=0.40),'mar':I(marimba,(0.002,0.1,1,0.3),gain=0.30),'wblk':I(woodblock,(0.001,0.1,1,0.05),gain=0.20),
 'tamb':I(tamb,(0.001,0.1,1,0.1),gain=0.16),'strst':I(strings,(0.01,0.08,0.45,0.08),voices=(-6,6),gain=0.26)}
PAN={'str':-0.25,'strhi':0.35,'cbass':0.0,'brass':0.15,'stab':-0.1,'tuba':0.05,'flute':0.3,'harp':-0.45,'cel':0.45,'timp':-0.15,
 'snare':0.2,'kick':0.0,'crash':-0.3,'oboe':0.25,'clar':-0.35,'horn':-0.2,'choir':0.0,'pizz':-0.3,'mar':0.4,'wblk':0.45,'tamb':0.35,'strst':-0.15}
NAMES={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def m(n):
    if isinstance(n,(int,np.integer)): return int(n)
    p=NAMES[n[0]]; i=1
    while i<len(n) and n[i] in '#b': p+=1 if n[i]=='#' else -1; i+=1
    return p+12*(int(n[i:])+1)
def add(inst,beat,dur,note,vel=1.0): notes.append((inst,beat,dur,m(note),vel))
def render():
    for inst,beat,dur,midi,vel in notes:
        Ii=INST[inst]; s=Ii['s']; a,d,su,r=Ii['adsr']
        st=int(beat*SPB*SR); nd=dur*SPB; n=int((nd+2.5*r)*SR)+64
        if st+n>L: n=L-st
        if n<=64: continue
        tt=np.arange(n)/SR
        env=np.where(tt<a,tt/max(a,1e-4),su+(1-su)*np.exp(-(tt-a)/max(d,1e-3)))
        eo=np.interp(nd,tt,env) if nd<tt[-1] else env[-1]
        rel=tt>=nd; env[rel]=eo*np.exp(-(tt[rel]-nd)/(r/3))
        fo=min(256,n//4); env[-fo:]*=np.linspace(1,0,fo); env[:16]*=np.linspace(0,1,16)
        f=440*2**((midi-69)/12); depth,rate,delay=Ii['vib']
        vib=2**(depth/1200*np.sin(2*np.pi*rate*tt)*np.clip((tt-delay)/0.3,0,1))
        out=np.zeros(n); data=s['data']
        for cents in Ii['voices']:
            inc=f*2**(cents/1200)/s['base']*vib; pos=np.cumsum(inc)-inc[0]
            if s['ls'] is not None:
                ls,ll=s['ls'],s['ll']; over=pos>=ls; pos[over]=ls+np.mod(pos[over]-ls,ll); valid=1.0
            else:
                valid=np.clip((len(data)-2-pos)/200.0,0,1); pos=np.minimum(pos,len(data)-2)
            i0=pos.astype(int); fr=pos-i0; i1=i0+1
            if s['ls'] is not None: i1=np.where(i1>=s['ls']+s['ll'],s['ls'],i1)
            out+=(data[i0]*(1-fr)+data[i1]*fr)*valid
        out*=env*vel*Ii['gain']/np.sqrt(len(Ii['voices'])); p=PAN[inst]
        mixL[st:st+n]+=out*np.sqrt((1-p)/2)*1.414; mixR[st:st+n]+=out*np.sqrt((1+p)/2)*1.414
def seq(inst,start,items,vel=1.0,octave_shift=0):
    b=start
    for nt,dur in items:
        if nt is not None: add(inst,b,dur,m(nt)+12*octave_shift,vel)
        b+=dur
def chord(inst,beat,dur,ns,vel=1.0):
    for n in ns: add(inst,beat,dur,n,vel)
def timp_roll(beat,dur,note,v0=0.3,v1=0.8):
    k=int(dur*4)
    for i in range(k): add('timp',beat+i*0.25,0.3,note,(v0+(v1-v0)*i/max(k-1,1))*(0.85+0.15*rng.random()))
def snare_roll(beat,dur,v0=0.2,v1=0.8):
    k=int(dur*8)
    for i in range(k): add('snare',beat+i*0.125,0.15,60,v0+(v1-v0)*i/max(k-1,1))
def snes_echo(x,delay_ms=176,fb=0.52,vol=0.42,fir=(0.10,0.22,0.30,0.22,0.10,0.04,0.02,0.0)):
    D=int(SR*delay_ms/1000); fir=np.array(fir); y=np.zeros(len(x)+D); buf=np.zeros(len(x)+D)
    for s in range(0,len(x),D):
        e=min(s+D,len(x))
        if s>=D:
            lo=s-D-7; hist=buf[max(lo,0):e-D]
            if lo<0: hist=np.concatenate([np.zeros(-lo),hist])
            filt=np.convolve(hist,fir,'valid')[:e-s]
        else: filt=np.zeros(e-s)
        buf[s:e]=x[s:e]+fb*filt; y[s:e]=filt
    return x+vol*y[:len(x)]
