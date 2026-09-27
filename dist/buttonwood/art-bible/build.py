#!/usr/bin/env python3
"""Rebuild the illustrated reading companion; ART-BIBLE.md is authoritative.

Dependencies: reportlab, Pillow. Run export-assets.cjs first when art changes.
The PDF does not establish a separate source of rules or claim deferred art exists.
"""
from pathlib import Path
from html import escape
import hashlib
import os
import re
import shutil
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image

HERE = Path(__file__).resolve().parent
ART = HERE.parent
ROOT = ART.parent.parent
ASSETS = HERE / 'assets'
OUTPUT = ROOT / 'output/pdf/buttonwood-art-bible.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
P = dict(re.findall(r"(\w+):\s*'(#[0-9a-fA-F]{6})'", (ART/'palette.js').read_text()))
W, H = 816, 672
M = 48
PAPER = '#fcf6e7'
INK = P['ink']
MUTED = '#715a60'
RULE = '#d9c8ad'
fonts = Path(os.environ.get('BUTTONWOOD_FONT_DIR', '/System/Library/Fonts/Supplemental'))
for name, file in [('Book','Georgia.ttf'),('BookItalic','Georgia Italic.ttf'),('Sans','Arial.ttf'),('Bold','Arial Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(fonts/file)))
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='Bold', italic='Sans', boldItalic='Bold')
C = canvas.Canvas(str(OUTPUT), pagesize=(W,H), pageCompression=1)
C.setTitle('Buttonwood / The illustrated art bible')
C.setAuthor('Buttonwood art direction')
C.setSubject('Illustrated companion to the canonical Buttonwood ART-BIBLE.md')
PAGE = 0
LAYOUT = []

def fill(color): C.setFillColor(HexColor(color))
def stroke(color): C.setStrokeColor(HexColor(color))
def rect(x,y,w,h,color):
    fill(color); C.rect(x,H-y-h,w,h,fill=1,stroke=0)
def line(x,y,x2,y2,color=RULE,width=.6):
    stroke(color);C.setLineWidth(width);C.line(x,H-y,x2,H-y2)
def text(s,x,y,size=12,font='Sans',color=INK):
    fill(color);C.setFont(font,size);C.drawString(x,H-y-size*.82,s)
def right(s,x,y,size=12,font='Sans',color=INK):
    fill(color);C.setFont(font,size);C.drawRightString(x,H-y-size*.82,s)
def para(s,x,y,w,size=11.5,leading=16,color=INK,font='Sans'):
    style=ParagraphStyle('body',fontName=font,fontSize=size,leading=leading,textColor=HexColor(color),spaceAfter=0)
    p=Paragraph(s,style);_,h=p.wrap(w,H)
    if y+h>H-46: raise ValueError(f'Page {PAGE}: paragraph extends to {y+h:.1f}: {s[:50]}')
    p.drawOn(C,x,H-y-h)
    LAYOUT.append((PAGE,x,y,w,h,s[:80]))
    return y+h
def tag(s,x,y,color='mint',width=None):
    width=width or pdfmetrics.stringWidth(s,'Bold',8)+16
    rect(x,y,width,19,P.get(color,color));text(s,x+8,y+5,8,'Bold')
def image(name,x,y,w=None,h=None,frame=False):
    path=Path(name) if isinstance(name,Path) else ASSETS/(name+'.png')
    im=Image.open(path);iw,ih=im.size
    if w is None and h is None:w,h=iw,ih
    elif w is None:w=h*iw/ih
    elif h is None:h=w*ih/iw
    C.drawImage(ImageReader(im),x,H-y-h,width=w,height=h,mask='auto')
    if frame:
        stroke(RULE);C.setLineWidth(.7);C.rect(x,H-y-h,w,h,fill=0,stroke=1)
    return h
def pixel(name,x,y,zoom=1):
    path=ASSETS/(name+'.png');im=Image.open(path)
    if zoom!=1:im=im.resize((im.width*zoom,im.height*zoom),Image.Resampling.NEAREST)
    C.drawImage(ImageReader(im),x,H-y-im.height,width=im.width,height=im.height,mask='auto')
def page(section, title, deck='', status=None):
    global PAGE
    if PAGE:C.showPage()
    PAGE+=1;rect(0,0,W,H,PAPER)
    text('BUTTONWOOD',M,25,10,'Bold');text('/  THE ILLUSTRATED ART BIBLE',M+105,26,8,'Sans',MUTED)
    right(section.upper(),W-M,26,8,'Bold',MUTED);line(M,46,W-M,46)
    text(title,M,66,30,'Book')
    if deck:para(deck,M,110,W-2*M,12,17,MUTED)
    if status:tag(status,M,149)
    line(M,H-37,W-M,H-37)
    text('READING COMPANION  /  Rules: ART-BIBLE.md  /  Coverage: INVENTORY.md',M,H-25,7,'Sans',MUTED)
    right(f'{PAGE:02d}',W-M,H-26,9,'Bold')
def caption(s,x,y,w=720):return para(s,x,y,w,8.7,12,MUTED)
def label(s,x,y,size=9):text(s.upper(),x,y,size,'Bold',MUTED)
def block(num,title,s,x,y,w):
    text(num,x,y,23,'Book',P['coralShade']);text(title,x+37,y+2,13,'Bold')
    para(s,x+37,y+27,w-37,11,15)
def grid(x,y,cols,rows,cell=32):
    for a in range(cols+1):line(x+a*cell,y,x+a*cell,y+rows*cell,RULE,.5)
    for b in range(rows+1):line(x,y+b*cell,x+cols*cell,y+b*cell,RULE,.5)

# 01: Cover. The original approved image is embedded whole and unmodified.
page('Edition 01 / September 2026','', '')
rect(0,47,W,87,P['ink'])
text('Buttonwood',M,64,42,'Book',P['creamLight'])
right('ART BIBLE',W-M,77,19,'Bold',P['mintLight'])
text('Terraria craft. Minecraft logic. Buttonwood soul.',M,151,22,'Book')
image(ART/'reference/buttonwood-approved.png',108,193,w=600)
caption('The approved concept. Native game sprites interpret this direction; the concept is not a sprite sheet.',108,603,600)

# 02: Direction.
page('01 / North star','A place worth building.',
     'A warm, handmade settlement with a readable block world underneath every soft curve.')
image('scene-day',56,167,w=704)
caption('APPROVED NATIVE ART / Deterministic scene assembled from the existing world generators, at 1 art pixel per PDF point.',56,413,704)
block('01','Warmth before clutter','Cream hats, coral roofs, mint trim and gold buttons make a recognizable family. Give useful shapes room to breathe.',48,458,223)
block('02','The grid is honest','Building and terrain art must respect placement, support and excavation. Ornament can soften the silhouette without rewriting it.',296,458,223)
block('03','Life at small scale','Show work with attached hands, planted feet and purposeful tools. Read the Worker and the action before the decoration.',544,458,224)

# 03: Interpretation rather than visual cloning.
page('02 / Inspiration','Borrow the principle. Find our voice.',
     'The references guide decisions. Buttonwood keeps its own palette, proportions, buildings and visual identity.')
cols=[(48,'TERRARIA','Craft in a side-view world',P['coralLight']),(296,'MINECRAFT','Material and construction logic',P['mintLight']),(544,'BUTTONWOOD','A handmade settlement',P['creamShade'])]
for x,name,sub,col in cols:
    rect(x,168,224,61,col);text(name,x+17,181,13,'Bold');para(sub,x+17,205,190,10,13)
items=[
('Observe','Dense worlds remain identifiable through silhouette, material contrast and depth.','Repeated blocks remain useful construction units with recognizable material identity.','Warm characters and curved roof profiles sit against calm, modular terrain.'),
('Translate','Let foreground objects read first; use quiet scenery and a few meaningful highlights.','Preserve the 32-unit cell. Make joins, exposed edges and construction states trustworthy.','Share colored contours, three-tone materials, mint accents and generous quiet areas.'),
('Avoid','Copying sprites, dense ornament everywhere, or using detail as a substitute for hierarchy.','Importing 3D cube perspective into a front-elevation game, or outlining every terrain cell.','A generic fantasy skin, enlarged pixel scales on bigger buildings, or UI from a different world.')]
y=254
for head,a,b,c in items:
    label(head,48,y)
    for x,body in [(48,a),(296,b),(544,c)]:para(body,x,y+24,216,11.5,16)
    y+=118
caption('DESIGN INTERPRETATION / Lessons drawn from official Terraria imagery and Mojang texture resources. Source notes on page 16.',48,610)

# 04: Scale diagram with identical source pixel size.
page('03 / Pixel grammar','One pixel. One world.',
     'The whole camera may zoom. Individual world assets never get their own scale.')
label('MEASURED NATIVE STUDY',48,166)
grid(48,207,10,4,32)
pixel('building-home',48,207);pixel('building-forge',224,239);pixel('worker-0',339,303)
line(48,335,381,335,P['ink'],1.2)
text('Home 128 x 128',48,353,10,'Bold');text('Forge 96 x 96',215,353,10,'Bold')
caption('Four blocks high',48,374,150);caption('Three blocks high',215,374,150)
rect(417,172,351,234,P['cream'])
text('32',438,193,47,'Book');text('world units per block',520,207,13,'Bold')
para('Adult Worker: 40 x 32 canvas<br/>Ground anchor: (18, 31)<br/>Worker height: approximately 30 px',438,270,290,13,24)
line(48,435,768,435)
block('A','Start at 1x','Judge silhouette, materials and eye spacing at native resolution before inspecting larger pixels.',48,460,339)
block('B','Draw with integers','Use deliberate connected clusters, stepped curves, one-pixel colored contours and upper-left light.',429,460,339)
rect(48,562,720,45,P['mintLight'])
para('<b>UI lives on its own canvas.</b> Hand-draw each icon and miniature at 32 x 32. Keep building portraits at their native sprite dimensions.',62,571,690,10.5,14)

# 05: Palette, automatically drawn from live tokens.
page('04 / Color & material','A small palette, a rich world.',
     'Exact swatches are read from palette.js. Shadow, base and light describe each material with restraint.')
ramps=[('Cream','cream','creamShade','creamLight'),('Mint','mint','mintShade','mintLight'),('Coral','coral','coralShade','coralLight'),('Timber','wood','woodShade','woodLight'),('Stone','stone','stoneShade','stoneLight'),('Loam','dirt','dirtShade','dirtLight'),('Grass','grass','grassShade','grassLight'),('Water','water','waterShade','waterLight'),('Lava','lava','lavaShade','lavaLight'),('Deep stone','deep','deepShade','deepLight')]
for i,(title,base,shade,light) in enumerate(ramps):
    x=48+(i%5)*147;y=174+(i//5)*151
    text(title,x,y,12,'Bold')
    for j,token in enumerate([shade,base,light]):rect(x+j*43,y+26,43,45,P[token])
    caption(f'{P[shade]} / {P[base]}<br/>{P[light]}',x,y+80,137)
line(48,480,768,480)
for i,(name,title) in enumerate([('dirt','Loam'),('stone','Stone'),('wood','Timber'),('leaves','Leaves'),('deepslate','Depth'),('obsidian','Obsidian')]):
    x=48+i*86;pixel('tile-'+name,x,512,2);caption(title,x,583,75)
para('<b>Quiet material planes.</b><br/>Use sparse directional marks, shared outlines and deliberate clusters. Add a new ramp only through the shared palette and scene review.',590,513,178,11,16)

# 06: Ground construction.
page('05 / Block logic','Connected terrain. Honest edges.',
     'Our world is made of cells; its ground should read as continuous soil and stone.')
image('terrain-field',48,178,w=384)
caption('APPROVED NATIVE TERRAIN / 12 x 6 cells. Shared world-coordinate texture, exposed sod, a cave opening and soil-to-stone transitions.',48,381,384)
block('1','Same material joins','Hide internal tile borders. Never add a dark outline around each occupied cell.',468,177,300)
block('2','Exposed edges','Use short material-colored bevels and controlled corners. Keep the full solid cell silhouette.',468,282,300)
block('3','One owner per boundary','Step the transition inside occupied cells. Resolve concave corners as carefully as straight edges.',468,389,300)
rect(48,467,384,124,P['cream'])
label('EDGE REVIEW MATRIX',63,482)
for i,s in enumerate(['Solid field / exposed top / outside corner','Concave corner / mixed material / excavation','Placed aligned / moved piece / rotated piece']):text(s,63,510+i*23,11)
para('<b>Visuals follow the simulation.</b> Natural neighbors come from the terrain grid. Only stationary, aligned placed bodies share external joins. Texture never changes support, placement or saves.',468,518,300,11,16)

# 07: Worker poses and rhythm.
page('06 / Workers','Small people. Clear intentions.',
     'Keep the broad cream hat, mint band, short overalls, gold buttons and stable planted feet.')
for i in range(3):pixel(f'worker-{i}',48+i*140,174,3)
rect(495,174,273,104,P['cream'])
para('<b>40 x 32 canvas</b><br/>Ground anchor (18, 31)<br/>One-pixel walk rise at most<br/>Shared proportions; varied skin and hair',511,189,241,11,19)
caption('APPROVED APPEARANCES / 3x inspection enlargement. These are adults with chibi proportions.',48,280,425)
label('WALK / SIX FRAMES / 110 MS EACH',48,320)
for i in range(6):
    pixel(f'worker-walk-{i}',48+i*120,347,2);line(48+i*120,409,128+i*120,409,P['coralShade'],.8);text(str(i),48+i*120,419,9,'Bold',MUTED)
label('WORK / SIX GALLERY POSES / 90 MS EACH',48,461)
for i in range(6):
    pixel(f'worker-work-{i}',48+i*120,486,2);text(str(i),48+i*120,558,9,'Bold',MUTED)
caption('ENGINE TRUTH / The renderer starts at impact pose 3 and follows recovery poses 4-5 (270 ms total). Pre-strike anticipation, children and new actions remain deferred.',48,586,720)

# 08: Architecture.
page('07 / Buildings','A family with five distinct jobs.',
     'Keep front elevations, Worker-scale openings and stable foundations. Give each function a memorable opening.')
builds=[('home','Home','Welcoming doorway',48,190),('workshop','Workshop','Open working bay',277,190),('forge','Forge','Compact fire mouth',530,222),('storehouse','Storehouse','Broad loading doors',96,403),('blacksmith','Blacksmith','Open anvil bay',404,403)]
for name,title,sub,x,y in builds:
    pixel('building-'+name,x,y);size=Image.open(ASSETS/f'building-{name}.png').size
    text(title,x,y+size[1]+13,13,'Bold');caption(sub,x,y+size[1]+35,220)
rect(663,189,105,151,P['mintLight'])
para('<b>Same art pixel.</b><br/><br/>Bigger buildings use more canvas area. Their pixels do not get bigger.',676,204,79,10,14)
caption('APPROVED NATIVE SPRITES / Home and Workshop 128 x 128; Forge 96 x 96; Storehouse and Blacksmith 160 x 128.',48,608)

# 09: Two compositions.
page('08 / Miniatures','An icon is a drawing, too.',
     'Preserve the identifying roof, opening and accent. Recompose each building on a new 32 x 32 canvas.')
pixel('building-home',72,194,2)
text('WORLD SPRITE',72,467,10,'Bold',MUTED);caption('128 x 128 source, shown at 2x for inspection.',72,489,270)
pixel('mini-home',463,216,4)
text('UI MINIATURE',451,369,10,'Bold',MUTED);caption('32 x 32 source, shown at 4x for inspection.',451,391,275)
rect(431,435,337,77,P['cream'])
para('<b>Same identity. New composition.</b><br/>The miniature retains the coral roof, cream wall, mint shutter and welcoming doorway with fewer details.',447,450,305,11,15)
label('NATIVE UI SIZE / 32 X 32',48,549)
for i,name in enumerate(['home','workshop','storehouse','forge','blacksmith']):
    pixel('mini-'+name,48+i*130,576);text(name.capitalize(),91+i*130,587,9,'Sans',MUTED)

# 10: Time.
page('09 / Light & atmosphere','A day that breathes.',
     'Temporal color can move smoothly while every spatial edge stays made of pixels.')
for i,(name,title,sub) in enumerate([('sunrise','SUNRISE','0-30s / 30 seconds'),('day','DAY','30-150s / 120 seconds'),('sunset','SUNSET','150-180s / 30 seconds'),('night','NIGHT','180-240s / 60 seconds')]):
    x=48+(i%2)*368;y=175+(i//2)*188
    image('scene-'+name,x,y,w=352)
    text(title,x,y+132,10,'Bold');right(sub,x+352,y+132,9,'Sans',MUTED)
rect(48,557,720,53,P['cream'])
para('<b>One saved clock. One scene wash.</b> The cycle stays 240 seconds. Maximum night tint is 22%; compact warm building lights follow the wash. Sky images here are reduced uniformly for editorial comparison.',62,568,690,11,16)

# 11: Interface.
page('10 / Interface','The UI belongs to the village.',
     'Cream surfaces, warm outlines and native pixel icons. Keep the world visible and the next action legible.')
label('APPROVED NATIVE ICONS / 32 X 32',48,169)
icons=['move','stone-pick','iron-pick','steel-pick','titanium-pick','craft','details','wood','stone','dirt','deepslate','leaves','obsidian','bucket','water','lava']
for i,name in enumerate(icons):
    x=48+(i%8)*90;y=198+(i//8)*80;pixel('ui-'+name,x+18,y)
    caption(name.replace('-',' ').capitalize(),x,y+42,88)
line(48,363,768,363)
label('FUTURE CONTROL STATES / SCHEMATIC, NOT A SHIPPED REDESIGN',48,384)
for i,(title,bg,border) in enumerate([('Rest',PAPER,P['outline']),('Hover',P['cream'],P['outline']),('Selected',P['mintLight'],P['ink']),('Unavailable',PAPER,RULE)]):
    x=48+i*108;rect(x,412,88,72,bg);stroke(border);C.setLineWidth(1.2);C.rect(x,H-484,88,72,fill=0,stroke=1)
    if i==3:C.saveState();C.setFillAlpha(.35)
    pixel('ui-stone-pick',x+28,421)
    if i==3:C.restoreState()
    if i==3:text('No target',x+24,459,8,'Bold')
    if i==2:rect(x+4,477,80,3,P['ink'])
    caption(title,x,493,100)
para('<b>Use more than color.</b><br/>Selection has an edge or marker. Focus stays visible. Warnings pair a native icon with short text. Tooltips and accessible labels carry names.',514,411,254,11.5,17)
rect(48,547,720,64,P['cream'])
para('<b>Panels open beside their toolbar trigger.</b> On narrow screens, adapt panel placement and hit areas while keeping 32px icons native. Use short labels, useful numbers, clear quantities and a stable focus order.',64,560,688,11.5,16)

# 12: Quantitative UI standards, kept separate from shipped-coverage claims.
page('11 / UI standards','Readable by design.',
     'STANDARD FOR NEW WORK / These are project targets. Existing controls have not all been migrated or audited.')
rect(48,170,264,198,P['cream'])
stroke(P['ink']);C.setLineWidth(1);C.rect(68,H-238,44,44,fill=0,stroke=1)
pixel('ui-craft',74,200)
text('44 x 44',130,198,20,'Book');text('CSS px touch target',130,228,10)
para('<b>32 x 32 artwork</b> remains native inside a larger interactive area. Schematic: one CSS px shown as one PDF point; actual viewing size varies.',65,264,230,10.5,15)
text('14-16 px',349,181,30,'Book');text('Body and help text',349,223,12,'Bold')
text('12 px+',579,181,30,'Book');text('Essential quantities',579,223,12,'Bold')
para('Use a 4/8/12/16px spacing rhythm. Reflow panels before reducing icon size. Keep focus distinct from selection, and explain unavailable actions with a readable reason.',349,266,419,11.5,17)
label('OPAQUE SRGB TOKEN PAIRS / NORMAL TEXT TARGET 4.5:1',48,401)
pairs=[('ink','cream','9.64:1','Preferred body text'),('ink','mintLight','7.12:1','Selected-row text'),('woodShade','cream','6.40:1','Warm secondary text'),('mintShade','cream','3.77:1','Below text target'),('coralShade','cream','3.99:1','Below text target'),('creamLight','mintShade','4.15:1','Below text target')]
for i,(fg,bg,ratio,note) in enumerate(pairs):
    x=48+(i%3)*246;y=433+(i//3)*67
    rect(x,y,224,37,P[bg]);text('Aa  012',x+10,y+10,17,'Bold',P[fg]);right(ratio,x+214,y+12,13,'Bold',P[fg]);caption(note,x,y+43,224)
caption('W3C: 4.5:1 normal text; 3:1 large text / meaningful non-text edges. WCAG AA target minimum is 24px with exceptions; 44px is our stronger project standard. Full references and exceptions: ART-BIBLE.md sections 4 and 9.',48,580,720)
for title,url,x in [('Text contrast','https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',48),('Control contrast','https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html',203),('Target size','https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',376),('Use of color','https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html',509)]:
    text(title,x,612,8,'Bold',MUTED);C.linkURL(url,(x,H-622,x+140,H-610),relative=0,thickness=0)

# 13: Future worlds; names follow the canonical exploration sequence.
page('12 / World horizons','From rooted meadow to open sky.',
     'EXPLORATION / A visual roadmap for the tower\'s upward ambition, not a promise of new biomes or mechanics.')
rect(48,169,720,86,P['mintLight'])
text('Rooted meadow',65,183,20,'Book');para('CURRENT BASELINE / Care, shelter and a workable beginning. Rich loam, gentle hills, coral roofs and warm windows.',303,186,444,11.5,17)
zones=[('Deep workshops','Cool layered rock, timber braces and tiny hearths. Keep deposits and safe open space readable.',['deepShade','deep','wood','lava']),('High scaffold','Long block-built verticals against open sky. Decoration must never invent support or wind physics.',['sky','cream','woodShade','wood']),('Cloud frontier','Quiet sky, stepped cloud masses, sparse silhouettes. Clouds are not implied platforms.',['nightSky','sky','creamShade','creamLight']),('Heaven / confrontation','Severe repeated forms, immense negative space, concentrated cream/gold light. Keep Workers handmade.',['ink','stone','creamLight','gold'])]
for i,(title,body,colors) in enumerate(zones):
    x=48+(i%2)*368;y=280+(i//2)*149
    for j,col in enumerate(colors):rect(x+j*88,y,88,28,P[col])
    text(title,x,y+42,18,'Book');para(body,x,y+70,342,11,15)
rect(48,584,720,28,P['cream']);para('<b>Change mood through composition and material proportions first. New ramps require a shared-palette review.</b>',60,591,694,10,13)

# 13: Effects.
page('13 / Motion & effects','Movement should explain the event.',
     'PRESCRIPTIVE STANDARD / New effects communicate cause, material and result without obscuring the world.')
steps=[('CONTACT','A precise event','The tool meets the correct surface on the simulation strike.'),('RESPONSE','A material clue','A few coherent clusters inherit the struck material ramp.'),('RECOVERY','A quiet return','Particles disappear promptly; the next action stays readable.')]
for i,(head,title,body) in enumerate(steps):
    x=48+i*246;rect(x,178,228,183,P['cream']);text(f'0{i+1}',x+16,190,34,'Book',P['coralShade']);label(head,x+16,241);text(title,x+16,264,13,'Bold');para(body,x+16,289,196,11,15)
label('CURRENT ACTIVITY LOOPS',48,392)
rows=[('Fire','4 frames x 180 ms','Compact warm fire mouth'),('Blacksmith hammer','6 frames x 135 ms','Visible working rhythm'),('Smoke','4 poses x 280 ms','Stepped motion, no soft blur')]
for i,(a,b,c) in enumerate(rows):
    y=420+i*41;text(a,48,y,11,'Bold');text(b,245,y,11);text(c,457,y,11);line(48,y+27,768,y+27)
para('<b>Deferred:</b> terrain impacts, rewards, ladder art, death and revival, status feedback, weather and new Worker actions need their own review. Decorative loops never alter crafting duration or resource output.',48,564,720,11,16)

# 14: Brief and acceptance.
page('14 / Production','Make every new asset easy to judge.',
     'Read the canonical bible, inspect the native gallery, then write the smallest brief that preserves the rules.')
rect(48,169,340,335,P['cream'])
label('ASSET BRIEF',65,188)
fields=[('Purpose','What action or state must be recognized?'),('Canvas + anchor','Native size, world/UI role and ground line.'),('Palette + light','Existing named ramps and upper-left light.'),('Neighbors + states','What touches it? What changes over time?'),('Constraints','Footprint, collision, saves and simulation.'),('Review scene','Native view, day/night, UI and motion.')]
y=220
for a,b in fields:
    text(a,65,y,11,'Bold');para(b,65,y+18,304,10.5,14);y+=45
label('ACCEPTANCE GATE',426,181)
checks=[('Reads at 1x','Silhouette and purpose survive native display.'),('Fits the family','Shared palette, pixel scale, contour and material density.'),('Behaves honestly','Anchors, support, quantities and strike timing match the game.'),('Works in context','Day/night, ore, motion, open inventories and phone layout.'),('Ships with evidence','Gallery, focused regressions, native screenshots and inventory entry.')]
y=214
for i,(a,b) in enumerate(checks):
    text(f'{i+1:02d}',426,y,14,'Book',P['coralShade']);text(a,458,y,12,'Bold');para(b,458,y+23,310,10.5,14);y+=67
rect(48,558,340,62,P['mintLight']);para('<b>Approve the family, then expand.</b><br/>A new effect or age variant is not approved simply because its palette matches.',62,568,313,10.5,14)

# 15: handoff and sources. Canonical contents are indexed at build time.
page('15 / Source of truth','Keep the bible alive.',
     'This PDF is the illustrated reading companion. The repository files below carry the complete, maintained rules.')
text('REPOSITORY DIRECTORY / tower-of-babel/buttonwood/',48,147,8,'Bold',MUTED)
files=[('ART-BIBLE.md','Canonical art direction and future visual standards.'),('ART-GUIDE.md','Implementation details, timings and approved native behavior.'),('INVENTORY.md','What is implemented, what is deferred and what needs review.'),('palette.js','Exact named colors and shared Worker animation timings.'),('index.html','Native gallery; inspect size, silhouettes and motion.')]
y=176
for name,desc in files:
    text(name,48,y,12,'Bold');para(desc,239,y,529,11,15)
    line(48,y+30,768,y+30);y+=44
label('RESEARCH / SELECTED PRIMARY REFERENCES / FULL NOTES IN ART-BIBLE.MD',48,421)
sources=[
('Re-Logic / Terraria screenshots','https://store.steampowered.com/app/105600/Terraria/','Scene hierarchy and purposeful local detail.'),
('Re-Logic / Terraria 1.3 UI upgrades','https://terraria.org/news/terraria-1-3-user-interface-upgrades','Historical note: hover, counts and open states.'),
('Mojang / Try the new Minecraft Textures','https://www.minecraft.net/en-us/article/try-new-minecraft-textures','Jasper Boerstra on crisp, coherent textures.'),
('Mojang / Caves & Cliffs developer Q&A','https://www.minecraft.net/en-us/article/caves---cliffs--part-i--dev-q-a','Whole-space cave composition, including ceilings.'),
('cure / Pixel Joint pixel-art tutorial','https://pixeljoint.com/forum/forum_posts.asp?TID=11299','Intentional clusters, ramps, banding and noise.'),
('SLYNYRD / Pixelblog 28: Side View Tiles','https://www.slynyrd.com/blog/2020/5/21/pixelblog-28-side-view-tiles','Tiling and variation; keep our front elevation.'),
('SLYNYRD / Pixelblog 8: Intro to Animation','https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation','Key poses, timing and motion review.'),
('SLYNYRD / Pixelblog 26: UX/UI Design Basics','https://www.slynyrd.com/blog/2020/2/23/pixelblog-26-uxui-design-basics','A coordinated visual language for interface assets.')]
for i,(title,url,desc) in enumerate(sources):
    x=48+(i//4)*368;y=447+(i%4)*36
    text(title,x,y,9.5,'Bold');para(desc,x,y+15,351,8.6,11,MUTED)
    C.linkURL(url,(x,H-y-15,x+352,H-y+2),relative=0,thickness=0)
canonical=ART/'ART-BIBLE.md'
if not canonical.exists():raise FileNotFoundError('Build requires the canonical ART-BIBLE.md to stamp its revision.')
checksum=hashlib.sha256(canonical.read_bytes()).hexdigest()[:12]
caption(f'Edition 01 / September 26, 2026 / Canonical revision: {checksum}. All pictured game art comes from this repository. Research is translated into original Buttonwood rules; no third-party game assets are embedded.',48,595,720)
C.save()
shutil.copyfile(OUTPUT,HERE/'illustrated.pdf')
print(f'Created {OUTPUT} ({PAGE} pages). Canonical revision: {checksum}')
