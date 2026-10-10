"""Compose inspection GIFs from native, hand-authored exported pixels."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).parent/'exports'
timing=json.loads((root/'timing.json').read_text())
states=['walk','sprint','mine','use','yay','pet']
jump=[0,0,0,-2,-5,-5,-3,-1,0,0]
frames={s:[Image.open(root/f'{s}-{f}.png').convert('RGBA') for f in range(m['frames'])] for s,m in timing.items()}
def stage(state,f):
 im=Image.new('RGB',(80,64),'#fff3d6');g=ImageDraw.Draw(im);g.rectangle((10,51,69,51),fill='#d8c397')
 if state=='mine':
  g.rectangle((53,44,62,50),fill='#737e78');g.rectangle((54,43,61,48),fill='#9b9b91')
 if state=='use':
  g.rectangle((51,48,58,50),fill='#704939');g.rectangle((51,46,58,47),fill='#c28d60')
 im.paste(frames[state][f],(22,20+(jump[f] if state=='yay' else 0)),frames[state][f])
 return im.resize((320,256),Image.Resampling.NEAREST)
for s,m in timing.items():
 images=[stage(s,f) for f in range(m['frames'])]
 images[0].save(root/f'{s}.gif',save_all=True,append_images=images[1:],duration=m['ms'],loop=0,disposal=2)
font=ImageFont.load_default(size=20)
overview=[]
for tick in range(80):
 im=Image.new('RGB',(984,628),'#f7e8c4');g=ImageDraw.Draw(im);g.text((16,8),'CRITZ / WOOD MOUSE / 40 x 32 NATIVE',font=font,fill='#49313f')
 for n,s in enumerate(states):
  x=12+(n%3)*324;y=44+(n//3)*288;m=timing[s];f=(tick*70//m['ms'])%m['frames']
  g.text((x,y),s.title(),font=font,fill='#49313f');im.paste(stage(s,f),(x,y+26))
 overview.append(im)
overview[0].save(root/'wood-mouse-six-actions.gif',save_all=True,append_images=overview[1:],duration=70,loop=0,disposal=2)
print('Exported 7 action/idle GIFs and six-action overview.')
