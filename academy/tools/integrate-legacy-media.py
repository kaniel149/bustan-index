"""Preserve legacy lesson source text while replacing its superseded visual blocks."""
from pathlib import Path
from html.parser import HTMLParser
import json,re
root=Path(__file__).resolve().parents[1]
fragments=json.loads((root/'media/fragments.json').read_text())
void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Tree(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=False);self.text=text;self.lines=[0];self.nodes=[];self.stack=[]
  for m in re.finditer('\n',text):self.lines.append(m.end())
  self.feed(text)
 def source_offset(self):
  row,col=self.getpos();return self.lines[row-1]+col
 def handle_starttag(self,tag,attrs):
  start=self.source_offset();n={'tag':tag,'attrs':dict(attrs),'start':start,'end':start+len(self.get_starttag_text()),'parent':self.stack[-1] if self.stack else None,'children':[]}
  self.nodes.append(n)
  if n['parent']:n['parent']['children'].append(n)
  if tag not in void:self.stack.append(n)
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if self.stack and self.stack[-1]['tag']==tag:self.stack.pop()
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i]['tag']==tag:
    end=self.text.find('>',self.source_offset())+1
    for n in self.stack[i:]:n['end']=end
    del self.stack[i:];break

def classes(n):return set((n['attrs'].get('class') or '').split())
def ancestor(n,predicate):
 while n:
  if predicate(n):return n
  n=n['parent']

for path in (root/'courses').glob('*.html'):
 slug=path.stem
 if slug not in fragments:continue
 s=path.read_text()
 s=re.sub(r'<!-- BUSTAN (?:VISUAL|VIDEO) START -->[\s\S]*?<!-- BUSTAN (?:VISUAL|VIDEO) END -->','',s)
 tree=Tree(s);remove=[]
 for n in tree.nodes:
  if n['tag']=='img' and ('lesson-image' in classes(n) or n['attrs'].get('src','').startswith('../images/')):remove.append(ancestor(n,lambda x:'image-container' in classes(x)) or n)
  if 'video-section' in classes(n):remove.append(n)
  if n['tag']=='iframe':
   section=ancestor(n,lambda x:x['tag']=='section')
   if section and all(c['tag'] in ('h2','h3') or classes(c)&{'video-section','video-container','video-caption'} for c in section['children']): remove.append(section)
   else:remove.append(ancestor(n,lambda x:bool(classes(x)&{'video-section','video-container','video-wrapper'})) or n)
  if 'video-caption' in classes(n):remove.append(n)
 ranges=sorted(set((n['start'],n['end']) for n in remove))
 outer=[]
 for a,b in ranges:
  if outer and a<=outer[-1][1]:outer[-1]=(outer[-1][0],max(b,outer[-1][1]))
  else:outer.append((a,b))
 for a,b in reversed(outer):s=s[:a]+s[b:]
 tree=Tree(s)
 first=next(n for n in tree.nodes if n['tag']=='section' and 'lesson-section' in classes(n))
 s=s[:first['end']]+fragments[slug]['visual']+s[first['end']:]
 quiz=re.search(r'<section\b[^>]*class="[^"]*quiz-section[^>]*>',s)
 if not quiz:raise ValueError('No quiz '+slug)
 s=s[:quiz.start()]+fragments[slug]['video']+s[quiz.start():]
 s=s.replace('paths-20260907','media-20260907').replace('academy-20260907','media-20260907')
 if 'assets/media-learning.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="../assets/media-learning.css?v=media-20260907"><script src="../assets/media-learning.js?v=media-20260907" defer></script>\n</head>')
 s=re.sub(r'^[ \t]+(?=\n)','',s,flags=re.M)
 path.write_text(s)
print('Legacy media integrated without altering lesson text or quizzes')
