import os
from numpy.fft import irfft
OUT='/home/claude/game/out'
Ko=np.arange(1,64)
acc_a=1.0/Ko**0.5*(1+1.5*np.exp(-((Ko-5)/2.5)**2)); acc_a[0]=0.6
accs=looped_additive(64,6,1,acc_a,acc_a,0.1,60)
org_a=np.zeros(63)
for k,a in {1:1,2:.8,3:.5,4:.4,6:.25,8:.2,10:.08}.items(): org_a[k-1]=a
organ=looped_additive(64,4,1,org_a,org_a,0.05,40)
saw=1.0/Ko**1.0; saw[0]=0.8
sqs=looped_additive(64,10,1,saw*1.2,saw,0.05,60)
def oneshot_fn(f,dur,parts,att_noise=0.0,nd=40,base=None):
    t=np.arange(int(SR*dur))/SR
    x=sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t*d) for r,a,d in parts)
    if att_noise: x=x+lfilter(*butter(2,4000/(SR/2)),rng.standard_normal(len(t)))*np.exp(-t*nd)*att_noise
    x[:16]*=np.linspace(0,1,16); x[-200:]*=np.linspace(1,0,200)
    return oneshot(x,base or f)
steel=oneshot_fn(440,1.0,[(1,1,3.5),(2,.55,5),(3.0,.3,7),(4.02,.18,10),(5.95,.08,14)],0.15,60)
glock=oneshot_fn(1000,1.2,[(1,1,2.5),(2.76,.4,6),(5.4,.2,12)])
logd=oneshot_fn(200,0.6,[(1,1,12),(2.4,.45,22),(3.9,.15,35)],0.2,80)
t=np.arange(int(SR*0.7))/SR
tomx=np.sin(2*np.pi*np.cumsum(100*(1+0.6*np.exp(-t*25)))/SR)*np.exp(-t*6)+lfilter(*butter(2,2500/(SR/2)),rng.standard_normal(len(t)))*np.exp(-t*40)*0.4
tomx[-200:]*=np.linspace(1,0,200); tom=oneshot(tomx,100)
t=np.arange(int(SR*0.12))/SR
shak=oneshot(lfilter(*butter(2,[4500/(SR/2),11000/(SR/2)],'band'),rng.standard_normal(len(t)))*np.minimum(t/0.01,1)*np.exp(-t*35),261.63,bits=4)
N=16384; fr=np.fft.rfftfreq(N,1/SR); sp=np.exp(-((np.log(fr+1)-np.log(600))/0.6)**2)*np.exp(1j*2*np.pi*rng.random(len(fr)))
wind=dict(data=brr(irfft(sp,N),5),ls=0,ll=N,base=261.63)
INST.update({'acc':I(accs,(0.03,0.2,0.85,0.12),voices=(-13,13),gain=0.26),'fiddle':I(strings,(0.04,0.2,0.8,0.12),(20,6.0,0.15),gain=0.36),
 'organ':I(organ,(0.01,0.1,0.95,0.15),voices=(-4,4),gain=0.22),'sq':I(sqs,(0.01,0.2,0.8,0.12),(12,6.0,0.2),(-6,6),0.24),
 'pad':I(sqs,(0.6,0.5,0.9,0.8),(6,0.5,0),(-12,12),0.12),'ther':I(flute,(0.15,0.3,0.9,0.4),(40,6.5,0.1),gain=0.36),
 'steel':I(steel,(0.002,0.1,1,0.2),gain=0.30),'glock':I(glock,(0.002,0.1,1,0.5),gain=0.16),'logd':I(logd,(0.002,0.1,1,0.1),gain=0.40),
 'tom':I(tom,(0.002,0.1,1,0.2),gain=0.45),'shak':I(shak,(0.002,0.1,1,0.05),gain=0.14),'wind':I(wind,(1.2,0.5,0.9,1.5),(60,0.3,0),gain=0.30),
 'chant':I(choir,(0.03,0.15,0.6,0.15),voices=(-10,10),gain=0.30)})
PAN.update({'acc':0.3,'fiddle':-0.25,'organ':0.0,'sq':0.2,'pad':0.0,'ther':0.1,'steel':-0.3,'glock':0.4,'logd':-0.35,'tom':0.25,'shak':0.45,'wind':-0.2,'chant':0.0})
Q={'':[0,4,7],'m':[0,3,7],'7':[0,4,7,10],'m7':[0,3,7,10],'maj7':[0,4,7,11],'dim':[0,3,6],'aug':[0,4,8],'sus4':[0,5,7],'sus2':[0,2,7],'dim7':[0,3,6,9],'add9':[0,4,7,14]}
def ch(name):
    r=name[0]; i=1
    if len(name)>1 and name[1] in '#b': r+=name[1]; i=2
    q=name[i:]; sl=None
    if '/' in q: q,sl=q.split('/')
    pc=m(r+'4')%12; up=sorted(55+((pc+iv-55)%12) for iv in Q[q])
    bp=pc if sl is None else m(sl+'4')%12; b=28+((bp-4)%12)
    return up,b,b+7
def H(off,bpb,prog,t=0):
    for i,n in enumerate(prog):
        up,b,f=ch(n); yield off+i*bpb,[x+t for x in up],b+t,f+t
def P(s):
    out=[]
    for tok in s.split(','):
        tok=tok.strip()
        if tok: n,d=tok.split(); out.append((None if n=='r' else n,float(eval(d))))
    return out
def MB(inst,off,bpb,bars,vel=1.0,t=0):
    for i,s in enumerate(bars):
        items=P(s); tot=sum(d for _,d in items)
        if abs(tot-bpb)>1e-6: print('  WARN bar',inst,i,tot)
        bb=off+i*bpb
        for n,d in items:
            if n is not None: add(inst,bb,d,m(n)+t,vel)
            bb+=d
def grid(inst,b,pat,step,note=60,vel=1.0):
    for i,c in enumerate(pat.replace(' ','')):
        if c=='x': add(inst,b+i*step,step,note,vel)
        elif c=='o': add(inst,b+i*step,step,note,vel*0.55)
def arp(inst,b,dur,ns,step,vel=1.0,o=0):
    for j in range(int(round(dur/step))): add(inst,b+j*step,step*1.5,ns[j%len(ns)]+o,vel)
def gliss(inst,b,dur,n0,n1,vel=1.0,scale=(0,2,4,5,7,9,11)):
    lo,hi=sorted((m(n0),m(n1))); ns=[x for x in range(lo,hi+1) if x%12 in scale]
    if m(n0)>m(n1): ns=ns[::-1]
    st=dur/len(ns)
    for j,x in enumerate(ns): add(inst,b+j*st,st*2,x,vel)
def setup2(bpm,beats):
    global SPB,L,mixL,mixR,LOOP
    SPB=60.0/bpm; LOOP=int(round(beats*SPB*SR)); L=LOOP+6*SR; mixL=np.zeros(L); mixR=np.zeros(L); notes.clear()
def E(d,fb,v,dark=0):
    fir=[(0.12,0.22,0.27,0.22,0.1,0.05,0.02,0.0),(0.06,0.15,0.24,0.25,0.17,0.08,0.04,0.01),(0.03,0.1,0.2,0.26,0.22,0.12,0.05,0.02)][dark]
    return dict(delay_ms=d,fb=fb,vol=v,fir=fir),dict(delay_ms=d+12,fb=fb,vol=v*0.88,fir=fir)
def finish_loop(folder,name,lp,ech,rms=0.11):
    render(); out=[]
    for mx,kw in ((mixL,ech[0]),(mixR,ech[1])):
        y=mx[:LOOP].copy(); y[:L-LOOP]+=mx[LOOP:]
        y3=lfilter(*butter(2,lp/(SR/2)),np.tile(y,3)); y3=snes_echo(y3,**kw); out.append(y3[LOOP:2*LOOP])
    st=np.stack(out,1); st*=rms/np.sqrt((st**2).mean()); st=np.clip(np.tanh(st*1.1)/1.1,-0.89,0.89)
    os.makedirs(f'{OUT}/{folder}',exist_ok=True); wavfile.write(f'{OUT}/{folder}/{name}.wav',SR,(st*32767).astype(np.int16))
    print(folder,'/',name,round(LOOP/SR,1),'s peak',round(float(np.abs(st).max()),2),'notes',len(notes),flush=True)
def finish_one(name,lp,ech,maxs=4.0):
    render(); n=int(maxs*SR); out=[]
    for mx,kw in ((mixL,ech[0]),(mixR,ech[1])):
        out.append(snes_echo(lfilter(*butter(2,lp/(SR/2)),mx[:n]),**kw))
    st=np.stack(out,1); a=np.abs(st).max(1); last=np.where(a>2e-3*a.max())[0][-1]; st=st[:last+1]
    st=np.tanh(st/np.abs(st).max()*0.9)/np.tanh(0.9)*0.72
    f=int(SR*0.35); st[-f:]*=(np.linspace(1,0,f)**2)[:,None]; st[:64]*=np.linspace(0,1,64)[:,None]
    os.makedirs(f'{OUT}/Transitions',exist_ok=True); wavfile.write(f'{OUT}/Transitions/{name}.wav',SR,(st*32767).astype(np.int16))
    print('Transition',name,round(len(st)/SR,2),'s',flush=True)
