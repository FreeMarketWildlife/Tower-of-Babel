"""Export integer-enlarged animation previews from native roster sprite sheets."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).parent/'exports'
manifest=json.loads((root/'manifest.json').read_text())
actions=['walk','sprint','mine','use','yay','pet']
motions=manifest['motions'];rows=manifest['rows'];jump=manifest['jumpOffset']
font=ImageFont.load_default(size=16)
small=ImageFont.load_default(size=12)
sheets={s['id']:Image.open(root/(s['id']+'-spritesheet.png')).convert('RGBA') for s in manifest['roster']}
def stage(species,state,frame,scale):
 image=Image.new('RGB',(64,48),'#fff3d6');g=ImageDraw.Draw(image);g.rectangle((3,42,60,42),fill='#d8c397')
 if state=='mine':
  g.rectangle((43,35,50,41),fill='#737e78');g.rectangle((44,34,49,38),fill='#9b9b91')
 if state=='use':
  g.rectangle((40,40,47,41),fill='#704939');g.rectangle((40,38,47,39),fill='#c28d60')
 row=rows.index(state);sprite=sheets[species].crop((frame*40,row*32,frame*40+40,row*32+32))
 image.paste(sprite,(10,11+(jump[frame] if state=='yay' else 0)),sprite)
 return image.resize((64*scale,48*scale),Image.Resampling.NEAREST)
# Each critter gets a single six-action animation for convenient review.
for s in manifest['roster']:
 frames=[]
 for tick in range(64):
  image=Image.new('RGB',(600,388),'#f7e8c4');g=ImageDraw.Draw(image);g.text((10,8),s['name']+' / 40 x 32',font=font,fill='#49313f')
  for n,state in enumerate(actions):
   x=6+(n%3)*198;y=34+(n//3)*174;f=tick*70//motions[state]['ms']%motions[state]['frames']
   g.text((x,y),state.title(),font=font,fill='#49313f');image.paste(stage(s['id'],state,f,3),(x,y+22))
  frames.append(image)
 frames[0].save(root/(s['id']+'-six-actions.gif'),save_all=True,append_images=frames[1:],duration=70,loop=0,disposal=2)
# Six full-cast overviews allow comparing the same action across all species.
for state in actions:
 frames=[]
 for tick in range(motions[state]['frames']):
  image=Image.new('RGB',(670,634),'#f7e8c4');g=ImageDraw.Draw(image);g.text((8,8),'CRITZ / ALL 25 / '+state.upper(),font=font,fill='#49313f')
  for n,s in enumerate(manifest['roster']):
   x=6+n%5*132;y=34+n//5*118
   label=s['name'].replace('African brush-tailed porcupine','Brush-tailed porcupine').replace('Pygmy spotted skunk','Spotted skunk')
   if len(label)>19:
    cut=label.rfind(' ',0,19);lines=[label[:cut],label[cut+1:]]
   else:lines=[label]
   for k,label_line in enumerate(lines):g.text((x,y+k*12),label_line,font=small,fill='#49313f')
   image.paste(stage(s['id'],state,tick,2),(x,y+22))
  frames.append(image)
 frames[0].save(root/('all-25-'+state+'.gif'),save_all=True,append_images=frames[1:],duration=motions[state]['ms'],loop=0,disposal=2)
print('Exported 25 six-action critter GIFs and six full-cast motion GIFs.')
